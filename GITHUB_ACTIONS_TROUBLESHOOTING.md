# GitHub Actions 故障排查指南

## 常见失败原因

### 1. Secrets 未配置或配置错误

GitHub Actions 需要以下 Secrets 才能正常工作：

**必需 Secrets：**
- `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID

**检查方法：**
1. 进入 GitHub 仓库
2. 点击 Settings → Secrets and variables → Actions
3. 确认以上两个 secrets 是否存在且正确

**如何获取 Cloudflare API Token：**
1. 登录 Cloudflare Dashboard
2. 进入 My Profile → API Tokens
3. 点击 "Create Token"
4. 使用 "Edit Cloudflare Workers" 模板
5. 设置权限：
   - Account: Workers Scripts (Edit)
   - Account: Workers KV Storage (Edit)
   - Account: Account Settings (Read)
   - Zone: Zone Settings (Read)
6. 复制生成的 token

**如何获取 Account ID：**
1. 登录 Cloudflare Dashboard
2. 在右侧边栏可以看到 Account ID
3. 或者进入 Workers & Pages，在 URL 中可以找到

### 2. 项目名称不匹配

**前端部署：**
- Workflow 中配置的 `projectName: fashion-store`
- 确保 Cloudflare Pages 中的项目名称与此一致

**后端部署：**
- `wrangler.toml` 中配置的 `name = "fashion-store-api"`
- 确保 Cloudflare Workers 中的服务名称与此一致

### 3. 数据库配置问题

**后端部署可能因为 D1 数据库配置失败：**
- 检查 `wrangler.toml` 中的 `database_id` 是否正确
- 确保数据库已创建并绑定到 Worker

### 4. 依赖安装失败

**可能原因：**
- `package-lock.json` 文件缺失或损坏
- Node.js 版本不兼容

**解决方法：**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### 5. 构建失败

**前端构建可能失败的原因：**
- 代码语法错误
- 环境变量缺失
- 依赖版本冲突

**检查方法：**
```bash
cd frontend
npm install
npm run build
```

## 诊断步骤

### 步骤 1: 查看具体错误日志

1. 进入 GitHub 仓库的 Actions 页面
2. 点击失败的 workflow run
3. 展开失败的步骤（通常是红色的）
4. 查看错误日志，找到具体的错误信息

### 步骤 2: 检查常见错误

**错误：`Error: Missing required secrets`**
- 解决：配置缺失的 secrets

**错误：`Error: Authentication failed`**
- 解决：检查 `CLOUDFLARE_API_TOKEN` 是否正确

**错误：`Error: Project not found`**
- 解决：检查项目名称是否匹配，或先在 Cloudflare 中创建项目

**错误：`Error: Database not found`**
- 解决：检查 D1 数据库是否已创建并绑定

**错误：`Error: npm ci failed`**
- 解决：检查 `package-lock.json` 是否存在且有效

### 步骤 3: 手动测试部署

**测试后端部署：**
```bash
cd backend
npm install
npx wrangler deploy
```

**测试前端构建：**
```bash
cd frontend
npm install
npm run build
```

## 快速修复建议

### 如果所有 workflow 都失败：

1. **检查 Secrets 配置**
   ```bash
   # 在 GitHub 仓库中检查
   Settings → Secrets and variables → Actions
   ```

2. **验证 Cloudflare 配置**
   - 确认 API Token 有效
   - 确认 Account ID 正确
   - 确认项目已创建

3. **清理并重新提交**
   ```bash
   # 确保所有文件都已提交
   git status
   git add -A
   git commit -m "Fix GitHub Actions configuration"
   git push
   ```

4. **手动触发 workflow**
   - 进入 Actions 页面
   - 选择对应的 workflow
   - 点击 "Run workflow"

## 联系支持

如果以上方法都无法解决问题，请：
1. 复制完整的错误日志
2. 检查 Cloudflare Dashboard 中的相关配置
3. 确认 GitHub 仓库的权限设置

