# Terraformのstate保存先設定
#
# infra/bootstrap/ で作成したS3バケットを参照する。
# ロックはS3のネイティブロック(use_lockfile, Terraform 1.10以降)を使うため、DynamoDBは不要。
# bootstrap未実行の場合はこのファイルをコメントアウトし、ローカルstateで開始してよい。
# 構成の全体像は docs/tech-stack.md の「5. インフラ構成(AWS)」を参照

terraform {
  backend "s3" {
    bucket       = "java-course-tfstate"
    key          = "dev/terraform.tfstate"
    region       = "ap-northeast-1"
    use_lockfile = true
    encrypt      = true
  }
}
