# ステップ3: デプロイ成果物(backend.jar / frontend.tgz)の置き場
#
#   手元PCでビルド --aws s3 cp--> このS3バケット --EC2が取得--> EC2
#
# 構成の全体像は docs/tech-stack.md の「5. インフラ構成(AWS)」を参照。

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.project_name}-artifacts-${data.aws_caller_identity.current.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# EC2のIAMロールに、成果物バケットの読み取り(GetObject)のみ許可する
resource "aws_iam_role_policy" "read_artifacts" {
  name = "read-artifacts"
  role = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject"]
      Resource = "${aws_s3_bucket.artifacts.arn}/*"
    }]
  })
}
