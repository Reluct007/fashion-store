# Cloudflare D1 数据库设置指南

## 概述

Fashion Store 项目使用 Cloudflare D1 数据库来存储：
- 用户认证信息
- 产品按钮配置（跳转链接）
- 系统配置变量

## 步骤 1: 创建 D1 数据库

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

## 步骤 2: 配置 wrangler.toml

1. **打开 `backend/wrangler.toml` 文件**

2. **更新数据库 ID**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "fashion-store-db"
   database_id = "YOUR_DATABASE_ID_HERE"  # 替换为实际的数据库 ID
   ```

## 步骤 3: 初始化数据库

有两种方式初始化数据库：

### 方式 A: 使用 Wrangler CLI（推荐）

```bash
cd backend

# 运行迁移脚本
npx wrangler d1 execute fashion-store-db --file=./migrations/0001_initial.sql
```

### 方式 B: 通过 Cloudflare Dashboard

1. 在 Cloudflare Dashboard 中进入 D1 数据库页面
2. 点击 "fashion-store-db" 数据库
3. 选择 "Console" 标签
4. 复制 `migrations/0001_initial.sql` 文件的内容
5. 粘贴到控制台并执行

## 步骤 4: 验证数据库

部署后端后，可以通过以下方式验证：

1. **测试健康检查**
   ```
   https://fashion-store-api.reluct007.workers.dev/api/health
   ```

2. **测试登录（默认凭证）**
   - 用户名：`admin`
   - 密码：`admin123`

3. **在 Cloudflare Dashboard 查看**
   - 进入 D1 数据库页面
   - 选择 "fashion-store-db"
   - 查看表和数据

## 步骤 5: 部署后端

部署后端后，数据库会自动初始化（如果还未初始化）：

```bash
cd backend
npm run deploy
```

## 数据库表结构

### users 表
- `id`: 主键
- `username`: 用户名（唯一）
- `email`: 邮箱（唯一）
- `password_hash`: 密码哈希
- `role`: 角色（默认 'admin'）
- `created_at`: 创建时间
- `updated_at`: 更新时间

### product_configs 表
- `id`: 主键
- `product_id`: 产品 ID
- `button_type`: 按钮类型（'add_to_cart', 'buy_now'）
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

创建数据库后，会自动创建一个默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

**重要**: 首次登录后，请立即修改密码！

## 使用产品配置功能

1. **登录管理面板**
   - 访问 `/admin` 页面
   - 使用默认凭证登录

2. **配置按钮跳转**
   - 点击 "Button Configs" 标签
   - 选择产品
   - 设置按钮类型（Add to Cart）
   - 设置操作类型（External Link）
   - 输入目标 URL（例如：https://google.com）
   - 保存配置

3. **测试跳转**
   - 访问产品详情页
   - 点击 "Add to Cart" 按钮
   - 应该会跳转到配置的 URL

## 故障排除

### 数据库未配置

如果看到 "Database not configured" 错误：
1. 确认已在 Cloudflare Dashboard 创建数据库
2. 确认 `wrangler.toml` 中的 `database_id` 已正确配置
3. 重新部署后端

### 数据库初始化失败

如果数据库初始化失败：
1. 检查迁移 SQL 文件是否正确
2. 在 Cloudflare Dashboard 的 D1 Console 中手动执行 SQL
3. 查看 Worker 日志排查错误

### 认证失败

如果登录失败：
1. 确认数据库已初始化
2. 检查默认管理员账户是否存在
3. 确认密码是否正确（默认：admin123）

## 本地开发

本地开发时，可以使用 Wrangler 的本地数据库：

```bash
cd backend
npx wrangler d1 execute fashion-store-db --local --file=./migrations/0001_initial.sql
npx wrangler dev
```

## 备份和恢复

### 备份数据库

```bash
npx wrangler d1 export fashion-store-db --output=backup.sql
```

### 恢复数据库

```bash
npx wrangler d1 execute fashion-store-db --file=backup.sql
```

---

**注意**: D1 数据库是 Cloudflare 的 SQLite 数据库服务，提供免费层。如需更多存储空间或性能，请参考 Cloudflare D1 定价。

