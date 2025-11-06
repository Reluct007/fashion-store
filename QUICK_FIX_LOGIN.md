# 快速修复登录问题

## 问题原因

数据库中的密码存储为 bcrypt 哈希值（`$2b$10$...`），但认证代码使用明文比较，导致登录失败。

## 解决方案（选择一种）

### 方法 1: 使用脚本（最快）

```bash
cd backend
./scripts/update-password.sh
```

### 方法 2: 使用命令行

```bash
cd backend
npx wrangler d1 execute fashion-store-db \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"
```

### 方法 3: 通过 Cloudflare Dashboard

1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** > **D1**
3. 选择 `fashion-store-db` 数据库
4. 点击 **Console** 标签
5. 执行以下 SQL：

```sql
UPDATE users 
SET password_hash = 'admin123', 
    updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';
```

6. 点击 **Execute**

## 验证修复

执行以下命令查看密码是否已更新：

```bash
cd backend
npx wrangler d1 execute fashion-store-db \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

应该看到 `password_hash` 为 `admin123`（而不是 `$2b$10$...`）。

## 测试登录

修复后，再次尝试登录：

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

应该返回：
```json
{
  "success": true,
  "token": "token_1_...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

## 注意事项

- 当前使用明文密码仅用于开发和测试
- 生产环境应该使用 bcrypt 等安全的密码哈希算法
- 首次登录后，建议在管理面板中修改密码

