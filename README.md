# Fashion Store - 服饰类电商网站

一个基于 React 的现代化服饰类电商网站，采用 Monorepo 架构，前后端分离。

## 功能特性

- 🛍️ **产品展示**: 精美的产品展示页面，支持分类浏览
- 🎨 **模板系统**: 支持多种网站模板切换（fashion、modern、minimal）
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🔐 **后台管理**: 完整的可视化管理面板，支持产品管理
- 🚀 **快速部署**: 支持 GitHub 和 Cloudflare 一键部署
- ⚡ **边缘计算**: 后端使用 Cloudflare Workers，全球低延迟

## 项目结构

```
fashion-store/
├── frontend/              # 前端 React 应用
│   ├── src/              # 源代码
│   │   ├── components/   # React 组件
│   │   ├── pages/        # 页面组件
│   │   └── ...
│   ├── templates/        # 网站模板（fashion、modern、minimal）
│   ├── config/           # 模板配置
│   ├── lib/              # 工具库
│   ├── public/           # 静态资源
│   └── package.json      # 前端依赖
├── backend/              # 后端 API 服务
│   ├── src/
│   │   └── index.js     # Cloudflare Workers 入口
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
- **语言**: JavaScript

### 部署
- **前端**: Cloudflare Pages（静态网站托管）
- **后端**: Cloudflare Workers（边缘计算）

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

## 模板系统

项目支持多种模板切换，通过修改 `frontend/config/template-config.js` 中的 `TEMPLATE` 变量：

```javascript
export const TEMPLATE = 'fashion'; // 可选: 'fashion', 'modern', 'minimal'
```

### 可用模板

- **fashion** (默认): 服饰类模板，参考 Waterfilter 风格
- **modern**: 现代简约模板
- **minimal**: 极简模板

详细说明请查看 `frontend/config/template-config.js`

## API 端点

后端 API 基础 URL: `https://fashion-store-api.your-subdomain.workers.dev`

### 产品 API
- `GET /api/products` - 获取所有产品（支持 `?category=` 查询参数）
- `GET /api/products/:id` - 获取单个产品
- `POST /api/products` - 创建产品
- `PUT /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

### 订单 API
- `GET /api/orders` - 获取所有订单
- `POST /api/orders` - 创建订单

### 健康检查
- `GET /api/health` - 健康检查

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
- **分开部署**: 前后端独立部署，互不影响

### GitHub Actions 自动部署

- 修改 `frontend/` 目录 → 自动部署前端
- 修改 `backend/` 目录 → 自动部署后端
- 同时修改 → 同时部署前后端

## 环境配置

### 前端环境变量

在 `frontend/.env` 中配置：
```
VITE_API_URL=https://fashion-store-api.your-subdomain.workers.dev
```

### 后端环境变量

在 `backend/wrangler.toml` 中配置：
```toml
[vars]
ENVIRONMENT = "production"
```

## 开发计划

- [ ] 添加 Cloudflare D1 数据库
- [ ] 用户认证系统
- [ ] 支付集成
- [ ] 图片上传和 CDN（Cloudflare R2）
- [ ] 缓存优化
- [ ] 监控和日志

## 部署

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
