#!/bin/bash

# 更新远程数据库中的管理员密码

echo "🔧 更新远程数据库中的管理员密码..."
echo ""

# 使用 --remote 标志更新远程数据库
npx wrangler d1 execute fashion-store-db --remote \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"

echo ""
echo "✅ 远程数据库密码已更新！"
echo ""
echo "验证密码："
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"

echo ""
echo "📋 下一步：重新部署后端以应用最新代码"
echo "cd backend && npm run deploy"

