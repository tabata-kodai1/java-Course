# ステップ2: RDS (PostgreSQL) を追加する。接続できるのはEC2からのみ。
#
#   EC2 [app-sg] --5432--> [db-sg] RDS PostgreSQL (インターネット非公開)
#
# パスワードはTerraformが自動生成し、SSMパラメータ(SecureString)に保存する。
# EC2は自分のIAMロールでそのパラメータを読み取る(コードやチャットにパスワードを書かない)。
# 構成の全体像は docs/tech-stack.md の「5. インフラ構成(AWS)」を参照。

resource "random_password" "db" {
  length  = 24
  special = false
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.project_name}/${var.environment}/db/password"
  type  = "SecureString"
  value = random_password.db.result
}

# EC2のIAMロールに、DBパスワードの読み取り権限のみ追加する
resource "aws_iam_role_policy" "read_db_password" {
  name = "read-db-password"
  role = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter"]
      Resource = aws_ssm_parameter.db_password.arn
    }]
  })
}

# RDSは複数AZのサブネットが必要。デフォルトVPCのサブネットを使う
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids
}

# RDS用セキュリティグループ: 5432番をEC2のセキュリティグループからのみ許可(IP指定はしない)
resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "RDS PostgreSQL: allow 5432 from app server security group only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from app server"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  engine         = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "kanban"
  username = "kanban"
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period    = 1
  auto_minor_version_upgrade = true
  apply_immediately          = true

  # 学習用途: destroyで確実に消せるようにする(本番運用では true / false を逆にする)
  deletion_protection = false
  skip_final_snapshot = true
}
