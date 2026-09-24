# 入力変数定義
# 実値は terraform.tfvars(Git管理外)に記述する

variable "aws_region" {
  description = "デプロイ先のAWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "リソース名のプレフィックスとして使うプロジェクト名"
  type        = string
  default     = "java-course"
}

variable "instance_type" {
  description = "EC2のインスタンスタイプ(無料プラン対象のものを選ぶ)"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDSのインスタンスクラス(無料プラン対象のものを選ぶ)"
  type        = string
  default     = "db.t4g.micro"
}

variable "allowed_cidr" {
  description = "Webアプリにアクセスを許可するIP範囲。アプリに認証がないため、自分のIP(例: 203.0.113.10/32)に限定すること"
  type        = string

  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/(1[6-9]|2[0-9]|3[0-2])$", var.allowed_cidr))
    error_message = "allowed_cidr はIPv4のCIDR(例: 203.0.113.10/32)で、範囲は/16以上の狭いものを指定してください。認証のないアプリを広く公開しないための制限です(0.0.0.0/0 も指定できません)。"
  }
}
