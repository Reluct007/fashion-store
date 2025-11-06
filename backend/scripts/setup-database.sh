#!/bin/bash

# Cloudflare D1 数据库自动设置脚本
# 使用方法: ./setup-database.sh

set -e

echo "🚀 Fashion Store - D1 数据库设置向导"
echo "======================================"
echo ""

# 检查是否已安装 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "正在安装..."
    npm install -g wrangler
fi

# 检查是否已登录
echo "📋 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  未登录 Cloudflare，正在登录..."
    wrangler login
else
    echo "✅ 已登录 Cloudflare"
    wrangler whoami
fi

echo ""
echo "📝 创建 D1 数据库..."
echo ""

# 创建数据库
DB_NAME="fashion-store-db"
echo "正在创建数据库: $DB_NAME"

DB_INFO=$(wrangler d1 create $DB_NAME 2>&1)

# 提取数据库 ID
DB_ID=$(echo "$DB_INFO" | grep -oP 'database_id = "\K[^"]+' || echo "")

if [ -z "$DB_ID" ]; then
    # 尝试另一种方式提取
    DB_ID=$(echo "$DB_INFO" | grep -i "id" | grep -oP '[a-f0-9]{32}' | head -1 || echo "")
fi

if [ -z "$DB_ID" ]; then
    echo "❌ 无法自动提取数据库 ID"
    echo ""
    echo "请手动查找数据库 ID："
    echo "1. 访问 https://dash.cloudflare.com/"
    echo "2. 进入 Workers & Pages > D1"
    echo "3. 找到 '$DB_NAME' 数据库"
    echo "4. 复制 Database ID"
    echo ""
    read -p "请输入数据库 ID: " DB_ID
else
    echo "✅ 数据库创建成功！"
    echo "📌 Database ID: $DB_ID"
fi

# 更新 wrangler.toml
echo ""
echo "📝 更新 wrangler.toml 配置..."

WRANGLER_FILE="wrangler.toml"
if [ -f "$WRANGLER_FILE" ]; then
    # 备份原文件
    cp "$WRANGLER_FILE" "${WRANGLER_FILE}.backup"
    
    # 更新 database_id
    if grep -q "database_id = \"\"" "$WRANGLER_FILE"; then
        sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" "$WRANGLER_FILE"
        rm "${WRANGLER_FILE}.bak" 2>/dev/null || true
        echo "✅ wrangler.toml 已更新"
    else
        echo "⚠️  wrangler.toml 中已有 database_id，跳过更新"
    fi
else
    echo "❌ 找不到 wrangler.toml 文件"
    exit 1
fi

# 初始化数据库
echo ""
echo "📊 初始化数据库表结构..."

MIGRATION_FILE="migrations/0001_initial.sql"
if [ -f "$MIGRATION_FILE" ]; then
    echo "正在运行迁移脚本..."
    wrangler d1 execute $DB_NAME --file="$MIGRATION_FILE"
    echo "✅ 数据库初始化完成！"
else
    echo "⚠️  找不到迁移文件: $MIGRATION_FILE"
    echo "请手动运行迁移脚本"
fi

echo ""
echo "✨ 数据库设置完成！"
echo ""
echo "📋 下一步："
echo "1. 部署后端: cd backend && npm run deploy"
echo "2. 访问管理面板: /admin"
echo "3. 使用默认凭证登录: admin / admin123"
echo ""
echo "💡 提示：首次登录后请修改密码！"

