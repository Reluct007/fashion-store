#!/bin/bash

# 初始化远程数据库（创建表结构）

echo "🔧 初始化远程数据库..."
echo ""

# 运行迁移脚本到远程数据库
npx wrangler d1 execute fashion-store-db --remote \
  --file=./migrations/0001_initial.sql

echo ""
echo "✅ 远程数据库已初始化！"
echo ""
echo "验证表结构："
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

echo ""
echo "验证用户："
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"

