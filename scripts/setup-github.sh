#!/bin/bash

# GitHub 仓库设置脚本
# 使用方法: ./scripts/setup-github.sh

echo "🚀 设置 GitHub 仓库..."

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "📝 添加文件到 Git..."
git add .

# 提交代码
echo "💾 提交代码..."
git commit -m "Initial commit: Fashion Store project"

# 提示用户输入仓库 URL
echo ""
echo "请输入您的 GitHub 仓库 URL (例如: https://github.com/username/fashion-store.git)"
read -p "仓库 URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ 未提供仓库 URL，跳过远程仓库设置"
    exit 1
fi

# 检查是否已有远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo "🔄 更新远程仓库 URL..."
    git remote set-url origin "$REPO_URL"
else
    echo "➕ 添加远程仓库..."
    git remote add origin "$REPO_URL"
fi

# 设置主分支
git branch -M main

# 推送代码
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo ""
echo "✅ 完成！"
echo ""
echo "下一步："
echo "1. 在 GitHub 仓库设置中添加 Secrets:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo "2. 查看 DEPLOYMENT.md 获取详细部署说明"

