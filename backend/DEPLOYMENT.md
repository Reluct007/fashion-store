# 部署和配置指南

## 部署到 Cloudflare Workers

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** → **D1**
2. 点击 **Create database**
3. 输入数据库名称（如 `fashion-store-db`）
4. 复制数据库 ID
5. 更新 `wrangler.toml` 中的 `database_id`

### 4. 初始化数据库

```bash
# 本地初始化
npm run setup-db

# 或远程初始化
npm run setup-db:remote
```

### 5. 配置环境变量

#### 方法 A: 通过 Cloudflare Dashboard（推荐用于生产环境）

1. 进入 **Workers & Pages** → 你的 Worker
2. 点击 **Settings** → **Variables**
3. 添加以下环境变量：

```
EMAIL_SERVICE = resend
EMAIL_API_KEY = re_你的API_Key
EMAIL_FROM = onboarding@resend.dev
ADMIN_EMAIL = 你的管理员邮箱
```

#### 方法 B: 通过 wrangler.toml（用于本地开发）

在 `wrangler.toml` 的 `[vars]` 部分配置：

```toml
[vars]
EMAIL_SERVICE = "resend"
EMAIL_API_KEY = "re_你的API_Key"
EMAIL_FROM = "onboarding@resend.dev"
ADMIN_EMAIL = "你的管理员邮箱"
```

### 6. 部署

```bash
npm run deploy
```

或

```bash
wrangler deploy
```

## 邮件服务配置

### 推荐方案：Resend

#### 1. 注册 Resend 账号

1. 访问 https://resend.com
2. 注册并验证邮箱

#### 2. 获取 API Key

1. 登录 Resend Dashboard
2. 进入 **API Keys** → **Create API Key**
3. 输入名称（如 "Fashion Store"）
4. 复制生成的 API Key（格式：`re_xxxxxxxxxxxxx`）

#### 3. 配置发件人邮箱

**测试环境：**
- 使用 `onboarding@resend.dev`（Resend 提供的测试邮箱）
- 无需验证，可直接使用

**生产环境（推荐）：**
1. 在 Resend Dashboard 点击 **Domains**
2. 点击 **Add Domain**
3. 输入你的域名
4. 按照提示添加 DNS 记录（SPF、DKIM、DMARC）
5. 等待验证通过（通常几分钟）
6. 将 `EMAIL_FROM` 更新为 `noreply@yourdomain.com`

#### 4. 配置环境变量

在 Cloudflare Dashboard 或 `wrangler.toml` 中配置：

```
EMAIL_SERVICE = resend
EMAIL_API_KEY = re_你的API_Key
EMAIL_FROM = onboarding@resend.dev  # 测试用，或使用已验证的域名邮箱
ADMIN_EMAIL = 你的管理员邮箱
```

### 其他邮件服务

代码也支持 SendGrid 和 Mailgun，只需更改 `EMAIL_SERVICE` 环境变量即可。

**SendGrid:**
```
EMAIL_SERVICE = sendgrid
EMAIL_API_KEY = SG.你的API_Key
```

**Mailgun:**
```
EMAIL_SERVICE = mailgun
EMAIL_API_KEY = 你的API_Key
MAILGUN_DOMAIN = 你的域名
```

### 邮件通知功能

配置完成后，系统会在以下情况自动发送邮件通知：

1. **用户订阅时** - 发送通知到 `ADMIN_EMAIL`
2. **用户提交留言时** - 发送留言内容到 `ADMIN_EMAIL`

## 故障排查

### 邮件发送失败

#### 1. 检查环境变量

确认以下变量已正确配置：
- `EMAIL_SERVICE`
- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`

#### 2. 查看 Cloudflare Workers 日志

1. 进入 Cloudflare Dashboard
2. **Workers & Pages** → 你的 Worker → **Logs**
3. 查找错误信息：
   - `Email service error:` - 邮件服务错误
   - `Failed to send subscription notification:` - 订阅通知失败
   - `Failed to send contact notification:` - 留言通知失败

#### 3. 常见错误

**422 Unprocessable Entity**
- 原因：发件人邮箱未验证
- 解决：使用 `onboarding@resend.dev` 或验证域名

**401 Unauthorized**
- 原因：API Key 无效
- 解决：检查 API Key 是否正确，重新生成并更新

**403 Forbidden**
- 原因：API Key 权限不足或域名未验证
- 解决：检查 API Key 权限，验证域名

#### 4. 检查 Resend Dashboard

1. 登录 https://resend.com
2. 进入 **Dashboard** → **Emails**
3. 查看发送历史和状态

### 数据库问题

#### 初始化失败

```bash
# 检查数据库连接
wrangler d1 execute fashion-store-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# 手动运行迁移
wrangler d1 execute fashion-store-db --file=./migrations/0001_initial.sql
```

#### 重置数据库

```bash
# 删除并重新创建数据库
# 在 Cloudflare Dashboard 中删除数据库，然后重新创建
```

## 管理员配置

### 设置管理员密码

```bash
# 本地设置
npm run update-password

# 远程设置
npm run update-password:remote
```

或通过系统配置 API：

```bash
curl -X POST https://your-worker.workers.dev/api/system-configs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "admin_password",
    "value": "your_hashed_password",
    "type": "string"
  }'
```

## 生产环境建议

1. **使用环境变量而非 wrangler.toml**
   - 在 Cloudflare Dashboard 中配置敏感信息
   - 避免将 API Key 提交到代码仓库

2. **验证域名**
   - 在 Resend 中验证你的域名
   - 使用自定义发件人邮箱提高可信度

3. **监控日志**
   - 定期检查 Cloudflare Workers 日志
   - 监控 Resend Dashboard 的发送状态

4. **备份数据库**
   - 定期导出 D1 数据库
   - 保存重要的配置信息

## 更新部署

```bash
# 拉取最新代码
git pull

# 安装依赖（如有更新）
npm install

# 运行数据库迁移（如有新迁移）
npm run migrate

# 重新部署
npm run deploy
```

