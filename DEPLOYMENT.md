# 部署指南 - Fashion Store

本指南将帮助您将 Fashion Store 项目部署到 GitHub 和 Cloudflare。

## 前置要求

1. GitHub 账号
2. Cloudflare 账号
3. Node.js 20+ 已安装

## 部署架构

- **前端**: Cloudflare Pages（静态网站托管）
- **后端**: Cloudflare Workers（边缘计算）
- **部署方式**: 分开部署，互不影响

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

### 方式 A: 通过 GitHub Actions（推荐）

1. 确保已配置 GitHub Secrets（步骤 5）
2. 推送代码到 GitHub：
   ```bash
   git push origin main
   ```
3. GitHub Actions 会自动检测 `frontend/` 目录的变更并部署

### 方式 B: 通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 在左侧菜单选择 "Workers & Pages"
3. 点击 "Create application" > "Pages" > "Connect to Git"
4. 选择您的 GitHub 账号，然后选择 `fashion-store` 仓库
5. 点击 "Begin setup"
6. 配置构建设置：
   - **Project name**: `fashion-store`
   - **Production branch**: `main`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`
7. 点击 "Save and Deploy"

### 方式 C: 手动部署

```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name=fashion-store
```

## 步骤 7: 部署后端（Cloudflare Workers）

### 方式 A: 通过 Cloudflare Dashboard（推荐，最简单）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录您的账号

2. **创建 Worker**
   - 在左侧菜单选择 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Workers"
   - 点击 "Create Worker"

3. **配置 Worker**
   - **Worker name**: `fashion-store-api`
   - 点击 "Deploy" 先创建一个空 Worker

4. **上传代码**
   - 在 Worker 页面，点击 "Quick edit" 或 "Edit code"
   - 打开 `backend/src/index.js` 文件，复制全部内容
   - 粘贴到 Cloudflare Dashboard 的编辑器中
   - 点击 "Save and deploy"

5. **获取 Worker URL**
   - 部署成功后，在 Worker 页面可以看到 URL
   - 格式类似：`https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`

### 方式 B: 使用 Wrangler CLI（本地部署）

1. **安装依赖**（如果还没安装）：
   ```bash
   cd backend
   npm install
   ```

2. **登录 Cloudflare**：
   ```bash
   npx wrangler login
   ```
   - 这会打开浏览器，登录并授权

3. **部署 Worker**：
   ```bash
   npm run deploy
   ```
   或
   ```bash
   npx wrangler deploy
   ```

4. **查看部署结果**：
   - 部署成功后会显示 Worker URL
   - 格式类似：`https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`

### 方式 C: 通过 GitHub Actions（自动部署）

1. **确保已配置 GitHub Secrets**（步骤 5）
2. **推送代码到 GitHub**：
   ```bash
   git add backend/
   git commit -m "Add backend API"
   git push origin main
   ```
3. **GitHub Actions 会自动部署**
   - 进入 GitHub 仓库的 "Actions" 标签页
   - 查看 "Deploy Backend to Cloudflare Workers" workflow
   - 等待部署完成

### 配置 Workers 路由（可选，需要自定义域名）

如果需要使用自定义域名，在 `backend/wrangler.toml` 中配置：

```toml
[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

**注意**：需要先在 Cloudflare 添加域名并配置 DNS。

## 步骤 8: 验证部署

### 前端验证

1. 部署完成后，Cloudflare 会提供一个 URL，格式类似：
   `https://fashion-store.pages.dev`
2. 访问该 URL 验证网站是否正常运行
3. 测试管理面板：访问 `https://your-domain.pages.dev/admin`

### 后端验证

1. 访问健康检查端点：
   `https://fashion-store-api.your-subdomain.workers.dev/api/health`
2. 应该返回：`{"status":"ok","timestamp":"..."}`

### 连接前后端

1. **获取后端 API URL**
   - 部署成功后，Worker URL 会显示在 Cloudflare Dashboard
   - 格式：`https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`

2. **配置前端环境变量**
   - 在 `frontend/` 目录创建 `.env` 文件（如果不存在）
   - 添加以下内容：
     ```
     VITE_API_URL=https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev
     ```
   - 替换 `YOUR_SUBDOMAIN` 为您的实际子域名

3. **重新构建和部署前端**
   ```bash
   cd frontend
   npm run build
   ```
   - 如果使用 GitHub Actions，推送代码会自动重新部署
   - 如果使用 Cloudflare Dashboard，重新部署项目

**注意**：前端代码已经集成了 API 调用功能，配置环境变量后即可使用。

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

## 持续部署

配置完成后，每次您：
- 推送到 `main` 分支
- 创建 Pull Request 到 `main` 分支

GitHub Actions 会自动：
- 检测变更路径（`frontend/` 或 `backend/`）
- 触发相应的部署流程
- 部署到 Cloudflare

### 部署触发规则

- **前端变更**: 修改 `frontend/` 目录 → 自动部署前端
- **后端变更**: 修改 `backend/` 目录 → 自动部署后端
- **同时变更**: 修改两个目录 → 同时部署前后端

## 更新部署

每次更新代码：

```bash
# 修改代码后
git add .
git commit -m "Update: 描述您的更改"
git push origin main
```

Cloudflare 会自动重新部署。

## 故障排除

### 前端部署失败

1. 检查 GitHub Actions 日志：
   - 进入仓库的 "Actions" 标签页
   - 查看 "Deploy Frontend to Cloudflare Pages" workflow
2. 常见问题：
   - **构建失败**: 检查 `frontend/package.json` 中的依赖
   - **路径错误**: 确认构建命令和输出目录正确
   - **Token 错误**: 确认 GitHub Secrets 配置正确

### 后端部署失败

1. 检查 GitHub Actions 日志：
   - 查看 "Deploy Backend to Cloudflare Workers" workflow
2. 常见问题：
   - **依赖错误**: 检查 `backend/package.json`
   - **配置错误**: 检查 `backend/wrangler.toml`
   - **Token 权限**: 确认 API Token 有 Workers 编辑权限

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
