# CLAUDE.md

このファイルは、Claude Codeがこのリポジトリで作業する際に必ず守るルールを定義します。

## Git / GitHub 運用ルール(厳守)

詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照。Claude Codeは以下を必ず守ること。

1. **新しい作業を始める前に、GitHub Issueを作成する**(`gh issue create`)。Issueなしでコードの変更に着手しない。
2. **mainブランチに直接コミット・pushしない**。作業を始める際は必ず `feature/<issue番号>-<概要>` または `fix/<issue番号>-<概要>` の形式でブランチを作成する。
3. 作業完了後は **Pull Requestを作成する**(`gh pr create`)。PR本文には対応するIssueを `Closes #<issue番号>` で紐付ける。
4. push・PR作成・Issue作成など、GitHub上に影響する操作は事前にユーザーへ確認してから実行する。
