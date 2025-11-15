# 快速配置邮件服务（5 分钟）

## 最简单的方法：使用 Resend

### 步骤 1: 注册 Resend（2 分钟）

1. 访问 https://resend.com
2. 点击 "Sign Up" 注册账号
3. 验证邮箱

### 步骤 2: 获取 API Key（1 分钟）

1. 登录后，点击左侧 "API Keys"
2. 点击 "Create API Key"
3. 输入名称（如 "Fashion Store"）
4. 复制生成的 API Key（格式：`re_xxxxxxxxxxxxx`）

### 步骤 3: 配置 Cloudflare Workers（2 分钟）

**方法 A: 通过 Cloudflare Dashboard（推荐）**

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages** → 选择你的 Worker（fashion-store-api）
3. 点击 **Settings** → **Variables**
4. 在 **Environment Variables** 部分添加：

   ```
   EMAIL_SERVICE = resend
   EMAIL_API_KEY = re_你的API_Key
   EMAIL_FROM = onboarding@resend.dev  （测试用，或使用已验证的域名邮箱）
   ADMIN_EMAIL = 你的邮箱地址
   ```

5. 点击 **Save**

**方法 B: 通过 wrangler.toml（本地开发）**

在 `wrangler.toml` 的 `[vars]` 部分添加：

```toml
EMAIL_SERVICE = "resend"
EMAIL_API_KEY = "re_你的API_Key"
EMAIL_FROM = "onboarding@resend.dev"
ADMIN_EMAIL = "你的邮箱地址"
```

### 步骤 4: 测试（1 分钟）

1. 部署 Worker：
   ```bash
   cd backend
   npx wrangler deploy
   ```

2. 在前端页面订阅邮箱或提交留言
3. 检查你的管理员邮箱是否收到通知

## 使用已验证的域名邮箱（可选）

如果你想使用自定义域名邮箱（如 `noreply@yourdomain.com`）：

1. 在 Resend Dashboard 点击 **Domains**
2. 点击 **Add Domain**
3. 输入你的域名
4. 按照提示添加 DNS 记录（SPF、DKIM、DMARC）
5. 等待验证通过（通常几分钟）
6. 将 `EMAIL_FROM` 更新为 `noreply@yourdomain.com`

## 免费额度

- **Resend**: 每月 3,000 封邮件（免费）
- **SendGrid**: 每月 100 封邮件（免费）
- **Mailgun**: 每月 1,000 封邮件（免费，前 3 个月 5,000 封）

对于大多数网站，Resend 的免费额度已经足够。

## 需要帮助？

- 查看详细配置文档：`EMAIL_CONFIG.md`
- Resend 文档：https://resend.com/docs
- 检查 Cloudflare Workers 日志查看错误信息

