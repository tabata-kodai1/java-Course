# 開発計画書

[要件定義書](requirements.md)に戻る

## 1. 位置づけ

本ドキュメントは、要件定義・画面設計・データベース設計・技術選定（[requirements.md](requirements.md)/[screens.md](screens.md)/[features.md](features.md)/[database.md](database.md)/[tech-stack.md](tech-stack.md)）を踏まえて、Java/Spring Boot（Gradle） + React（Vite） + PostgreSQLによる本実装をどのように進めるかをまとめたものである。

なお、[mockup/](../mockup/)配下には画面イメージすり合わせ用の静的HTML/CSS/JavaScriptモック（バックエンドなし、データはブラウザ上のみで保持）を作成済みだが、これはあくまで画面イメージ確認用であり、本実装ではバックエンドAPI・データベース連携を前提にReactコンポーネントとして作り直す。

DBアクセス方式（Spring Data JPA）およびPostgreSQLの実行環境（ローカルはDocker Compose、AWSではRDS）は、[tech-stack.md](tech-stack.md)に記載の通り決定済みである。

## 2. 開発の進め方（フェーズ分け）

要件定義書の学習目標（要件定義書1.1）に沿って、「要件定義 → 画面設計 → データベース設計 → 実装 → 運用」という流れのうち、実装以降を以下のフェーズに分けて段階的に進める。

### Phase 0: プロジェクト初期化
- Spring Initializr等を用いて、Gradle・Spring Webを含むSpring Bootプロジェクトを`backend/`に作成
- `npm create vite@latest`等を用いて、Reactプロジェクトを`frontend/`に作成
- 「4. ディレクトリ構成案」に沿ってフォルダ構成を用意
- **完了条件**: Spring Bootサーバーが起動し、簡単な疎通確認用エンドポイント（例：`GET /api/health`）にアクセスできる。Viteの開発サーバーが起動し、ブラウザで初期画面が表示できる

### Phase 1: データベース構築
- DBアクセス方式・実行環境（[tech-stack.md](tech-stack.md)に記載の決定事項）に沿って構築する
- [database.md](database.md)のテーブル定義に沿って、`columns`テーブル・`cards`テーブルをPostgreSQL上に作成する（実装ではJPAエンティティを定義し、`ddl-auto=update`によりアプリ起動時に自動作成する。SQLファイルやマイグレーションツールは使わない）
- アプリ初回起動時に初期データ（未着手／進行中／完了の3列）を投入する処理を実装
- **完了条件**: PostgreSQLデータベース上にテーブル定義通りのカラムでデータの読み書きができることをコマンドラインまたは簡易スクリプトで確認できる

### Phase 2: バックエンドAPI実装
- 「3. API設計（叩き台）」に基づき、列・カードのCRUD用REST APIをSpring Bootの`@RestController`等で実装
- 並び替え（同一列内での順序変更）・列間移動（`column_id`の変更）を反映するエンドポイントを実装
- **完了条件**: 各エンドポイントに対してcurlやHTTPクライアント（Postman等）で動作確認ができ、想定通りのレスポンス・DB更新が行われる

### Phase 3: フロントエンド実装
- [mockup/](../mockup/)のUI・操作感（画面構成、モーダル、ドラッグ＆ドロップ）をベースに、Reactコンポーネントとして作り直す
- 列・カードの状態はReactのstate（およびコンポーネント構成）で管理し、データの読み込み・保存部分は`fetch`または`axios`によるバックエンドAPI呼び出しで実装する
- **完了条件**: ブラウザからVite開発サーバー経由でアプリを開き、列・カードの追加／編集／削除／移動がすべてAPI経由でデータベースに反映され、再読み込み後も内容が保持される

### Phase 4: 結合確認・仕上げ
- [features.md](features.md)の非機能要件（性能・データ保全・セキュリティ・ユーザビリティ・保守性・互換性・動作方式）と照らし合わせて動作確認する
- READMEにバックエンド（Gradle）・フロントエンド（Vite/npm）それぞれの起動手順とアクセスURLを整備する
- **完了条件**: 初めて触る利用者でも、READMEの手順通りに操作すればアプリを起動・利用できる状態になっている

### Phase 5: AWSデプロイ
- AWS CLIとTerraformで、AWS上の環境（EC2・RDS・成果物用S3）を段階的に構築する（EC2 → RDS → アプリのデプロイの順に、各段階で動作確認する）
- 手元でビルドしたバックエンド（jar）とフロントエンドを、S3経由でEC2へ配置するデプロイスクリプトを用意する
- 環境構成・セキュリティ方針・`infra/`の構成を[tech-stack.md](tech-stack.md)に、構築・デプロイ手順をREADMEにまとめる
- **完了条件**: AWS上のURL（許可したIPのみ）からアプリを利用でき、データがRDSに保存されて再読み込み・バックエンド再起動後も保持される。EC2を作り直しても、コードだけで同じ状態に戻せる

## 3. API設計（叩き台）

| メソッド | パス | 概要 |
|---|---|---|
| GET | /api/health | 疎通確認用。`{"status":"ok"}`を返す |
| GET | /api/columns | 列一覧を、各列に属するカード一覧を含めて取得する。クエリパラメータ`q`を指定すると、タイトルまたは説明文にキーワードを含むカードだけに絞り込む |
| POST | /api/columns | 列を新規作成する（末尾に追加） |
| PATCH | /api/columns/:id | 列のタイトルを更新する |
| DELETE | /api/columns/:id | 列を削除する（所属するカードも合わせて削除する） |
| POST | /api/columns/:columnId/cards | カードを新規作成する（対象の列の末尾に追加） |
| PATCH | /api/cards/:id | カードの内容（タイトル・説明文・期日・優先度・並び順）を更新する |
| PATCH | /api/cards/:id/move | カードの所属列（`column_id`）と並び順（`position`）を更新する（ドラッグ＆ドロップ用） |
| DELETE | /api/cards/:id | カードを削除する |
| PATCH | /api/cards/bulk | 複数カード（`cardIds`）の優先度・期日をまとめて更新する（一括更新） |
| PATCH | /api/columns/:columnId/cards/sort-by-due-date | 指定した列内のカードを期日の早い順に一括で並び替える |
| PATCH | /api/columns/:columnId/cards/sort-by-priority | 指定した列内のカードを優先度の低い順に一括で並び替える |

`position`は[database.md](database.md)のテーブル定義通り、列は`columns.position`、カードは`cards.position`（列内での並び順）で管理する。

## 4. ディレクトリ構成案

バックエンドとフロントエンドを分離し、責務を分かりやすくする。

```
.
├── docs/            既存の設計ドキュメント
├── mockup/          画面イメージ確認用の静的モック（本実装では使用しない）
├── backend/         Spring Boot（Gradle）プロジェクト
│   └── src/main/java/...   コントローラ・サービス・リポジトリ等
├── frontend/        React（Vite）プロジェクト
│   └── src/                コンポーネント・API呼び出し処理等
└── infra/           AWS環境のTerraformコード・デプロイスクリプト
```

## 5. 学習目的との対応

各フェーズは、要件定義書1.1に挙げた学習目標に対応している。

- Phase 1〜2：実際のデータベース（PostgreSQL）と実務で広く使われるバックエンドフレームワーク（Java/Spring Boot）を用いた設計・構築の経験
- Phase 3：コンポーネント指向のフロントエンドフレームワーク（React）によるUI構築・状態管理・API連携の実装経験（[mockup/](../mockup/)で得た画面イメージをコンポーネントとして発展させる）
- Phase 4：実装したシステムを実際に動かして確認する、運用に近い経験
- Phase 5：クラウド（AWS）上に、コード（Terraform）でサーバー・データベースの環境を構築し、アプリをデプロイする経験
