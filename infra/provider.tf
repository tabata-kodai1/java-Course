# Terraform / AWS プロバイダの設定
# 詳細は docs/aws-deploy-guide.md の「Terraformのセットアップ」を参照

terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
