# 更新远程数据库和部署后端

## 问题

刚才的命令是在**本地数据库**执行的，需要更新**远程 Cloudflare 数据库**。

## 解决方案

### 步骤 1: 更新远程数据库密码

使用 `--remote` 标志：

```bash
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"
```

或者使用脚本：

```bash
cd backend
./scripts/update-password-remote.sh
```

### 步骤 2: 验证远程数据库

```bash
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

应该看到 `password_hash` 为 `admin123`。

### 步骤 3: 重新部署后端

后端代码已更新，需要重新部署：

```bash
cd backend
npm run deploy
```

或者等待 GitHub Actions 自动部署（如果已配置）。

### 步骤 4: 测试登录

部署完成后，测试登录：

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 重要提示

- **本地 vs 远程**：不加 `--remote` 会在本地数据库执行，不会影响 Cloudflare 上的数据库
- **必须使用 `--remote`**：更新 Cloudflare 数据库时必须加上这个标志
- **重新部署**：修改代码后需要重新部署后端才能生效

## 完整流程

```bash
# 1. 更新远程数据库
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"

# 2. 验证
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"

# 3. 重新部署后端
npm run deploy

# 4. 等待部署完成（约 1-2 分钟）

# 5. 测试登录
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

