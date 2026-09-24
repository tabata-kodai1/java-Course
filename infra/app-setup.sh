#!/bin/bash
# アプリ(Spring Boot + フロント)を動かすためのEC2セットアップ。何度実行しても同じ結果になる(冪等)。
# EC2上でroot実行する。Terraform管理外の値(バケット名・DBホスト)は、デプロイ時に kanban-deploy へ引数で渡す。
set -euo pipefail

# ---- 実行ユーザーとディレクトリ ----
id kanban >/dev/null 2>&1 || useradd --system --home-dir /opt/kanban --shell /sbin/nologin kanban
mkdir -p /opt/kanban /var/www/kanban /etc/kanban
chown kanban:kanban /opt/kanban

# ---- バックエンド(Spring Boot)のsystemdサービス ----
cat > /etc/systemd/system/kanban-backend.service <<'UNIT'
[Unit]
Description=Kanban backend (Spring Boot)
After=network.target

[Service]
User=kanban
EnvironmentFile=/etc/kanban/backend.env
ExecStart=/usr/bin/java -Xms128m -Xmx384m -jar /opt/kanban/backend.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable kanban-backend

# ---- nginx(画面を返し、/api だけバックエンドへ中継) ----
cat > /etc/nginx/nginx.conf <<'NGINX'
user nginx;
worker_processes 1;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
  worker_connections 256;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /var/log/nginx/access.log;
  sendfile on;
  server_tokens off;
  types_hash_max_size 4096;

  server {
    listen 80 default_server;
    root /var/www/kanban;
    index index.html;

    location /api/ {
      proxy_pass http://127.0.0.1:8080;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
      try_files $uri /index.html;
    }
  }
}
NGINX

# デプロイ前でも何か表示されるよう、確認用ページを置いておく(本番のフロントに置き換わる)
if [ ! -f /var/www/kanban/index.html ] && [ -f /usr/share/nginx/html/index.html ]; then
  cp /usr/share/nginx/html/index.html /var/www/kanban/index.html
fi

nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl restart nginx

# ---- デプロイ用スクリプト(手元の infra/deploy.sh からSSM経由で呼ばれる) ----
cat > /usr/local/bin/kanban-deploy <<'DEPLOY'
#!/bin/bash
# 使い方: kanban-deploy <成果物のS3バケット> <RDSのホスト名> <DBパスワードのSSMパラメータ名>
set -euo pipefail
BUCKET="${1:?usage: kanban-deploy <bucket> <db_host> <password_param>}"
DB_HOST="${2:?usage: kanban-deploy <bucket> <db_host> <password_param>}"
PW_PARAM="${3:?usage: kanban-deploy <bucket> <db_host> <password_param>}"

# リージョンはEC2自身のメタデータ(IMDSv2)から取得する(直書きしない)
IMDS_TOKEN="$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')"
AWS_DEFAULT_REGION="$(curl -s -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" http://169.254.169.254/latest/meta-data/placement/region)"
export AWS_DEFAULT_REGION

echo "== fetch artifacts from S3 =="
aws s3 cp "s3://$BUCKET/backend.jar" /opt/kanban/backend.jar.new --only-show-errors
aws s3 cp "s3://$BUCKET/frontend.tgz" /tmp/frontend.tgz --only-show-errors

echo "== write backend env (password from SSM, never printed) =="
PW="$(aws ssm get-parameter --name "$PW_PARAM" --with-decryption --query Parameter.Value --output text)"
install -m 600 -o root -g root /dev/null /etc/kanban/backend.env
cat > /etc/kanban/backend.env <<EOF
SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_HOST}:5432/kanban?sslmode=require
SPRING_DATASOURCE_USERNAME=kanban
SPRING_DATASOURCE_PASSWORD=${PW}
SERVER_ADDRESS=127.0.0.1
EOF

echo "== swap frontend =="
rm -rf /var/www/kanban.new
mkdir -p /var/www/kanban.new
tar -xzf /tmp/frontend.tgz -C /var/www/kanban.new
chmod -R a+rX /var/www/kanban.new
rm -rf /var/www/kanban.old
[ -d /var/www/kanban ] && mv /var/www/kanban /var/www/kanban.old
mv /var/www/kanban.new /var/www/kanban

echo "== swap backend and restart =="
mv /opt/kanban/backend.jar.new /opt/kanban/backend.jar
chown kanban:kanban /opt/kanban/backend.jar
systemctl restart kanban-backend

echo "== wait for startup (max 120s) =="
for i in $(seq 1 60); do
  if curl -fs http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
    echo "backend healthy after $((i * 2))s"
    exit 0
  fi
  sleep 2
done
echo "backend did NOT become healthy within 120s" >&2
journalctl -u kanban-backend -n 40 --no-pager >&2
exit 1
DEPLOY
chmod 755 /usr/local/bin/kanban-deploy

echo "app-setup done"
