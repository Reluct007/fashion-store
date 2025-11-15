# Fashion Store Backend API

Cloudflare Workers 后端服务，提供产品管理、订单处理、邮件订阅、留言等功能。

## 功能特性

- ✅ 产品管理（CRUD）
- ✅ 订单管理
- ✅ 邮件订阅管理
- ✅ 联系表单留言
- ✅ 点击统计
- ✅ 邮件通知（订阅和留言通知）
- ✅ 系统配置管理
- ✅ 管理员认证

## 技术栈

- **运行时**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **邮件服务**: Resend API

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在 `wrangler.toml` 中配置必要的环境变量，或通过 Cloudflare Dashboard 配置。

### 3. 初始化数据库

```bash
npm run setup-db
```

### 4. 本地开发

```bash
npm run dev
```

### 5. 部署

```bash
npm run deploy
```

## 项目结构

```
backend/
├── src/
│   ├── index.js      # 主入口文件，API 路由处理
│   ├── db.js         # 数据库操作函数
│   └── email.js      # 邮件发送功能
├── migrations/       # 数据库迁移文件
├── scripts/          # 工具脚本
└── wrangler.toml     # Cloudflare Workers 配置

```

## API 端点

### 产品 API
- `GET /api/products` - 获取所有产品
- `GET /api/products/:id` - 获取单个产品
- `POST /api/products` - 创建产品（需要认证）
- `PUT /api/products/:id` - 更新产品（需要认证）
- `DELETE /api/products/:id` - 删除产品（需要认证）

### 邮件订阅 API
- `POST /api/subscribe` - 订阅邮箱
- `POST /api/email-subscriptions/unsubscribe` - 取消订阅
- `GET /api/email-subscriptions` - 获取所有订阅（需要认证）

### 留言 API
- `POST /api/contact` - 提交留言
- `GET /api/contact` - 获取所有留言（需要认证）

### 系统配置 API
- `GET /api/system-configs` - 获取系统配置（需要认证）
- `POST /api/system-configs` - 设置系统配置（需要认证）

### 统计 API
- `GET /api/click-stats` - 获取点击统计（需要认证）
- `GET /api/click-stats/detail` - 获取详细统计（需要认证）

## 详细文档

- [部署和配置指南](./DEPLOYMENT.md) - 包含详细的部署步骤和邮件服务配置

## 许可证

MIT

