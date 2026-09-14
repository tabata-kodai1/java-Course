# CLAUDE.md

このファイルは、Claude Codeがこのリポジトリで作業する際に必ず守るルールを定義します。

## Git / GitHub 運用ルール(厳守)

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照。Claude Codeは以下を必ず守ること。

1. **新しい作業を始める前に、GitHub Issueを作成する**(`gh issue create`)。Issueなしでコードの変更に着手しない。
2. **mainブランチに直接コミット・pushしない**。作業を始める際は必ず `feature/<issue番号>-<概要>` または `fix/<issue番号>-<概要>` の形式でブランチを作成する。
3. 作業完了後は **Pull Requestを作成する**(`gh pr create`)。PR本文には対応するIssueを `Closes #<issue番号>` で紐付ける。
4. push・PR作成・Issue作成など、GitHub上に影響する操作は事前にユーザーへ確認してから実行する。

## サーバー起動ルール(厳守)

動作確認のためにbackend/frontend/DBのサーバーを起動する際は、必ず以下のルールに従うこと。詳細は [start-servers Skill](./.claude/skills/start-servers/SKILL.md) を参照。

1. **各サーバーは必ずアプリに設定されたデフォルトポートで起動する**こと。別ポートへの一時的な変更・退避は禁止。
   - PostgreSQL: `5432`(`docker-compose.yml`)
   - Backend (Spring Boot): `8080`(`backend/src/main/resources/application.properties`)
   - Frontend (Vite): `5173`(Viteのデフォルト)
2. 起動しようとしたポートが既に使用中の場合は、**そのポートを使用しているプロセス・コンテナを停止**してから、同じデフォルトポートで起動し直すこと。別ポートに逃がして動作確認を済ませることは禁止(バックエンドとフロントエンドのポート連携(プロキシ設定等)が崩れ、正しく動作確認できないため)。
3. ポートを使用しているプロセスが本プロジェクトと無関係な場合(他プロジェクトのコンテナ等)は、停止してよいか必ずユーザーに確認してから停止すること。
