# 観点2: フレームワークのベストプラクティス遵守

実際のコードを`Read`して判断すること。以下は「何を見るか」のチェックリストであり、機械的な穴埋めではない。

## Spring Boot (backend/src/main/java/com/example/kanban/)

本プロジェクトはパッケージを分けないフラット構成(`com.example.kanban`直下に全クラス)を採用している。これ自体は小規模プロジェクトとして許容範囲だが、以下は確認する。

- **レイヤー分離**: `Controller`はリクエスト/レスポンスの変換とサービス呼び出しに徹しているか。ビジネスロジック(位置の再計算、バリデーションの分岐等)が`Controller`に漏れていないか。`Service`側にあるべき。
- **DTOによる入出力分離**: `@RequestBody`/戻り値にJPAエンティティ(`Card`/`Column`)を直接使わず、`CardCreateRequest`/`CardResponse`のようなレコード型DTOを使っているか。新しいエンドポイントを追加する際、既存の`CardCreateRequest`等のパターン(recordクラス、`@NotBlank`等のBean Validation)を踏襲しているか。
- **例外処理**: `GlobalExceptionHandler`(`@RestControllerAdvice`)が存在し、バリデーションエラー・想定外エラーを一貫した形式(`ProblemDetail`)で返しているか。個々の`Service`メソッドで`ResponseStatusException`を投げる際、適切な`HttpStatus`とメッセージを使っているか。
- **トランザクション境界**: 更新系メソッドに`@Transactional`、参照系に`@Transactional(readOnly = true)`が付与されているか(`ColumnService`/`CardService`のパターン参照)。
- **バリデーション**: `@Valid`が`@RequestBody`引数に付いているか、DTOのフィールドに`@NotBlank`/`@NotEmpty`等が付いているか。
- **リポジトリ**: N+1問題を避けるため一覧取得系は`JOIN FETCH`(`ColumnRepository.findAllWithCards`のパターン)を使っているか。

## React (frontend/src/)

- **コンポーネントの責務分離**: `pages/`(データ取得・状態管理)→`components/`(表示・イベントハンドリング)という現状の構成が維持されているか。新規コンポーネントが上位のstateを直接操作せず、propsで受け取ったコールバックを呼ぶ形になっているか。
- **プロップドリリング**: `BoardPage → Board → Column → Card`のように3階層以上コールバックが受け渡されている箇所がある(現状は許容範囲)。さらに深くなる、あるいは無関係な中間コンポーネントが素通りさせるだけのpropsが増えている場合は指摘する。
- **useEffectの依存配列**: 依存配列に含めるべき値が漏れていないか、不要な再実行を招く値が含まれていないか(`BoardPage.tsx`の検索デバウンス処理のパターン参照)。
- **リストレンダリング**: `.map()`で生成する要素に`key`(DBのid等、安定した値)が付与されているか。配列のindexをkeyに使っていないか。
- **フォームの状態管理**: `CardCreateForm`/`CardEditForm`のように、送信中フラグ(`isSubmitting`)・エラー表示・リセット処理が一貫したパターンで実装されているか。
- **API呼び出し**: `frontend/src/api/`配下に直接`fetch`を書かず、`client.ts`の`getJson`/`postJson`/`patchJson`/`deleteJson`を経由しているか。

## 判断に迷った場合

「動くが理想的ではない」程度の指摘は重大度「参考」〜「推奨」とする。実際にバグや保守性の重大な問題につながるものだけを「要修正」とする。
