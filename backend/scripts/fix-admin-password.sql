-- 修复管理员密码为明文 admin123
-- 使用方法: npx wrangler d1 execute fashion-store-db --file=./scripts/fix-admin-password.sql

UPDATE users 
SET password_hash = 'admin123', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';

