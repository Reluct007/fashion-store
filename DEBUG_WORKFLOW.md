# GitHub Actions 调试指南

## GitHub Secrets 安全机制

**重要说明：**
- GitHub Secrets 的值是**加密存储**的
- 出于安全考虑，**无法查看已保存的值**
- 只能**重新设置**，不能查看
- 这是正常的安全机制，不是问题

## 验证 Secrets 是否正确设置

### 方法 1: 检查更新时间
- 在 Repository secrets 页面，查看 "Last updated" 时间
- 如果显示 "3-4 minutes ago"，说明刚刚更新过
- ✅ 您的 secrets 显示已更新

### 方法 2: 重新设置验证
如果担心值不正确，可以：
1. 点击 **Edit** (铅笔图标)
2. 重新粘贴正确的值
3. 点击 **Update secret**

## 查看具体错误信息

要诊断失败原因，需要查看详细的错误日志：

### 步骤：
1. 进入 Actions 页面
2. 点击失败的 workflow run（红色 X）
3. 点击左侧的失败步骤（通常是 "Deploy to Cloudflare Workers" 或 "Deploy to Cloudflare Pages"）
4. 查看右侧的详细错误日志

### 常见错误类型：

**1. Authentication 错误**
```
Error: Authentication failed
```
- 原因：API Token 不正确或权限不足
- 解决：检查 API Token 是否正确，权限是否足够

**2. Account 错误**
```
Error: Account not found
```
- 原因：Account ID 不正确
- 解决：检查 Account ID 是否正确

**3. Project 错误**
```
Error: Project not found
```
- 原因：项目名称不匹配
- 解决：检查 Cloudflare 中的项目名称

**4. Build 错误**
```
Error: npm ci failed
```
- 原因：依赖安装失败
- 解决：检查 package-lock.json 是否存在

## 快速测试方法

### 测试 API Token 是否有效

可以使用 curl 命令测试（在本地终端）：

```bash
# 测试 API Token
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

如果返回 `"success": true`，说明 Token 有效。

### 测试 Account ID

```bash
# 获取账户信息
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

检查返回的账户列表中是否包含您的 Account ID。

## 下一步操作

1. **查看错误日志** - 这是最重要的，能告诉我们具体问题
2. **验证 API Token 权限** - 确保有足够的权限
3. **检查项目名称** - 确保 Cloudflare 中的项目名称匹配

