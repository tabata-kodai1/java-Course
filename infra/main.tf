# リソース定義(雛形)
#
# 実際のリソース(VPC・RDS・ECR・ECS・ALB・S3・CloudFrontなど)はここに追加していく。
# 未経験者向けの導入手順として、まずはVPCから小さく plan/apply を試すことを推奨する。
# 詳細は docs/aws-deploy-guide.md の「Terraformコードの実装手順」を参照。
#
# 例:
#
# resource "aws_vpc" "main" {
#   cidr_block = "10.0.0.0/16"
#
#   tags = {
#     Name        = "${var.project_name}-vpc"
#     Environment = var.environment
#   }
# }
