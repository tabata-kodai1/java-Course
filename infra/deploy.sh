#!/usr/bin/env bash
# アプリ(バックエンド・フロント)を手元でビルドし、S3経由でEC2へ配置して再起動する。
# 前提: terraform apply 済み、EC2に infra/app-setup.sh 適用済み(user_data経由 または SSM経由)
# 使い方: bash infra/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export AWS_CLI_FILE_ENCODING=UTF-8

tf_output() { (cd "$ROOT/infra" && terraform output -raw "$1"); }
BUCKET="$(tf_output artifact_bucket)"
INSTANCE_ID="$(tf_output instance_id)"
DB_HOST="$(tf_output db_endpoint)"
PW_PARAM="$(tf_output db_password_parameter)"
APP_URL="$(tf_output app_url)"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "==> backend をビルド"
(cd "$ROOT/backend" && ./gradlew bootJar -x test --console=plain)
JAR="$(ls "$ROOT"/backend/build/libs/*.jar | grep -v -- '-plain.jar' | head -n 1)"
echo "    jar: $JAR"

echo "==> frontend をビルド"
(cd "$ROOT/frontend" && npm ci && npm run build)
tar -czf "$WORK/frontend.tgz" -C "$ROOT/frontend/dist" .

echo "==> S3 へアップロード (s3://$BUCKET)"
aws s3 cp "$JAR" "s3://$BUCKET/backend.jar" --only-show-errors
aws s3 cp "$WORK/frontend.tgz" "s3://$BUCKET/frontend.tgz" --only-show-errors

echo "==> EC2 に配置して再起動 (SSM)"
CID="$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --parameters "commands=[\"/usr/local/bin/kanban-deploy $BUCKET $DB_HOST $PW_PARAM\"]" \
  --timeout-seconds 300 \
  --query Command.CommandId --output text)"

STATUS="InProgress"
for _ in $(seq 1 60); do
  STATUS="$(aws ssm get-command-invocation --command-id "$CID" --instance-id "$INSTANCE_ID" \
    --query Status --output text 2>/dev/null || echo Pending)"
  case "$STATUS" in InProgress|Pending|Delayed) sleep 5 ;; *) break ;; esac
done

aws ssm get-command-invocation --command-id "$CID" --instance-id "$INSTANCE_ID" \
  --query StandardOutputContent --output text
if [ "$STATUS" != "Success" ]; then
  echo "デプロイ失敗 (status=$STATUS)" >&2
  aws ssm get-command-invocation --command-id "$CID" --instance-id "$INSTANCE_ID" \
    --query StandardErrorContent --output text >&2
  exit 1
fi

echo "==> スモークテスト ($APP_URL)"
echo "    ※ 失敗する場合は自分のIPが変わっていないか確認 (terraform.tfvars の allowed_cidr)"
curl -fsS -o /dev/null -w "    frontend  GET /             -> HTTP %{http_code}\n" "$APP_URL/"
curl -fsS -w "\n    health    GET /api/health   -> HTTP %{http_code}\n" "$APP_URL/api/health"
curl -fsS -o /dev/null -w "    db(seed)  GET /api/columns  -> HTTP %{http_code}\n" "$APP_URL/api/columns"

echo "==> 完了: $APP_URL"
