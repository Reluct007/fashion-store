# 部署指南 - Fashion Store

本指南将帮助您将 Fashion Store 项目部署到 GitHub 和 Cloudflare。

## 前置要求

1. GitHub 账号
2. Cloudflare 账号
3. Node.js 20+ 已安装

## 部署架构

- **前端**: Cloudflare Pages（静态网站托管）
- **后端**: Cloudflare Workers（边缘计算）
- **部署方式**: 自动部署（GitHub Actions）+ 手动部署选项

## 自动部署配置

### GitHub Actions 自动部署

项目已配置自动部署，当您推送代码到 `main` 分支时：

- **修改 `frontend/` 目录** → 自动部署前端到 Cloudflare Pages
- **修改 `backend/` 目录** → 自动部署后端到 Cloudflare Workers
- **同时修改两个目录** → 同时部署前后端

### 手动触发部署

如果需要手动触发部署：

1. 访问 GitHub 仓库：https://github.com/Reluct007/fashion-store
2. 点击 "Actions" 标签
3. 选择对应的 workflow（前端或后端）
4. 点击 "Run workflow" 按钮

## 步骤 1: 创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `fashion-store`
   - Description: `Fashion e-commerce website built with React`
   - 选择 Public 或 Private
   - **不要** 勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

## 步骤 2: 初始化 Git 并推送代码

在项目根目录执行以下命令：

```bash
cd fashion-store

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Fashion Store project"

# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/fashion-store.git

# 设置主分支
git branch -M main

# 推送代码到 GitHub
git push -u origin main
```

## 步骤 3: 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角的用户图标，选择 "My Profile"
3. 进入 "API Tokens" 标签页
4. 点击 "Create Token"
5. 使用 "Edit Cloudflare Workers" 模板或自定义权限：
   - Account: Cloudflare Pages:Edit, Workers:Edit
   - Zone: Zone:Read
6. 点击 "Continue to summary" 然后 "Create Token"
7. **复制并保存 Token**（只显示一次）

## 步骤 4: 获取 Cloudflare Account ID

1. 在 Cloudflare Dashboard 右侧边栏找到 "Account ID"
2. 复制 Account ID

## 步骤 5: 配置 GitHub Secrets

1. 在 GitHub 仓库页面，点击 "Settings"
2. 在左侧菜单选择 "Secrets and variables" > "Actions"
3. 点击 "New repository secret"
4. 添加以下 Secrets：

   **Secret 1: CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: 粘贴步骤 3 中获取的 API Token

   **Secret 2: CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: 粘贴步骤 4 中获取的 Account ID

## 步骤 6: 部署前端（Cloudflare Pages）

### 方式 A: 通过 GitHub Actions 自动部署（推荐）

1. **确保已配置 GitHub Secrets**（步骤 5）
2. **推送代码到 GitHub**：
   ```bash
   git add frontend/
   git commit -m "Update frontend"
   git push origin main
   ```
3. **GitHub Actions 会自动部署**
   - 进入 GitHub 仓库的 "Actions" 标签页
   - 查看 "Deploy Frontend to Cloudflare Pages" workflow
   - 等待部署完成（约 2-5 分钟）

### 方式 B: 通过 Cloudflare Dashboard（Git 连接）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录您的账号

2. **创建 Pages 项目**
   - 在左侧菜单选择 "Workers & Pages"
   - 点击 "Create application" > "Pages" > "Connect to Git"
   - 选择您的 GitHub 账号，然后选择 `fashion-store` 仓库
   - 点击 "Begin setup"

3. **配置构建设置**
   - **Project name**: `fashion-store`
   - **Production branch**: `main`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`

4. **添加环境变量**
   - 在 "Settings" → "Environment variables" 中添加：
   - Name: `VITE_API_URL`
   - Value: `https://fashion-store-api.reluct007.workers.dev`

5. **保存并部署**
   - 点击 "Save and Deploy"
   - 等待构建完成

### 方式 C: 使用 Wrangler CLI（命令行）

```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name=fashion-store
```

## 步骤 7: 部署后端（Cloudflare Workers）

### 方式 A: 通过 GitHub Actions 自动部署（推荐）

1. **确保已配置 GitHub Secrets**（步骤 5）
2. **推送代码到 GitHub**：
   ```bash
   git add backend/
   git commit -m "Update backend"
   git push origin main
   ```
3. **GitHub Actions 会自动部署**
   - 进入 GitHub 仓库的 "Actions" 标签页
   - 查看 "Deploy Backend to Cloudflare Workers" workflow
   - 等待部署完成（约 1-2 分钟）

### 方式 B: 通过 Cloudflare Dashboard

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录您的账号

2. **创建或访问 Worker**
   - 在左侧菜单选择 "Workers & Pages"
   - 如果 Worker 已存在，点击 "fashion-store-api"
   - 如果不存在，点击 "Create application" > "Workers" > "Create Worker"
   - Worker name: `fashion-store-api`

3. **上传代码**
   - 在 Worker 页面，点击 "Quick edit" 或 "Edit code"
   - 打开 `backend/src/index.js` 文件，复制全部内容
   - 粘贴到 Cloudflare Dashboard 的编辑器中
   - 点击 "Save and deploy"

### 方式 C: 使用 Wrangler CLI（命令行）

```bash
cd backend
npm install
npx wrangler login  # 首次使用需要登录
npm run deploy
```

## 步骤 8: 验证部署

### 前端验证

1. 部署完成后，Cloudflare 会提供一个 URL，格式类似：
   `https://fashion-store.pages.dev`
2. 访问该 URL 验证网站是否正常运行
3. 测试管理面板：访问 `https://your-domain.pages.dev/admin`
4. 测试产品详情页：点击任意产品

### 后端验证

1. 访问健康检查端点：
   `https://fashion-store-api.reluct007.workers.dev/api/health`
2. 应该返回：`{"status":"ok","timestamp":"..."}`

### 连接前后端

1. **获取后端 API URL**
   - 部署成功后，Worker URL 会显示在 Cloudflare Dashboard
   - 格式：`https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`

2. **配置前端环境变量**
   - 在 Cloudflare Pages 项目设置中，添加环境变量：
   - **变量名**: `VITE_API_URL`
   - **值**: `https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`
   
   或者在 GitHub Actions 中配置（推荐）：
   - 在 `.github/workflows/deploy-frontend.yml` 中添加环境变量

3. **重新部署前端**
   - 如果使用环境变量文件，需要重新构建并部署
   - 如果使用 Cloudflare Pages 环境变量，保存后会自动重新部署

**注意**：前端代码已经集成了 API 调用功能，配置环境变量后即可使用。

## 自动部署流程

### 工作流程

1. **修改代码**
   ```bash
   # 修改 backend/src/index.js 或其他后端文件
   git add backend/
   git commit -m "Update backend API"
   git push origin main
   ```

2. **自动触发部署**
   - GitHub Actions 检测到 `backend/` 目录变更
   - 自动运行 "Deploy Backend to Cloudflare Workers" workflow
   - 构建并部署到 Cloudflare Workers

3. **验证部署**
   - 查看 GitHub Actions 日志确认部署成功
   - 测试 API 端点验证功能正常

### 部署触发规则

- **前端变更**: 修改 `frontend/` 目录 → 自动部署前端
- **后端变更**: 修改 `backend/` 目录 → 自动部署后端
- **同时变更**: 修改两个目录 → 同时部署前后端
- **Workflow 变更**: 修改 `.github/workflows/` 文件 → 触发相应部署

## 更新部署

### 更新代码并自动部署

每次更新代码：

```bash
# 修改代码后
git add .
git commit -m "Update: 描述您的更改"
git push origin main
```

**自动部署流程**：
- GitHub Actions 检测变更
- 根据变更路径自动触发相应部署
- 等待部署完成（可在 Actions 页面查看）

### 手动触发部署

如果需要手动触发：

1. 访问 GitHub 仓库的 "Actions" 标签
2. 选择对应的 workflow
3. 点击 "Run workflow"
4. 选择分支并运行

## 自定义域名（可选）

### 前端域名

1. 在 Cloudflare Pages 项目页面，点击 "Custom domains"
2. 点击 "Set up a custom domain"
3. 输入您的域名（例如：`fashion-store.com`）
4. 按照提示配置 DNS 记录
5. Cloudflare 会自动配置 SSL 证书

### 后端域名

1. 在 Cloudflare Workers 项目页面，配置自定义路由
2. 或使用 Cloudflare Workers 的子域名

## 故障排除

### GitHub Actions 部署失败

1. **检查 Secrets 配置**
   - 确认 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 已正确配置
   - 确认 Token 有足够的权限

2. **查看日志**
   - 进入 GitHub 仓库的 "Actions" 标签页
   - 点击失败的 workflow 运行
   - 查看详细的错误日志

3. **常见问题**
   - **Token 权限不足**: 检查 Token 是否有 Workers:Edit 和 Pages:Edit 权限
   - **Account ID 错误**: 确认 Account ID 正确
   - **构建失败**: 检查代码是否有错误

### 前端部署失败

1. 检查 GitHub Actions 日志
2. 常见问题：
   - **构建失败**: 检查 `frontend/package.json` 中的依赖
   - **路径错误**: 确认构建命令和输出目录正确
   - **环境变量**: 确认环境变量配置正确

### 后端部署失败

1. 检查 GitHub Actions 日志
2. 常见问题：
   - **依赖错误**: 检查 `backend/package.json`
   - **配置错误**: 检查 `backend/wrangler.toml`
   - **代码错误**: 检查代码语法

### 网站无法访问

1. 检查 Cloudflare Pages 部署状态
2. 确认自定义域名 DNS 配置正确
3. 检查浏览器控制台是否有错误
4. 确认前端 API URL 配置正确

### API 无法访问

1. 检查 Cloudflare Workers 部署状态
2. 测试健康检查端点
3. 检查 CORS 配置
4. 确认路由配置正确

## 本地开发

```bash
# 安装依赖
npm run install:all

# 启动前端开发服务器
npm run dev

# 启动后端开发服务器（新终端）
npm run dev:backend
```

访问：
- 前端: http://localhost:5173
- 后端 API: http://localhost:8787

## 技术支持

如果遇到问题：
1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
4. 检查项目 README.md

---

**部署完成后，您的网站将可以通过 Cloudflare 提供的 URL 访问！**
**每次推送代码到 main 分支，GitHub Actions 会自动部署到 Cloudflare！**
