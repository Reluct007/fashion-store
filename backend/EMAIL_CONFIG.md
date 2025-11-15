# 邮件服务配置指南

Cloudflare Workers 不支持 SMTP 连接，需要使用 HTTP API 的邮件服务。以下是推荐的方案和配置方法。

## 推荐方案

### 1. Resend（推荐）⭐

**优点：**
- API 简单易用
- 免费额度：每月 3,000 封邮件
- 专为开发者设计
- 与 Cloudflare Workers 完美兼容

**配置步骤：**

1. **注册 Resend 账号**
   - 访问 https://resend.com
   - 注册并验证邮箱

2. **获取 API Key**
   - 登录后进入 Dashboard
   - 点击 "API Keys" → "Create API Key"
   - 复制生成的 API Key

3. **验证域名（可选但推荐）**
   - 在 Resend Dashboard 中添加你的域名
   - 按照提示添加 DNS 记录（SPF、DKIM、DMARC）
   - 验证通过后可以使用自定义发件人地址

4. **配置 Cloudflare Workers 环境变量**
   
   在 `wrangler.toml` 中添加：
   ```toml
   [vars]
   EMAIL_SERVICE = "resend"
   EMAIL_API_KEY = "re_xxxxxxxxxxxxx"
   EMAIL_FROM = "noreply@yourdomain.com"  # 或使用 Resend 提供的测试邮箱
   ADMIN_EMAIL = "admin@yourdomain.com"
   ```
   
   或者通过 Cloudflare Dashboard 配置：
   - 进入 Workers & Pages → 你的 Worker → Settings → Variables
   - 添加以下环境变量：
     - `EMAIL_SERVICE`: `resend`
     - `EMAIL_API_KEY`: 你的 Resend API Key
     - `EMAIL_FROM`: 发件人邮箱（如 `noreply@yourdomain.com`）
     - `ADMIN_EMAIL`: 管理员邮箱（接收通知的邮箱）

### 2. SendGrid

**优点：**
- 免费额度：每月 100 封邮件
- 功能强大，适合企业使用

**配置步骤：**

1. **注册 SendGrid 账号**
   - 访问 https://sendgrid.com
   - 注册账号

2. **创建 API Key**
   - Dashboard → Settings → API Keys
   - Create API Key → 选择 "Full Access" 或 "Restricted Access"（邮件发送权限）
   - 复制 API Key

3. **配置环境变量**
   ```toml
   [vars]
   EMAIL_SERVICE = "sendgrid"
   EMAIL_API_KEY = "SG.xxxxxxxxxxxxx"
   EMAIL_FROM = "noreply@yourdomain.com"
   ADMIN_EMAIL = "admin@yourdomain.com"
   ```

### 3. Mailgun

**优点：**
- 免费额度：每月 5,000 封邮件（前 3 个月）
- 之后每月 1,000 封免费

**配置步骤：**

1. **注册 Mailgun 账号**
   - 访问 https://mailgun.com
   - 注册账号

2. **获取 API Key**
   - Dashboard → Sending → API Keys
   - 复制 Private API Key

3. **配置环境变量**
   ```toml
   [vars]
   EMAIL_SERVICE = "mailgun"
   EMAIL_API_KEY = "xxxxxxxxxxxxx"
   MAILGUN_DOMAIN = "yourdomain.com"  # 你的 Mailgun 域名
   EMAIL_FROM = "noreply@yourdomain.com"
   ADMIN_EMAIL = "admin@yourdomain.com"
   ```

## 通过系统配置 API 配置（推荐用于生产环境）

如果不想在环境变量中存储敏感信息，可以通过系统配置 API 在数据库中存储：

### 1. 设置管理员邮箱

```bash
curl -X POST https://your-worker.workers.dev/api/system-configs \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "admin_email",
    "value": "admin@yourdomain.com",
    "type": "string",
    "description": "管理员邮箱地址"
  }'
```

### 2. 设置邮件服务 API Key

```bash
curl -X POST https://your-worker.workers.dev/api/system-configs \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "email_api_key",
    "value": "your_api_key_here",
    "type": "string",
    "description": "邮件服务 API Key"
  }'
```

### 3. 设置发件人邮箱

```bash
curl -X POST https://your-worker.workers.dev/api/system-configs \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "email_from",
    "value": "noreply@yourdomain.com",
    "type": "string",
    "description": "发件人邮箱地址"
  }'
```

## 本地开发配置

在本地开发时，可以在 `.dev.vars` 文件中配置（不会被提交到 Git）：

```bash
# .dev.vars
EMAIL_SERVICE=resend
EMAIL_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## 测试邮件发送

配置完成后，可以通过以下方式测试：

1. **测试订阅通知**：在前端页面订阅邮箱，检查管理员邮箱是否收到通知
2. **测试留言通知**：在联系页面提交留言，检查管理员邮箱是否收到通知

## 故障排查

### 邮件未发送

1. **检查 API Key 是否正确**
   - 确认环境变量已正确配置
   - 检查 API Key 是否有效（未过期）

2. **检查日志**
   - 在 Cloudflare Workers Dashboard 查看日志
   - 查找 "Email service error" 或 "Failed to send email" 相关错误

3. **验证域名（如果使用自定义发件人）**
   - 确保域名已通过邮件服务商的验证
   - 检查 DNS 记录是否正确配置

4. **检查免费额度**
   - 确认未超过免费额度限制
   - 检查邮件服务商账户状态

### 常见错误

- **401 Unauthorized**: API Key 无效或过期
- **403 Forbidden**: 域名未验证或权限不足
- **429 Too Many Requests**: 超过发送频率限制
- **Email service not configured**: 未配置 API Key

## 安全建议

1. **使用环境变量或系统配置存储敏感信息**
   - 不要将 API Key 提交到代码仓库
   - 使用 Cloudflare Workers Secrets 或系统配置 API

2. **限制 API Key 权限**
   - 如果可能，使用最小权限原则
   - 定期轮换 API Key

3. **验证发件人域名**
   - 使用 SPF、DKIM、DMARC 记录
   - 提高邮件送达率

## 推荐配置（生产环境）

对于生产环境，推荐使用 **Resend** + **系统配置 API**：

1. 使用 Resend（简单、可靠、免费额度充足）
2. 通过系统配置 API 存储配置（更安全、易于管理）
3. 验证域名以使用自定义发件人地址
4. 设置管理员邮箱接收通知

