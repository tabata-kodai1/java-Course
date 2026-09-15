# 観点1: コード品質(Lint/フォーマット/ビルド)

## Backend

```
cd backend
./gradlew check
```

`check`タスクには以下が含まれる(`backend/build.gradle`参照):
- `spotlessCheck`: Google Java Format(`googleJavaFormat('1.28.0')`)によるフォーマットチェック
- `compileJava`/`compileTestJava`: コンパイル確認
- `test`: JUnitテスト実行

**合格基準**: `BUILD SUCCESSFUL`が出ること。

**失敗パターンの読み方**
- `spotlessJavaCheck`で失敗した場合、フォーマット崩れが原因。`./gradlew spotlessApply`で自動整形できる(ただし自動修正して良いかはSKILL.md本体の方針に従いユーザーに確認してから実行する)。
- `compileJava`で失敗した場合はコンパイルエラー。エラーメッセージのファイル名・行番号を報告に含める。
- `test`で失敗した場合は該当テストクラス名とアサーション内容を報告に含める。

## Frontend

```
cd frontend
npm run lint
npm run build
```

- `npm run lint`は`oxlint`を実行する(`frontend/package.json`参照)。ESLintではなくoxlintを採用しているのが本プロジェクトの意図的な選択(`docs/tech-stack.md`参照)なので、ESLint設定がないことを問題として指摘しない。
- `npm run build`は`tsc -b && vite build`。TypeScriptの型エラーはここで検出される。

**合格基準**: `npm run lint`が指摘なしで終了し、`npm run build`が`✓ built in ...`まで到達すること。

## 実行時の注意

- `./gradlew`はWindows環境でも`./gradlew`(Git Bash)で実行できる。
- バックエンドのビルドにはPostgreSQLへの接続は不要(`check`はDB起動なしで通る)。DBが必要な動作確認は`start-servers`スキルを使う。
- コマンド実行結果は要約して報告する。生ログ全文を貼り付けず、失敗箇所・警告箇所のみ抜粋する。
