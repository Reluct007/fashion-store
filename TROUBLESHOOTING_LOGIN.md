# 登录问题排查指南

## 问题：无法登录，显示 "Invalid credentials"

### 快速解决方案

**即使数据库未配置，现在也可以登录！**

后端已经更新，支持两种登录方式：
1. **数据库认证**（如果已配置数据库）
2. **内存认证回退**（如果数据库未配置）

### 默认登录凭证

- **用户名**: `admin`
- **密码**: `admin123`

## 排查步骤

### 步骤 1: 检查后端是否正常运行

访问健康检查端点：
```
https://fashion-store-api.reluct007.workers.dev/api/health
```

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

如果无法访问，说明后端未部署或有问题。

### 步骤 2: 测试登录 API

使用 curl 或 Postman 测试：

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

应该返回：
```json
{
  "success": true,
  "token": "admin_token",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 步骤 3: 检查前端 API 配置

确认前端环境变量配置正确：

1. 检查 `.env.local` 或 Cloudflare Pages 环境变量
2. 确认 `VITE_API_URL` 指向正确的后端地址

### 步骤 4: 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签，检查是否有错误
3. 查看 Network 标签，检查登录请求：
   - 请求是否发送成功
   - 响应状态码是什么
   - 响应内容是什么

### 步骤 5: 检查数据库配置（如果使用数据库）

如果已配置数据库，检查：

1. **数据库是否已创建**
   ```bash
   cd backend
   npx wrangler d1 list
   ```

2. **用户是否已创建**
   ```bash
   npx wrangler d1 execute fashion-store-db \
     --command="SELECT * FROM users WHERE username='admin';"
   ```

3. **如果没有用户，手动创建**
   ```bash
   npx wrangler d1 execute fashion-store-db \
     --command="INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@fashionstore.com', 'admin123', 'admin');"
   ```

## 常见问题

### Q1: 显示 "Invalid credentials"

**可能原因：**
- 数据库未配置，但后端数据库初始化失败
- 用户不存在于数据库中
- 密码不匹配

**解决方案：**
1. 后端已更新，即使数据库未配置也能登录（使用内存认证）
2. 如果还是不行，检查后端日志：
   ```bash
   cd backend
   npx wrangler tail
   ```

### Q2: 网络错误

**可能原因：**
- 后端 API URL 配置错误
- CORS 问题
- 网络连接问题

**解决方案：**
1. 检查前端环境变量中的 API URL
2. 确认后端 CORS 配置正确
3. 检查浏览器控制台的网络请求

### Q3: 数据库错误

**可能原因：**
- 数据库未创建
- wrangler.toml 配置错误
- 数据库初始化失败

**解决方案：**
1. 按照 `QUICK_DATABASE_SETUP.md` 创建数据库
2. 或者暂时不使用数据库（后端会自动回退到内存认证）

## 手动测试登录

### 使用 curl

```bash
curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 使用 JavaScript（浏览器控制台）

```javascript
fetch('https://fashion-store-api.reluct007.workers.dev/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## 重新部署后端

如果修复了代码，需要重新部署：

```bash
cd backend
npm run deploy
```

或者通过 GitHub Actions 自动部署（如果已配置）。

## 检查后端日志

查看实时日志：

```bash
cd backend
npx wrangler tail
```

这会显示所有的请求和错误信息，帮助诊断问题。

## 联系支持

如果以上方法都无法解决问题：

1. 检查后端日志：`npx wrangler tail`
2. 检查 Cloudflare Dashboard 中的 Worker 日志
3. 查看浏览器控制台的完整错误信息
4. 确认前后端代码都是最新版本

---

**重要提示**：后端已更新，现在即使数据库未配置也能登录（使用内存认证回退）。如果仍然无法登录，请检查：
1. 后端是否已部署最新版本
2. 前端是否正确连接到后端 API
3. 浏览器控制台是否有错误信息

