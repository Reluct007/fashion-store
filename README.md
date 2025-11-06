# Fashion Store - 服饰类电商网站

一个基于 React 的现代化服饰类电商网站，采用 Monorepo 架构，前后端分离。

## 功能特性

- 🛍️ **产品展示**: 精美的产品展示页面，支持分类浏览
- 📄 **产品详情页**: 完整的产品详情页面，包含促销标签、倒计时、相关产品推荐
- 🎨 **模板系统**: 支持多种网站模板切换（fashion、modern、minimal）
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🔐 **后台管理**: 完整的可视化管理面板，支持产品管理和链接配置
- 🔗 **链接配置**: 可配置产品按钮或任意区域的跳转链接
- 📧 **邮件订阅**: 首页和页脚邮件订阅功能
- 🔗 **社交分享**: 支持分享到 Pinterest、Twitter/X、Facebook
- 💳 **支付方式展示**: 页脚显示支持的支付方式
- 🚀 **快速部署**: 支持 GitHub 和 Cloudflare 一键部署
- ⚡ **边缘计算**: 后端使用 Cloudflare Workers，全球低延迟
- 🗄️ **数据库支持**: 使用 Cloudflare D1 数据库存储用户和配置数据
- 👤 **用户认证**: 管理面板登录保护

## 项目结构

```
fashion-store/
├── frontend/              # 前端 React 应用
│   ├── src/              # 源代码
│   │   ├── components/   # React 组件
│   │   │   ├── common/   # 通用组件
│   │   │   └── ...      # 其他组件
│   │   ├── pages/        # 页面组件
│   │   ├── lib/          # API 工具库
│   │   ├── images/       # 图片资源
│   │   └── ...
│   ├── templates/        # 网站模板（fashion、modern、minimal）
│   ├── config/           # 模板配置
│   ├── public/           # 静态资源
│   └── package.json      # 前端依赖
├── backend/              # 后端 API 服务
│   ├── src/
│   │   ├── index.js     # Cloudflare Workers 入口
│   │   └── db.js        # 数据库工具函数
│   ├── migrations/       # 数据库迁移脚本
│   ├── scripts/          # 自动化脚本
│   ├── wrangler.toml     # Workers 配置
│   └── package.json      # 后端依赖
├── .github/
│   └── workflows/        # GitHub Actions
│       ├── deploy-frontend.yml  # 前端自动部署
│       └── deploy-backend.yml   # 后端自动部署
└── package.json          # 根目录配置（Monorepo）
```

## 技术栈

### 前端
- **框架**: React 19
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router
- **图标**: Lucide React

### 后端
- **运行时**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **语言**: JavaScript

### 部署
- **前端**: Cloudflare Pages（静态网站托管）
- **后端**: Cloudflare Workers（边缘计算）
- **数据库**: Cloudflare D1（边缘数据库）

## 快速开始

### 安装依赖

```bash
# 安装所有依赖（推荐）
npm run install:all

# 或分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev
# 或
cd frontend && npm run dev

# 启动后端开发服务器（新终端）
npm run dev:backend
# 或
cd backend && npm run dev
```

- 前端: http://localhost:5173
- 后端 API: http://localhost:8787

### 构建

```bash
# 构建前端
npm run build

# 构建会输出到 frontend/dist/
```

## 核心功能

### 1. 产品管理

- 产品列表展示
- 产品详情页（带促销标签、倒计时、相关产品）
- 产品分类筛选
- 管理面板产品 CRUD 操作

### 2. 用户认证

- 管理面板登录保护
- 默认管理员账户：
  - 用户名：`admin`
  - 密码：`admin123`
- 登录后自动跳转到管理面板

### 3. 链接配置管理

在管理面板的 "Link Configs" 标签中可以配置：

- **产品按钮跳转**: 配置 "Add to Cart" 等按钮的跳转链接
- **触发类型**: 
  - Add to Cart Button
  - Buy Now Button
  - Product Image（预留）
  - Product Title（预留）
  - Custom Element（预留）
- **操作类型**: 
  - External Link（跳转到外部 URL）
  - API Call（调用 API 端点）
  - Modal（显示模态框）

### 4. 邮件订阅

- 首页邮件订阅模块
- 页脚订阅框
- 表单验证和成功提示

### 5. 社交分享

产品详情页支持分享到：
- Pinterest
- Twitter/X
- Facebook

### 6. 支付方式展示

页脚显示支持的支付方式图标（使用图片文件）

## API 端点

后端 API 基础 URL: `https://fashion-store-api.your-subdomain.workers.dev`

### 产品 API
- `GET /api/products` - 获取所有产品（支持 `?category=` 查询参数）
- `GET /api/products/:id` - 获取单个产品（包含按钮配置）
- `POST /api/products` - 创建产品（需要认证）
- `PUT /api/products/:id` - 更新产品（需要认证）
- `DELETE /api/products/:id` - 删除产品（需要认证）

### 认证 API
- `POST /api/auth/login` - 用户登录

### 链接配置 API
- `GET /api/product-configs` - 获取所有产品配置（需要认证）
- `POST /api/product-configs` - 创建或更新产品配置（需要认证）
- `DELETE /api/product-configs/:id` - 删除产品配置（需要认证）

### 系统配置 API
- `GET /api/system-configs` - 获取系统配置（需要认证）
- `POST /api/system-configs` - 设置系统配置（需要认证）

### 订单 API
- `GET /api/orders` - 获取所有订单
- `POST /api/orders` - 创建订单

### 健康检查
- `GET /api/health` - 健康检查

## 数据库

项目使用 Cloudflare D1 数据库存储：

- **users**: 用户认证信息
- **product_configs**: 产品链接配置（按钮跳转等）
- **system_configs**: 系统全局配置变量

详细数据库设置请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 模板系统

项目支持多种模板切换，通过修改 `frontend/config/template-config.js` 中的 `TEMPLATE` 变量：

```javascript
export const TEMPLATE = 'fashion'; // 可选: 'fashion', 'modern', 'minimal'
```

### 可用模板

- **fashion** (默认): 服饰类模板，参考 Waterfilter 风格
- **modern**: 现代简约模板
- **minimal**: 极简模板

## 前后端分离架构

### Monorepo 架构

项目采用 Monorepo 架构，前后端代码在同一个仓库中：

- ✅ 代码统一管理
- ✅ 版本同步
- ✅ 共享配置和工具
- ✅ 独立部署流程

### 部署架构

- **前端**: 部署到 Cloudflare Pages（静态网站托管）
- **后端**: 部署到 Cloudflare Workers（边缘计算）
- **数据库**: Cloudflare D1（边缘数据库）
- **分开部署**: 前后端独立部署，互不影响

### GitHub Actions 自动部署

- 修改 `frontend/` 目录 → 自动部署前端
- 修改 `backend/` 目录 → 自动部署后端
- 同时修改 → 同时部署前后端

## 环境配置

### 前端环境变量

在 `frontend/.env.local` 或 Cloudflare Pages 环境变量中配置：

```
VITE_API_URL=https://fashion-store-api.your-subdomain.workers.dev
```

### 后端环境变量

在 `backend/wrangler.toml` 中配置：

```toml
[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "fashion-store-db"
database_id = "YOUR_DATABASE_ID"
```

## 部署

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

包含：
- 数据库设置和初始化
- 前后端部署步骤
- 故障排除指南
- 登录问题解决方案

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
