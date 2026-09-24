#!/bin/bash
# EC2の初回起動時に一度だけ実行される初期設定スクリプト(ステップ1: サーバーの土台のみ)
set -euxo pipefail

# メモリ1GBのEC2でSpring Bootを動かす場合に備えてスワップを確保する
if [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
fi

# バックエンド用のJavaと、フロント配信用のnginxを導入する
dnf install -y java-25-amazon-corretto-headless nginx postgresql16

# 動作確認用のページ(後のステップでフロントエンドに置き換える)
cat > /usr/share/nginx/html/index.html <<'HTML'
<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>java-Course server</title></head>
<body><h1>EC2 server is running.</h1></body>
</html>
HTML

systemctl enable --now nginx
