# 快速数据库设置指南

## 方法 1: 使用自动化脚本（推荐）

### 步骤 1: 运行设置脚本

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

### 步骤 2: 部署后端

```bash
cd backend
npm run deploy
```

## 方法 2: 手动设置（如果脚本失败）

### 步骤 1: 登录 Cloudflare

```bash
cd backend
npx wrangler login
```

按照提示在浏览器中完成登录。

### 步骤 2: 创建数据库

```bash
npx wrangler d1 create fashion-store-db
```

复制输出的 `database_id`。

### 步骤 3: 更新 wrangler.toml

打开 `backend/wrangler.toml`，找到：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fashion-store-db"
database_id = "" # 在这里填入数据库 ID
```

将 `database_id = ""` 替换为实际的数据库 ID。

### 步骤 4: 初始化数据库

```bash
cd backend
npx wrangler d1 execute fashion-store-db --file=./migrations/0001_initial.sql
```

### 步骤 5: 部署后端

```bash
npm run deploy
```

## 方法 3: 通过 Cloudflare Dashboard

### 步骤 1: 登录 Cloudflare Dashboard

访问 https://dash.cloudflare.com/ 并登录。

### 步骤 2: 创建 D1 数据库

1. 在左侧菜单选择 "Workers & Pages"
2. 点击 "D1" 标签
3. 点击 "Create database"
4. 输入数据库名称：`fashion-store-db`
5. 选择区域（建议选择离您最近的区域）
6. 点击 "Create"

### 步骤 3: 获取数据库 ID

1. 在数据库列表中，点击刚创建的 `fashion-store-db`
2. 在详情页面找到 "Database ID"
3. 复制这个 ID

### 步骤 4: 更新 wrangler.toml

打开 `backend/wrangler.toml`，更新：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fashion-store-db"
database_id = "你的数据库ID"  # 粘贴刚才复制的 ID
```

### 步骤 5: 初始化数据库

在 Cloudflare Dashboard 中：

1. 进入 D1 数据库页面
2. 点击 `fashion-store-db` 数据库
3. 选择 "Console" 标签
4. 打开 `backend/migrations/0001_initial.sql` 文件
5. 复制全部内容
6. 粘贴到 D1 Console 中
7. 点击 "Execute" 执行

### 步骤 6: 部署后端

```bash
cd backend
npm run deploy
```

## 验证设置

### 1. 检查数据库

```bash
cd backend
npx wrangler d1 execute fashion-store-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

应该看到：`users`, `product_configs`, `system_configs`

### 2. 测试 API

访问健康检查端点：
```
https://fashion-store-api.reluct007.workers.dev/api/health
```

### 3. 测试登录

1. 访问前端网站
2. 进入 `/admin` 页面
3. 应该自动跳转到 `/login`
4. 使用默认凭证登录：
   - 用户名：`admin`
   - 密码：`admin123`

## 故障排除

### 问题 1: Wrangler 未安装

```bash
npm install -g wrangler
```

### 问题 2: 登录失败

```bash
npx wrangler login
```

### 问题 3: 数据库创建失败

确保：
- 已登录 Cloudflare
- 账户有创建 D1 数据库的权限
- 网络连接正常

### 问题 4: 迁移脚本执行失败

检查：
- SQL 文件路径是否正确
- 数据库 ID 是否正确
- 是否有语法错误

### 问题 5: 部署后无法访问数据库

检查：
- `wrangler.toml` 中的 `database_id` 是否正确
- 数据库是否已创建
- Worker 是否已部署

## 获取帮助

如果遇到问题：
1. 查看 Cloudflare Dashboard 中的错误日志
2. 检查 Worker 日志：`npx wrangler tail`
3. 查看 D1 数据库状态
4. 参考 `DATABASE_SETUP.md` 获取详细说明

---

**推荐使用自动化脚本（方法 1），它是最快的设置方式！**

