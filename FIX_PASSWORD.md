# 修复管理员密码

## 问题

数据库中的密码存储为 bcrypt 哈希值，但认证代码使用明文比较，导致登录失败。

## 解决方案

### 方法 1: 更新数据库中的密码为明文（推荐，快速）

运行以下命令：

```bash
cd backend
npx wrangler d1 execute fashion-store-db \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"
```

或者使用 SQL 文件：

```bash
cd backend
npx wrangler d1 execute fashion-store-db --file=./scripts/fix-admin-password.sql
```

### 方法 2: 通过 Cloudflare Dashboard

1. 访问 Cloudflare Dashboard
2. 进入 Workers & Pages > D1
3. 选择 `fashion-store-db` 数据库
4. 点击 "Console" 标签
5. 执行以下 SQL：

```sql
UPDATE users 
SET password_hash = 'admin123', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
```

6. 点击 "Execute"

### 验证修复

运行以下命令验证密码已更新：

```bash
npx wrangler d1 execute fashion-store-db \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

应该看到 `password_hash` 为 `admin123`。

### 测试登录

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

应该返回成功响应。

## 注意事项

- 生产环境应该使用 bcrypt 等安全的密码哈希算法
- 当前使用明文密码仅用于开发和测试
- 首次登录后，建议在管理面板中修改密码

