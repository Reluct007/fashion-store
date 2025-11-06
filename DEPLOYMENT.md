# 部署指南 - Fashion Store

本指南将帮助您将 Fashion Store 项目部署到 GitHub 和 Cloudflare。

## 前置要求

1. GitHub 账号
2. Cloudflare 账号
3. Node.js 20+ 已安装

## 部署架构

- **前端**: Cloudflare Pages（静态网站托管）
- **后端**: Cloudflare Workers（边缘计算）
- **数据库**: Cloudflare D1（边缘数据库）
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

## 步骤 7: 设置数据库（Cloudflare D1）

### 方式 A: 使用自动化脚本（推荐）

```bash
cd backend
node scripts/setup-database.js
```

或者使用 bash 脚本：

```bash
cd backend
./scripts/setup-database.sh
```

脚本会自动：
1. ✅ 检查并安装 Wrangler CLI
2. ✅ 登录 Cloudflare（如果未登录）
3. ✅ 创建 D1 数据库
4. ✅ 更新 `wrangler.toml` 配置
5. ✅ 初始化数据库表结构

### 方式 B: 手动设置

#### 步骤 1: 创建 D1 数据库

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录您的账号

2. **创建 D1 数据库**
   - 在左侧菜单选择 "Workers & Pages"
   - 点击 "D1" 标签
   - 点击 "Create database"
   - 输入数据库名称：`fashion-store-db`
   - 选择区域（建议选择离您最近的区域）
   - 点击 "Create"

3. **获取数据库 ID**
   - 创建完成后，在数据库详情页面可以看到 "Database ID"
   - 复制这个 ID

#### 步骤 2: 配置 wrangler.toml

打开 `backend/wrangler.toml` 文件，更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fashion-store-db"
database_id = "YOUR_DATABASE_ID_HERE"  # 替换为实际的数据库 ID
```

#### 步骤 3: 初始化远程数据库

**重要**：必须使用 `--remote` 标志来更新远程数据库！

```bash
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --file=./migrations/0001_initial.sql
```

这会创建所有必要的表（users, product_configs, system_configs）和默认管理员用户。

#### 步骤 4: 验证数据库

```bash
# 验证表结构
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"

# 验证用户
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

应该看到：
- 表：`users`, `product_configs`, `system_configs`
- 用户：`admin` / `admin123`

### 方式 C: 通过 Cloudflare Dashboard

1. 在 Cloudflare Dashboard 中进入 D1 数据库页面
2. 点击 `fashion-store-db` 数据库
3. 选择 "Console" 标签
4. 打开 `backend/migrations/0001_initial.sql` 文件
5. 复制全部内容
6. 粘贴到 D1 Console 中
7. 点击 "Execute" 执行

## 步骤 8: 部署后端（Cloudflare Workers）

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

**如果 GitHub Actions 失败**，可以使用下面的本地部署方式。

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

### 方式 C: 使用 Wrangler CLI（命令行，本地部署备选方案）

如果 GitHub Actions 部署失败，可以使用本地部署：

```bash
cd backend
npm install
npx wrangler login  # 首次使用需要登录
npm run deploy
```

## 步骤 9: 验证部署

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
   
   或者在 GitHub Actions 中配置（推荐）

3. **重新部署前端**
   - 如果使用环境变量文件，需要重新构建并部署
   - 如果使用 Cloudflare Pages 环境变量，保存后会自动重新部署

**注意**：前端代码已经集成了 API 调用功能，配置环境变量后即可使用。

## 数据库表结构

### users 表
- `id`: 主键
- `username`: 用户名（唯一）
- `email`: 邮箱（唯一）
- `password_hash`: 密码（当前为明文，生产环境应使用哈希）
- `role`: 角色（默认 'admin'）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### product_configs 表
- `id`: 主键
- `product_id`: 产品 ID
- `button_type`: 触发类型（'add_to_cart', 'buy_now', 'product_image', 'product_title', 'custom'）
- `action_type`: 操作类型（'link', 'api', 'modal'）
- `target_url`: 目标 URL（当 action_type 为 'link' 时）
- `api_endpoint`: API 端点（当 action_type 为 'api' 时）
- `is_enabled`: 是否启用
- `created_at`: 创建时间
- `updated_at`: 更新时间

### system_configs 表
- `id`: 主键
- `config_key`: 配置键（唯一）
- `config_value`: 配置值
- `config_type`: 配置类型（'string', 'number', 'boolean', 'json'）
- `description`: 描述
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 默认管理员账户

数据库初始化后，会自动创建默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

**重要**: 首次登录后，请立即修改密码！

## 自动部署流程

### 工作流程

**前端自动部署**：
1. **修改前端代码**
   ```bash
   git add frontend/
   git commit -m "Update frontend"
   git push origin main
   ```
2. **自动触发部署**
   - GitHub Actions 检测到 `frontend/` 目录变更
   - 自动运行 "Deploy Frontend to Cloudflare Pages" workflow
   - 构建并部署到 Cloudflare Pages

**后端自动部署**：
1. **修改后端代码**
   ```bash
   git add backend/
   git commit -m "Update backend API"
   git push origin main
   ```
2. **自动触发部署**
   - GitHub Actions 检测到 `backend/` 目录变更
   - 自动运行 "Deploy Backend to Cloudflare Workers" workflow
   - 构建并部署到 Cloudflare Workers

3. **如果部署失败**
   - 查看 GitHub Actions 日志排查问题
   - 或使用本地部署作为备选方案：
     ```bash
     cd backend
     npm run deploy
     ```

### 部署触发规则

- **前端变更**: 修改 `frontend/` 目录 → 自动部署前端到 Cloudflare Pages
- **后端变更**: 修改 `backend/` 目录 → 自动部署后端到 Cloudflare Workers
- **同时变更**: 修改两个目录 → 同时部署前后端
- **Workflow 变更**: 修改 `.github/workflows/` 文件 → 触发相应部署
- **部署失败**: GitHub Actions 失败时，可以使用本地部署作为备选方案

## 更新部署

### 更新代码并自动部署

每次更新代码：

```bash
git add .
git commit -m "Update: 描述您的更改"
git push origin main
```

**自动部署流程**：
- GitHub Actions 检测变更
- 根据变更路径自动触发相应部署
- 等待部署完成（可在 Actions 页面查看）

### 如果 GitHub Actions 部署失败

如果自动部署失败，可以使用本地部署：

**前端本地部署**：
```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name=fashion-store
```

**后端本地部署**：
```bash
cd backend
npm install
npm run deploy
```

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

### 数据库相关问题

#### 数据库未配置

如果看到 "Database not configured" 错误：
1. 确认已在 Cloudflare Dashboard 创建数据库
2. 确认 `wrangler.toml` 中的 `database_id` 已正确配置
3. 重新部署后端

#### 数据库初始化失败

如果数据库初始化失败：
1. 检查迁移 SQL 文件是否正确
2. 在 Cloudflare Dashboard 的 D1 Console 中手动执行 SQL
3. 查看 Worker 日志排查错误

#### 远程数据库表不存在

如果执行命令时提示 "no such table: users"：

**问题**：命令可能在本地数据库执行，需要使用 `--remote` 标志。

**解决方案**：
```bash
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --file=./migrations/0001_initial.sql
```

**重要提示**：
- 必须使用 `--remote` 标志来更新远程数据库
- 不加 `--remote` 只会在本地数据库执行，不会影响 Cloudflare 上的数据库

#### 更新远程数据库密码

如果数据库中的密码是 bcrypt 哈希，需要更新为明文：

```bash
cd backend
npx wrangler d1 execute fashion-store-db --remote \
  --command="UPDATE users SET password_hash = 'admin123', updated_at = CURRENT_TIMESTAMP WHERE username = 'admin';"
```

验证：
```bash
npx wrangler d1 execute fashion-store-db --remote \
  --command="SELECT username, password_hash FROM users WHERE username='admin';"
```

### 登录问题

#### 无法登录，显示 "Invalid credentials"

**快速解决方案**：

后端已支持两种登录方式：
1. **数据库认证**（如果已配置数据库）
2. **内存认证回退**（如果数据库未配置）

**默认登录凭证**：
- 用户名：`admin`
- 密码：`admin123`

**排查步骤**：

1. **检查后端是否正常运行**
   ```
   https://fashion-store-api.reluct007.workers.dev/api/health
   ```

2. **测试登录 API**
   ```bash
   curl -X POST https://fashion-store-api.reluct007.workers.dev/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. **检查数据库配置**
   - 如果使用数据库，确认数据库已初始化
   - 确认用户存在且密码正确
   - 如果密码是 bcrypt 哈希，需要更新为明文（见上方）

4. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console 和 Network 标签
   - 检查请求和响应

5. **查看后端日志**
   ```bash
   cd backend
   npx wrangler tail
   ```

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

### 本地数据库开发

```bash
cd backend
# 初始化本地数据库
npx wrangler d1 execute fashion-store-db --local --file=./migrations/0001_initial.sql

# 启动开发服务器（使用本地数据库）
npx wrangler dev
```

## 数据库备份和恢复

### 备份数据库

```bash
npx wrangler d1 export fashion-store-db --remote --output=backup.sql
```

### 恢复数据库

```bash
npx wrangler d1 execute fashion-store-db --remote --file=backup.sql
```

## 技术支持

如果遇到问题：
1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 查看 [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
4. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
5. 检查项目 README.md

---

**部署完成后，您的网站将可以通过 Cloudflare 提供的 URL 访问！**
**每次推送代码到 main 分支，GitHub Actions 会自动部署到 Cloudflare！**
