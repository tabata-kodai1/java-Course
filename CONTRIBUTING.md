# 開発ルール

このプロジェクトでは以下のルールに従って開発します。

## 1. Issue駆動での開発

作業を始める前に、必ず GitHub Issue を作成してください。
どんな小さな作業でも、Issueで「何をやるか」を明確にしてから着手します。

Issue作成時は `.github/ISSUE_TEMPLATE/` にあるテンプレート(バグ報告 / 機能追加)を使用してください。

## 2. ブランチ命名規則

ブランチは以下の形式で作成します。

```
feature/<issue番号>-<概要>   # 新機能・改善
fix/<issue番号>-<概要>       # バグ修正
```

例:
- `feature/12-add-login`
- `fix/15-null-pointer-error`

## 3. mainブランチへの直接pushは禁止

`main` ブランチには直接コミット・pushしません。
必ず作業用ブランチ(`feature/...` / `fix/...`)を作成し、Pull Requestを経由してマージします。

GitHub側でも `main` ブランチに保護ルールを設定しており、直接pushはブロックされます。

## 4. Pull Requestの作成

- PRを作成する際は `.github/PULL_REQUEST_TEMPLATE.md` に従って記述する
- 対応するIssueを `Closes #<issue番号>` の形式で紐付ける
- マージ後は作業ブランチを削除する

## 5. レビュー体制について(今後の運用)

現在はレビュー承認を必須にはしていません(一人開発のため)。
将来、講師などレビュアーを追加する際は、リポジトリの Settings > Branches の保護ルールで
`Require approvals` の必須承認数を1以上に変更してください。それだけでレビュー必須の運用に移行できます。
