# 测试邮件配置

## 配置检查清单

在测试之前，请确认你已经在 Cloudflare Dashboard 中配置了以下环境变量：

✅ **必须配置的变量：**
- `EMAIL_SERVICE` = `resend`
- `EMAIL_API_KEY` = `re_你的API_Key`
- `ADMIN_EMAIL` = `你的邮箱地址`

✅ **可选配置的变量：**
- `EMAIL_FROM` = `onboarding@resend.dev`（如果不配置，会使用默认值）

## 测试步骤

### 1. 重新部署 Worker

配置环境变量后，需要重新部署 Worker 才能生效：

```bash
cd backend
npx wrangler deploy
```

或者如果 Worker 已设置为自动部署，等待几分钟让配置生效。

### 2. 测试订阅通知

1. 访问你的网站首页
2. 在页面底部的订阅表单中输入一个测试邮箱
3. 点击订阅
4. 检查你的 `ADMIN_EMAIL` 邮箱是否收到通知邮件

**预期结果：**
- 订阅成功提示
- 管理员邮箱收到标题为 "新用户订阅通知 - Fashion Store" 的邮件
- 邮件内容包含订阅邮箱、来源和时间

### 3. 测试留言通知

1. 访问联系页面（Contact）
2. 填写留言表单：
   - 姓名：测试用户
   - 邮箱：test@example.com
   - 主题：测试留言
   - 留言内容：这是一条测试留言
3. 提交表单
4. 检查你的 `ADMIN_EMAIL` 邮箱是否收到通知邮件

**预期结果：**
- 提交成功提示
- 管理员邮箱收到标题为 "新留言通知: 测试留言" 的邮件
- 邮件内容包含留言者的姓名、邮箱、主题和留言内容

## 故障排查

### 问题 1: 没有收到邮件

**检查步骤：**

1. **检查 Cloudflare Workers 日志**
   - 进入 Cloudflare Dashboard
   - Workers & Pages → 你的 Worker → Logs
   - 查看是否有错误信息

2. **检查环境变量是否正确配置**
   - Workers & Pages → 你的 Worker → Settings → Variables
   - 确认所有变量都已正确设置
   - 特别注意 `EMAIL_API_KEY` 是否完整（以 `re_` 开头）

3. **检查 Resend API Key 是否有效**
   - 登录 Resend Dashboard
   - 确认 API Key 状态为 "Active"
   - 检查是否超过免费额度限制

4. **检查管理员邮箱地址**
   - 确认 `ADMIN_EMAIL` 配置正确
   - 检查垃圾邮件文件夹

### 问题 2: 收到错误提示

**常见错误及解决方法：**

- **"Email service not configured"**
  - 原因：未配置 `EMAIL_API_KEY`
  - 解决：在 Cloudflare Dashboard 中添加 `EMAIL_API_KEY` 环境变量

- **"Admin email not configured"**
  - 原因：未配置 `ADMIN_EMAIL`
  - 解决：在 Cloudflare Dashboard 中添加 `ADMIN_EMAIL` 环境变量

- **"Email service returned 401"**
  - 原因：API Key 无效或过期
  - 解决：在 Resend Dashboard 重新生成 API Key 并更新环境变量

- **"Email service returned 403"**
  - 原因：域名未验证（如果使用自定义发件人）
  - 解决：使用 `onboarding@resend.dev` 作为 `EMAIL_FROM`，或验证域名

### 问题 3: 邮件发送成功但未收到

**可能原因：**

1. **邮件被标记为垃圾邮件**
   - 检查垃圾邮件文件夹
   - 将发件人添加到联系人

2. **邮箱地址错误**
   - 确认 `ADMIN_EMAIL` 配置正确
   - 检查是否有拼写错误

3. **邮件服务商延迟**
   - 等待几分钟后再次检查
   - 查看 Resend Dashboard 的发送日志

## 查看发送日志

### Resend Dashboard

1. 登录 https://resend.com
2. 进入 Dashboard → Emails
3. 查看发送历史和状态

### Cloudflare Workers 日志

1. 进入 Cloudflare Dashboard
2. Workers & Pages → 你的 Worker → Logs
3. 查看实时日志或历史日志
4. 搜索关键词：`email`、`notification`、`error`

## 验证配置的 API 端点（可选）

如果你想通过 API 直接测试邮件发送，可以使用以下 curl 命令：

```bash
# 测试订阅通知（需要认证）
curl -X POST https://your-worker.workers.dev/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "test"
  }'

# 测试留言通知（需要认证）
curl -X POST https://your-worker.workers.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "subject": "测试",
    "message": "这是一条测试留言"
  }'
```

## 成功标志

✅ 配置成功的标志：
- 订阅邮箱后，管理员邮箱收到通知邮件
- 提交留言后，管理员邮箱收到通知邮件
- Cloudflare Workers 日志中没有错误信息
- Resend Dashboard 显示邮件发送成功

如果所有测试都通过，说明邮件配置已成功！🎉

