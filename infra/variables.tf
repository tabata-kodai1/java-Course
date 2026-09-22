# 入力変数定義
# 実値は terraform.tfvars(Git管理外)に記述する

variable "aws_region" {
  description = "デプロイ先のAWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名(dev/staging/prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "リソース名のプレフィックスとして使うプロジェクト名"
  type        = string
  default     = "java-course"
}

variable "db_password" {
  description = "RDS(PostgreSQL)のマスターパスワード"
  type        = string
  sensitive   = true
}
