# 観点5: Terraform/インフラ

対象は`infra/`配下(`*.tf`、`bootstrap/`、シェルスクリプトの`deploy.sh`/`app-setup.sh`/`user_data.sh`、`terraform.tfvars.example`)と、それを説明する`README.md`の「AWSデプロイ」、`docs/tech-stack.md`の「5. インフラ構成(AWS)」。

## コマンドによるチェック

`infra/`と`infra/bootstrap/`のそれぞれで実行する。**読み取り・静的チェックのみ**を行い、AWSの状態を変える`terraform apply`/`terraform destroy`は実行しない。

| 目的 | コマンド | 合格の目安 |
|---|---|---|
| フォーマット | `terraform fmt -check -recursive` | 差分なし(出力なし、終了コード0) |
| 構文・整合性 | `terraform init -backend=false -input=false` → `terraform validate` | `Success! The configuration is valid.` |
| シェルスクリプト | `bash -n <ファイル>`(`deploy.sh`/`app-setup.sh`/`user_data.sh`) | エラーなし |
| 静的解析(任意) | `tflint`、`trivy config infra/`、`checkov -d infra/`、`shellcheck` | インストールされていれば実行する。未導入なら「未実施(未導入)」とレポートに明記し、下記の観点を手動で確認して代替する |
| 差分確認(任意) | `terraform plan -detailed-exitcode` | `No changes`。AWSの認証とデプロイ済みの環境が必要。なければ「未実施」と明記する |

注意:
- `terraform init -backend=false`は、まだ`init`していない環境(クローン直後など)向け。`.terraform/`を更新するがGit管理外であり、S3バックエンドへの接続は不要。**すでにS3バックエンドで`init`済みの環境では再初期化せず、`terraform validate`だけを実行する**(バックエンドの設定が変わり、以降の`plan`が「Backend initialization required」で止まるため)。
- 実値を含むファイル(`terraform.tfvars`・`*.tfstate`・`tfplan`)は`Read`や出力で中身を表示しない(存在の確認までにとどめる)。`terraform plan`の出力にも機密値が含まれうるため、報告には要約のみを載せる。

## セキュリティ観点

- **入口の制限**: セキュリティグループの`ingress`に`0.0.0.0/0`や`::/0`がないか(`egress`は許容)。22番(SSH)・3389番(RDP)を開けていないか。許可IPを受ける変数に、全世界指定を拒否する`validation`があるか。
- **DBの非公開**: RDSが`publicly_accessible = false`か。DB用セキュリティグループの許可元が、IPアドレスではなくアプリ用セキュリティグループになっているか。
- **暗号化**: S3(サーバーサイド暗号化)・EBS(`encrypted`)・RDS(`storage_encrypted`)・stateバックエンド(`encrypt`)が有効か。S3にパブリックアクセスブロックが設定されているか。
- **EC2のメタデータ**: IMDSv2が必須(`http_tokens = "required"`)か。
- **IAMの最小権限**: `Action`/`Resource`に`*`を使っていないか。`AdministratorAccess`等の広い管理ポリシーをコードでEC2等に付与していないか。マネージドポリシーは必要最小限(SSM接続用等)か。
- **機密情報**: パスワード・アクセスキー・トークン・AWSアカウントIDが`.tf`/`.sh`/`terraform.tfvars.example`に平文で書かれていないか(`.example`はプレースホルダーのみか)。機密変数に`sensitive = true`があるか。シェルスクリプトがパスワード等を`echo`していないか。
- **Git管理外の徹底**: `.gitignore`が`*.tfstate`・`*.tfvars`(`!*.tfvars.example`)・`tfplan`・`.terraform/`を除外しているか。`git ls-files`にそれらが含まれていないか。
- **stateの保護**: stateの保管先が暗号化・版管理・ロックされているか。stateにパスワードが含まれる構成では、バケットが非公開か。

## ベストプラクティス観点

- **バージョン固定**: `required_version`とプロバイダの`version`を指定しているか。`.terraform.lock.hcl`をコミット対象にしているか(`.gitignore`で除外していないか)。
- **変数・出力**: 変数に`description`と`type`があり、値に制約があるものに`validation`があるか。出力に`description`があるか。
- **未使用の定義**: 使われていない`variable`/`data`/`output`/`locals`がないか(`Grep`で参照元を確認する)。
- **共通タグ**: プロバイダの`default_tags`等で、リソースにタグが付くようになっているか。
- **ハードコード**: リージョン・アカウントID・AZが直書きされていないか(変数や`data`から取得しているか)。ただし`backend`ブロックは変数を使えないため、直書きを許容する。
- **`lifecycle`**: `ignore_changes`・`prevent_destroy`を使う箇所に、理由のコメントがあるか。
- **リソース間の参照**: 名前の文字列の直書きではなく、リソース参照(`aws_xxx.yyy.id`)で依存関係を表現しているか。
- **ファイル分割**: 用途ごとにファイルが分かれ、1ファイルが肥大化していないか。小規模なため、過剰なモジュール化をしていないか。
- **スクリプトの堅牢性**: `set -euo pipefail`を指定しているか。変数を`"..."`で囲んでいるか。何度実行しても同じ結果になる(冪等)か。外部の値をそのままシェルコマンドに埋め込んでいないか。

## docsとの整合

- `README.md`の「AWSデプロイ」と`docs/tech-stack.md`の「5. インフラ構成(AWS)」に書かれた構成要素・構成図・`infra/`のディレクトリ構成・コマンドが、実際の`infra/`と一致しているか。具体的には、ディレクトリ構成の表と`infra/`の実ファイル、構成要素の表と`.tf`の`resource`の種類、READMEのコマンドが指すスクリプト・出力名(`terraform output`)の実在を突き合わせる。
- ドキュメントに、変わりうる詳細な設定値(インスタンスタイプ・リソースID・IPアドレス等)やTerraformコードの転記がないか(値やコードは`infra/`を直接見る方針のため、書かない)。
- `docs/features.md`・`docs/requirements.md`の非機能要件(セキュリティ・環境構築・コスト)と、インフラの実態が矛盾していないか。
- 削除・改名したドキュメントを指すコメント・リンク(`.tf`内のコメント等)が残っていないか。

## 学習用途の割り切り(参考扱い)

次は本プロジェクトが意図した設計のため、「要修正」にはしない。触れる場合は「参考」として1行にとどめる。

- RDSの削除保護なし・最終スナップショットなし(`terraform destroy`で確実に消すため)
- HTTPのみ(HTTPS・独自ドメインなし)、単一AZ・冗長化なし、EC2 1台への同居
- 作業者のIAMユーザーに広い権限を付与する運用(コードの外の話)

## 報告時の注意

- ツール未導入や認証なしで実施できなかったチェックは、レポートに「未実施(理由)」と明記する。
- 静的解析ツールが導入されていない場合でも、上記の観点を`Read`/`Grep`で手動確認し、確認した範囲を報告する。
