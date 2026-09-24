# Terraformのstate保存用S3バケット
#
# infra/ 本体を apply する前に、このディレクトリで一度だけ apply して作成する。
# 本体のstateを管理するリソースを本体と同じstateで管理すると矛盾するため、別ディレクトリ・別stateで管理する。
# 構成の全体像は docs/tech-stack.md の「5. インフラ構成(AWS)」を参照

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "tfstate" {
  bucket = "java-course-tfstate"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
