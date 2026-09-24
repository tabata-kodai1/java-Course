# ステップ1: EC2サーバー1台だけを作る
#
#   自分のPC --HTTP:80--> EC2 [nginx(確認用ページ)]
#                          Java 25 導入済み(バックエンド用。アプリはまだ載せない)
#
# 段階的に進める方針:
#   ステップ1(この構成): EC2を作り、サーバーとして動くことを確認する
#   ステップ2: DB(RDS)を追加する
#   ステップ3: 同じEC2にバックエンド・フロントエンドを載せてデプロイする
# 構成の全体像は docs/tech-stack.md の「5. インフラ構成(AWS)」を参照。

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ---------------------------------------------------------------
# EC2に付与するIAMロール(SSMで接続するための権限のみ)
# ---------------------------------------------------------------
resource "aws_iam_role" "app" {
  name = "${var.project_name}-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.project_name}-app-profile"
  role = aws_iam_role.app.name
}

# ---------------------------------------------------------------
# セキュリティグループ(HTTPは自分のIPのみ。SSHは開けずSSMで接続する)
# ---------------------------------------------------------------
resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "App server: HTTP from allowed_cidr only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP from allowed_cidr"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ---------------------------------------------------------------
# EC2本体
# ---------------------------------------------------------------
resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.app.id]
  iam_instance_profile        = aws_iam_instance_profile.app.name
  associate_public_ip_address = true

  # 初回起動時: user_data.sh(土台: Java/nginx/スワップ) → app-setup.sh(アプリ実行用: systemd/nginx設定/デプロイスクリプト)
  user_data = "${file("${path.module}/user_data.sh")}\n${file("${path.module}/app-setup.sh")}"

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = {
    Name = "${var.project_name}-app"
  }

  # AMIの更新やuser_dataの変更だけでEC2が再作成されるのを防ぐ
  lifecycle {
    ignore_changes = [ami, user_data]
  }
}
