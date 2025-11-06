# 测试 Cloudflare Secrets 配置

## 快速验证脚本

### 测试 API Token

在本地终端运行（替换 YOUR_API_TOKEN）：

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer CnzjkYVNzF7hVL_8_s6vucRypx2EgBsoKF1uPInf" \
  -H "Content-Type: application/json"
```

**预期结果：**
```json
{
  "result": {
    "id": "...",
    "status": "active"
  },
  "success": true
}
```

### 测试 Account ID

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer CnzjkYVNzF7hVL_8_s6vucRypx2EgBsoKF1uPInf" \
  -H "Content-Type: application/json"
```

**检查返回结果中是否包含：**
- `"id": "027689a63c74055c9dee23142e623d92"`

### 检查 Workers 权限

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/027689a63c74055c9dee23142e623d92/workers/scripts" \
  -H "Authorization: Bearer CnzjkYVNzF7hVL_8_s6vucRypx2EgBsoKF1uPInf" \
  -H "Content-Type: application/json"
```

如果返回 403 Forbidden，说明权限不足。

## 检查 API Token 权限

您的 API Token 需要以下权限：

1. **Account: Workers Scripts (Edit)**
2. **Account: Workers KV Storage (Edit)**
3. **Account: Account Settings (Read)**
4. **Account: D1 (Edit)** - 如果使用 D1 数据库
5. **Zone: Zone Settings (Read)** - 如果需要

## 验证项目是否存在

### 检查 Workers 项目

在 Cloudflare Dashboard：
1. 进入 **Workers & Pages**
2. 查看是否有名为 `fashion-store-api` 的 Worker

### 检查 Pages 项目

在 Cloudflare Dashboard：
1. 进入 **Workers & Pages** → **Pages**
2. 查看是否有名为 `fashion-store` 的项目

## 如果测试失败

### API Token 无效
- 重新创建 API Token
- 确保使用 "Edit Cloudflare Workers" 模板
- 确保所有必需权限都已勾选

### Account ID 不正确
- 在 Cloudflare Dashboard 右侧边栏查看 Account ID
- 确保复制完整，没有多余空格

### 权限不足
- 检查 API Token 的权限设置
- 确保有 Workers Scripts (Edit) 权限

