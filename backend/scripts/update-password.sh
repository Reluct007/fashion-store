#!/bin/bash

# 快速修复管理员密码脚本

echo "🔧 修复管理员密码..."
echo ""

# 更新密码为明文 admin123
npx wrangler d1 execute fashion-store-db \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"

echo ""
echo "✅ 密码已更新！"
echo ""
echo "现在可以使用以下凭证登录："
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "验证密码："
npx wrangler d1 execute fashion-store-db \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"

