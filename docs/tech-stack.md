# 技術選定

[要件定義書](requirements.md)に戻る

## 1. 経緯

当初は、サーバー・データベースを持たず`localStorage`のみで完結する構成を想定していた。その後、実際のデータベースを用いた設計・構築・運用まで一通り学習したいという意向から、SQLite＋Node.js/Express＋Vanilla JavaScriptという構成を採用した。

さらに、実務でよく使われるJavaベースのフレームワーク（Spring Boot）やコンポーネント指向のフロントエンド（React）、本格的なDBサーバー（PostgreSQL）を用いた開発を経験したいという意向から、以下の構成に方針を変更した。

## 2. 採用技術

| 技術・仕組み | 選定理由 |
|---|---|
| React（Vite、フロントエンド） | コンポーネント指向のUI構築を学ぶため。SPA（Single Page Application）として構築し、Next.js等のフルスタックフレームワークは今回は対象外とする |
| Java + Spring Boot（Gradle、バックエンドAPI） | 実務で広く使われるJava／Spring Bootの設計・実装（DIコンテナ、REST API実装等）を学ぶため。ビルドツールはGradleを使用する |
| PostgreSQL（データベース） | 本格的なDBサーバーを用いた設計・構築・運用を学ぶため |

### 決定事項（実装フェーズで確定）

企画段階では保留していた以下の事項は、実装フェーズ着手時に決定した。

- **DBアクセス方式**：Spring Data JPA（ORM）を採用
- **PostgreSQLの実行環境**：Docker Composeで構築

## 3. 実装バージョン

実装フェーズで確定した、各技術・ツールの具体的なバージョンは以下の通り。

### バックエンド（`backend/`）

| 項目 | バージョン | 参照元 |
|---|---|---|
| Java | 25 | `backend/build.gradle`（toolchain） |
| Spring Boot | 4.1.1 | `backend/build.gradle` |
| Gradle | 9.7.1 | `backend/gradle/wrapper/gradle-wrapper.properties` |
| ビルドツール | Gradle（Groovy DSL） | `backend/build.gradle` |
| DBアクセス | Spring Data JPA | `backend/build.gradle` |
| DBドライバ | org.postgresql:postgresql（実行時） | `backend/build.gradle` |

### フロントエンド（`frontend/`）

| 項目 | バージョン | 参照元 |
|---|---|---|
| React | ^19.3.0 | `frontend/package.json` |
| React DOM | ^19.3.0 | `frontend/package.json` |
| TypeScript | ^7.0.2 | `frontend/package.json` |
| Vite | ^8.3.0 | `frontend/package.json` |
| @vitejs/plugin-react | ^6.1.1 | `frontend/package.json` |
| Lintツール | oxlint ^1.81.0 | `frontend/package.json` |

### データベース

| 項目 | バージョン | 参照元 |
|---|---|---|
| PostgreSQL | 16-alpine | `docker-compose.yml` |
| 実行環境 | Docker Compose | `docker-compose.yml` |

## 4. 検討した代替案と不採用理由

| 代替案 | 不採用理由 |
|---|---|
| Vanilla JavaScript（フロントエンド） | 当初はDOM操作の基礎理解を優先して採用していたが、コンポーネント指向のフロントエンド開発（React）を学ぶ方針に転換したため |
| Node.js + Express（バックエンドAPI） | 当初はフロントエンドと言語を統一する目的で採用していたが、実務で広く使われるJava／Spring Bootを学ぶ方針に転換したため |
| SQLite（データベース） | 当初は環境構築の負荷を抑える目的で採用していたが、本格的なDBサーバー（PostgreSQL）を用いた設計・運用を学ぶ方針に転換したため |
| Next.js | フロントエンドをSPAとして構築し、React単体でのコンポーネント設計・状態管理・API連携を学ぶことを優先するため、今回は対象外とした |
| Python（Flask／FastAPI）等の他言語バックエンド | Java／Spring Bootの学習を優先するため不採用 |
| Firebase等のBaaS | 仕組みがブラックボックス化しやすく、DB設計やAPI実装そのものを学ぶという目的に合わないため |

学習目的の観点から、実務での最適解よりも「実務でよく使われる技術・仕組みの理解を優先する」ことを技術選定の軸とした。
