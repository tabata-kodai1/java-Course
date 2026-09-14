---
name: start-servers
description: このプロジェクト(java-Course)のbackend/frontend/DBサーバーを動作確認のために起動するときに使う。ポートが競合した場合の対処ルールを含む。「サーバー起動して」「動作確認して」「backend/frontendを立ち上げて」等のときに使用する。
---

# サーバー起動ルール

このプロジェクトのサーバーは **必ずデフォルトポートで起動する**。ポートが競合した場合でも、別ポートに逃がして起動することは禁止。競合しているプロセス・コンテナを停止してから、デフォルトポートで起動し直すこと。

## デフォルトポート

| サービス | ポート | 定義箇所 |
|---|---|---|
| PostgreSQL | `5432` | `docker-compose.yml` |
| Backend (Spring Boot) | `8080` | `backend/src/main/resources/application.properties` |
| Frontend (Vite) | `5173` | Viteのデフォルト(`frontend/vite.config.ts`に`server.port`指定なし) |

Backendの`/api/**`はfrontendのVite devサーバーから`vite.config.ts`の`server.proxy`で`http://localhost:8080`にプロキシされる。**backendが8080以外、frontendが5173以外で動いていると、このプロキシ連携が壊れて正しく動作確認できない。** 別ポートでの一時起動は絶対にしないこと。

## 起動手順

1. **PostgreSQL**
   ```
   docker compose up -d
   ```
   - `docker compose ps` で `0.0.0.0:5432->5432/tcp` になっていることを確認。
   - ポート競合エラーが出た場合は「ポート競合時の対処」を参照。`docker-compose.yml`のポート番号自体は絶対に書き換えない。

2. **Backend**
   ```
   cd backend
   ./gradlew bootRun
   ```
   - ログに `Tomcat started on port 8080` と `Started KanbanApplication` が出ることを確認。
   - `application.properties`のポート設定は変更しない。

3. **Frontend**
   ```
   cd frontend
   npm run dev
   ```
   - ログに `Local: http://localhost:5173/` と出ることを確認。「Port 5173 is in use, trying another one...」と出た場合は失敗とみなし、後述の対処を行う。

## ポート競合時の対処

対象ポート(5432 / 8080 / 5173)が既に使用中でサーバーが起動できない場合:

1. 何がそのポートを使用しているか特定する。
   - Windows: `netstat -ano | grep ":<port>"` でPIDを確認し、`docker ps` にも同ポートのコンテナがないか確認する。
2. **本プロジェクト自身の古い起動プロセス**(前回の`bootRun`や`vite`の生き残り等)であれば、そのまま停止してよい。
   - プロセス: `powershell -Command "Stop-Process -Id <PID> -Force"`
   - コンテナ: `docker compose down`(このプロジェクトの`java-course-*`コンテナのみ)
3. **本プロジェクトと無関係なプロセス・コンテナ**(他プロジェクトのDBなど)である場合は、停止してよいかを**必ずユーザーに確認してから**停止する。無断で他プロジェクトのプロセスを止めない。
4. 停止後、同じデフォルトポートで起動し直す。

## 禁止事項

- `docker-compose.yml`のポートを一時的に別ポート(例: `55432:5432`)に書き換えて起動すること
- `SPRING_DATASOURCE_URL`等の環境変数でbackendのDB接続先ポートを一時的に変更すること
- `application.properties`の`server.port`を一時的に変更すること
- Viteが自動的に選んだ代替ポート(5174等)のまま動作確認を進めること

これらはすべて、動作確認自体はできても実際にユーザーが使う構成(デフォルトポート同士の連携)を検証したことにならないため禁止。
