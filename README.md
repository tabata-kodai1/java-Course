# TaskManagement

Trello風のタスク管理アプリ(カンバンボード)。プログラミングスクールの学習課題として、要件定義 → 画面設計 → データベース設計 → 実装という一連の開発フローを経験することを目的に制作している。

- フロントエンド：React(Vite) + TypeScript
- バックエンドAPI：Java + Spring Boot(Gradle)
- データベース：PostgreSQL(ローカルはDocker Compose、AWSではRDS)
- インフラ：AWS(EC2・RDS・S3) + Terraform(個人利用の最小構成)

技術選定の経緯・理由や、各技術の実装バージョン、AWSのインフラ構成は[技術選定ドキュメント](docs/tech-stack.md)を参照。

## ドキュメント

設計ドキュメントは`docs/`配下に一式揃っている。

| ドキュメント | 内容概要 |
|---|---|
| [requirements.md](docs/requirements.md) | 要件定義書(目的・背景、想定利用者、スコープ概要、用語) |
| [screens.md](docs/screens.md) | ユースケース、画面構成・画面要素、ワイヤーフレーム、操作フロー、画面遷移 |
| [features.md](docs/features.md) | 機能要件(列・カード管理、移動・並べ替え、データ保存)、スコープ外・将来のバックログ、非機能要件 |
| [database.md](docs/database.md) | ER図、テーブル定義、データ項目一覧 |
| [tech-stack.md](docs/tech-stack.md) | 採用技術と選定理由、検討した代替案、実装バージョン、AWSインフラ構成(構成図・セキュリティ方針・`infra/`の構成) |
| [plan.md](docs/plan.md) | 開発計画(フェーズ分け、API設計、ディレクトリ構成案) |

`mockup/`配下には、本実装前に画面イメージをすり合わせるために作成した静的HTML/CSS/JavaScriptモック(バックエンドなし)がある。

## 機能概要

- 列(カテゴリ)の追加・名称変更・削除
- カードの追加・編集(タイトル・説明文・期日・優先度)・削除
- ドラッグ&ドロップによるカードの列間移動・並べ替え
- 各列の「優先度順」「期限順」による一括並べ替え
- カードの複数選択による優先度・期日の一括更新
- キーワードによるカード検索(タイトル・説明文)
- PostgreSQLデータベースへのデータ永続化

詳細な仕様は[features.md](docs/features.md)を参照。

## 開発環境セットアップ(ローカル)

自分のPC上で動かす開発用の手順。AWS上へデプロイする場合は「[AWSデプロイ](#awsデプロイ)」を参照。

サーバーは必ずデフォルトポート(PostgreSQL: `5432`、バックエンド: `8080`、フロントエンド: `5173`)で起動すること。詳細は[CLAUDE.md](CLAUDE.md)のサーバー起動ルールを参照。

### 1. PostgreSQLをDockerで起動

```
docker compose up -d
```

`.env.example`を`.env`にコピーして値を変更すると、DB名・ユーザー名・パスワードをカスタマイズできる(未作成でもデフォルト値で起動する)。

起動確認:

```
docker compose ps
```

停止:

```
docker compose down
```

### 2. バックエンド起動

```
cd backend
./gradlew bootRun
```

`backend/src/main/resources/application.properties`で`localhost:5432`のPostgreSQLに接続する設定になっている。起動後は`http://localhost:8080`でAPIにアクセスできる(疎通確認用に`GET /api/health`あり)。

### 3. フロントエンド起動

```
cd frontend
npm install
npm run dev
```

起動後は`http://localhost:5173`でブラウザからアプリにアクセスできる。

## AWSデプロイ

AWS上に、EC2(画面とバックエンドを同居)とRDS(PostgreSQL)を、AWSマネジメントコンソールを使わずTerraformとAWS CLIで構築し、アプリをデプロイできる。構成図・構成要素・セキュリティ方針・`infra/`の構成は[tech-stack.md](docs/tech-stack.md)の「5. インフラ構成(AWS)」を参照。

### 前提

- AWSアカウントと、作業用のIAMユーザー(ルートユーザーは日常作業に使わない)
- AWS CLIとTerraform(1.10以上)のインストール、`aws configure`による認証設定
- 手元にJava 25(バックエンドのビルド用)とNode.js/npm(フロントエンドのビルド用)

### 初回の構築

```
# 1. Terraformのstate置き場(S3)を作る(最初に1回だけ)
cd infra/bootstrap
terraform init
terraform apply

# 2. 変数ファイルを用意する
cd ..
cp terraform.tfvars.example terraform.tfvars
#   terraform.tfvars の allowed_cidr を、自分のIPアドレス/32に書き換える
#   (`curl https://checkip.amazonaws.com`で確認できる。terraform.tfvarsはGit管理外)

# 3. EC2・RDS・S3などを作る
terraform init
terraform plan -out=tfplan     # 作られる内容を確認
terraform apply tfplan

# 4. アプリをデプロイする(リポジトリのルートで実行)
cd ..
bash infra/deploy.sh
```

`deploy.sh`は、バックエンドとフロントエンドのビルド → S3へのアップロード → EC2への配置・再起動 → 動作確認まで行う。完了後は`terraform output app_url`で表示されるURLをブラウザで開くとアプリを利用できる(アクセスできるのは、許可したIPのPCのみ)。

### 運用

| やりたいこと | 方法 |
|---|---|
| コードを直して再デプロイ | `bash infra/deploy.sh` |
| EC2に接続する | `aws ssm start-session --target <インスタンスID>`(インスタンスIDは`terraform output instance_id`。Session Managerプラグインが別途必要) |
| EC2を作り直す(初期設定を変えたとき) | `cd infra && terraform apply -replace=aws_instance.app`(パブリックIPが変わる。DBはRDSにあるため消えない) |
| 自分のIPが変わってアクセスできない | `terraform.tfvars`の`allowed_cidr`を更新して`terraform apply` |
| 環境を全て削除する | `cd infra && terraform destroy`(**RDSのデータも消える**) |

### 注意

- EC2とRDSは起動している間、AWSの無料クレジットを消費し続ける。使わない期間は`terraform destroy`で削除する
- アプリには認証機能がないため、`allowed_cidr`に全世界(`0.0.0.0/0`)は指定できない設定にしてある
- `terraform.tfvars`・state・plan結果は、機密情報を含むためGitにコミットしない(`.gitignore`済み)

## プロジェクト構成

```
.
├── docs/            設計ドキュメント一式
├── mockup/          画面イメージ確認用の静的モック(本実装では未使用)
├── backend/         Spring Boot(Gradle)プロジェクト
│   └── src/main/java/com/example/kanban/  コントローラ・サービス・リポジトリ等
├── frontend/        React(Vite)プロジェクト
│   └── src/                コンポーネント・API呼び出し処理等
└── infra/           AWS環境のTerraformコード・デプロイスクリプト(構成は docs/tech-stack.md 参照)
```

## Git / GitHub運用ルール

Issue作成 → ブランチ作成 → 実装 → PR作成、という流れで開発を進めている。詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照。
