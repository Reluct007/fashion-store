# 验证 GitHub Secrets 配置

## 已配置的 Secrets

✅ **CLOUDFLARE_API_TOKEN**: 已配置
✅ **CLOUDFLARE_ACCOUNT_ID**: 已配置

## 验证步骤

### 1. 确认 GitHub Secrets 已保存

1. 进入 GitHub 仓库：https://github.com/Reluct007/fashion-store
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 确认以下两个 secrets 存在且已更新：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### 2. 验证 API Token 权限

您的 API Token 需要以下权限：
- ✅ Account: Workers Scripts (Edit)
- ✅ Account: Workers KV Storage (Edit)  
- ✅ Account: Account Settings (Read)
- ✅ Zone: Zone Settings (Read)
- ✅ Account: D1 (Edit) - 如果使用 D1 数据库

### 3. 测试部署

配置完成后，可以：

**方法 1: 等待自动触发**
- 推送代码到 main 分支会自动触发 workflow
- 或者等待之前的失败 workflow 重新运行

**方法 2: 手动触发**
1. 进入 Actions 页面
2. 选择 "Deploy Backend to Cloudflare Workers" 或 "Deploy Frontend to Cloudflare Pages"
3. 点击 "Run workflow" 按钮
4. 选择 main 分支
5. 点击 "Run workflow"

### 4. 检查部署状态

部署成功后，可以验证：

**后端 API:**
- 访问：https://fashion-store-api.reluct007.workers.dev/api/health
- 应该返回：`{"status":"ok","timestamp":"..."}`

**前端网站:**
- 访问您的 Cloudflare Pages 域名
- 应该能看到网站正常运行

## 安全提醒

⚠️ **重要**: 您刚才分享的 API Token 和 Account ID 是敏感信息。

**建议操作：**
1. 如果这些信息在公开场合（如聊天记录）被分享过，建议：
   - 在 Cloudflare Dashboard 中删除当前 API Token
   - 创建一个新的 API Token
   - 在 GitHub Secrets 中更新为新 Token

2. 不要在代码、文档或公开场合分享这些敏感信息

3. 定期轮换 API Token 以提高安全性

## 如果仍然失败

如果配置后 workflow 仍然失败，请：

1. **查看错误日志**
   - 进入 Actions 页面
   - 点击失败的 workflow
   - 查看具体的错误信息

2. **常见错误及解决方法：**
   - `Authentication failed` → 检查 API Token 是否正确
   - `Account not found` → 检查 Account ID 是否正确
   - `Project not found` → 检查项目名称是否匹配
   - `Permission denied` → 检查 API Token 权限

3. **联系支持**
   - 提供具体的错误日志
   - 检查 Cloudflare Dashboard 中的相关配置

