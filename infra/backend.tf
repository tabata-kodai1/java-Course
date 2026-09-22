# Terraformのstate保存先設定
#
# infra/bootstrap/ で作成したS3バケット・DynamoDBテーブルを参照する。
# bootstrap未実行の場合はこのファイルをコメントアウトし、ローカルstateで開始してよい。
# 詳細は docs/aws-deploy-guide.md の「stateをS3+DynamoDBで管理する」を参照

terraform {
  backend "s3" {
    bucket         = "java-course-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "java-course-tflock"
    encrypt        = true
  }
}
