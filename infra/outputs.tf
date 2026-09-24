output "instance_id" {
  description = "EC2のインスタンスID(SSM接続に使用)"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "EC2のパブリックIP(停止→起動すると変わる)"
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "動作確認用のURL(allowed_cidrに含まれるIPからのみアクセス可能)"
  value       = "http://${aws_instance.app.public_ip}"
}

output "db_endpoint" {
  description = "RDSの接続先ホスト名(VPC内・EC2からのみ到達可能)"
  value       = aws_db_instance.main.address
}

output "db_name" {
  description = "データベース名"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "DBのマスターユーザー名"
  value       = aws_db_instance.main.username
}

output "db_password_parameter" {
  description = "DBパスワードを保存したSSMパラメータ名(EC2から取得する)"
  value       = aws_ssm_parameter.db_password.name
}

output "artifact_bucket" {
  description = "デプロイ成果物(jar・フロントのビルド結果)を置くS3バケット名"
  value       = aws_s3_bucket.artifacts.id
}

output "ssm_connect_command" {
  description = "EC2へ接続するコマンド(SSH鍵不要)"
  value       = "aws ssm start-session --target ${aws_instance.app.id}"
}
