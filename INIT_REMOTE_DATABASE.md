# 初始化远程数据库

## 问题

远程数据库中还没有创建表结构，导致 "no such table: users" 错误。

## 解决方案

### 步骤 1: 初始化远程数据库（创建表结构）

运行迁移脚本到远程数据库：

```bash
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --file=./migrations/0001_initial.sql
```

或者使用脚本：

```bash
cd backend
./scripts/init-remote-db.sh
```

这会创建所有必要的表（users, product_configs, system_configs）和默认管理员用户。

### 步骤 2: 验证表结构

```bash
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"
```

应该看到：`users`, `product_configs`, `system_configs`

### 步骤 3: 验证用户

```bash
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

应该看到：
- `username`: `admin`
- `password_hash`: `admin123`（明文，因为迁移脚本已更新）

### 步骤 4: 重新部署后端

```bash
cd backend
npm run deploy
```

或者等待 GitHub Actions 自动部署。

### 步骤 5: 测试登录

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 完整流程

```bash
# 1. 初始化远程数据库
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --file=./migrations/0001_initial.sql

# 2. 验证表结构
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# 3. 验证用户
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"

# 4. 重新部署后端
npm run deploy

# 5. 等待部署完成（约 1-2 分钟）

# 6. 测试登录
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 重要提示

- **本地 vs 远程**：本地数据库和远程数据库是分开的
- **必须使用 `--remote`**：更新远程数据库时必须加上这个标志
- **迁移脚本**：`migrations/0001_initial.sql` 会创建表并插入默认管理员用户（密码：admin123）

## 如果迁移失败

如果迁移脚本执行失败，可以手动在 Cloudflare Dashboard 中执行：

1. 访问 Cloudflare Dashboard
2. 进入 **Workers & Pages** > **D1**
3. 选择 `fashion-store-db` 数据库
4. 点击 **Console** 标签
5. 复制 `migrations/0001_initial.sql` 的内容
6. 粘贴到控制台并执行

