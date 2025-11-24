# Fashion Store - 服饰类电商网站

一个基于 React 的现代化服饰类电商网站，采用 Monorepo 架构，前后端分离。支持多颜色产品展示、动态图片切换、后台管理等功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020.svg)

## 功能特性

- 🛍️ **产品展示**: 精美的产品展示页面，支持分类浏览
- 🎨 **多颜色支持**: 每个产品支持多个颜色变体，每个颜色有独立的产品图片
- 🖼️ **动态图片切换**: 点击颜色色块，主图和缩略图自动切换到对应颜色的产品图片
- 📄 **产品详情页**: 完整的产品详情页面，包含促销标签、倒计时、相关产品推荐
- 🎯 **智能图片管理**: 自动保持原始图片格式（PNG/JPG/WebP），无损下载和展示
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

## 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [产品数据结构](#产品数据结构)
- [核心功能](#核心功能)
- [API 端点](#api-端点)
- [数据库](#数据库)
- [模板系统](#模板系统)
- [部署指南](#部署指南)
- [故障排除](#故障排除)

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

## 产品数据结构

### 产品对象格式

产品数据存储在 `frontend/data/product.js` 中，每个产品对象包含以下字段：

```javascript
{
  title: "产品名称",
  category: "分类",
  size: "XXS|XS|S|M|L|XL",  // 尺码，用 | 分隔
  color: "[{...}]",  // 颜色数组的 JSON 字符串
  originalprice: "原价",
  sellingprice: 128,  // 售价
  description: "产品描述",
  image: "/product/main-image.jpg",  // 主图
  images: ["/product/image1.jpg", ...],  // 产品图片数组
  image_names: ["image1.jpg", ...],  // 图片文件名数组
  features: [{title: "特性标题", description: "特性描述"}, ...]
}
```

### 颜色对象格式

每个产品的 `color` 字段是一个 JSON 字符串，包含颜色数组：

```javascript
[
  {
    "name": "PINK",  // 颜色名称
    "image": "/product/PINK_SWATCH.png",  // 色块图片（小图标）
    "url": "product-url-pink",  // 该颜色的产品 URL
    "productImages": [  // 该颜色的产品图片数组
      "/product/pink-image1.jpg",
      "/product/pink-image2.jpg",
      ...
    ]
  },
  {
    "name": "BLUE",
    "image": "/product/BLUE_SWATCH.png",
    "url": "product-url-blue",
    "productImages": [
      "/product/blue-image1.jpg",
      "/product/blue-image2.jpg",
      ...
    ]
  }
]
```

### 图片格式说明

- **支持格式**: PNG, JPG, JPEG, WebP, GIF
- **自动保持原格式**: 系统会自动保持图片的原始格式，不会强制转换
- **色块图片**: 通常为 PNG 格式，支持透明背景
- **产品图片**: 根据原始图片格式保存（JPG 或 PNG）

### 图片目录结构

```
frontend/public/product/
├── main-product-image.jpg       # 主产品图片
├── PINK_SWATCH.png              # 粉色色块图片
├── BLUE_SWATCH.png              # 蓝色色块图片
├── pink-detail-1.jpg            # 粉色产品详情图 1
├── pink-detail-2.jpg            # 粉色产品详情图 2
├── blue-detail-1.jpg            # 蓝色产品详情图 1
└── ...
```

### 动态图片切换逻辑

当用户点击颜色色块时：
1. 系统读取该颜色的 `productImages` 数组
2. 将主图切换为该颜色的第一张产品图片
3. 左侧缩略图列表更新为该颜色的所有产品图片
4. 色块图片**不会**出现在主图或缩略图中

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

## 部署指南

### 方式一：GitHub + Cloudflare 自动部署（推荐）

#### 1. 准备工作

**前置要求：**
- GitHub 账号
- Cloudflare 账号
- Node.js 18+ 和 npm

#### 2. 克隆或 Fork 项目

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/fashion-store.git
cd fashion-store

# 或者在 GitHub 上 Fork 后克隆
```

#### 3. 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

#### 4. 配置 Cloudflare

##### 4.1 创建 D1 数据库

```bash
# 进入后端目录
cd backend

# 创建 D1 数据库
npx wrangler d1 create fashion-store-db

# 记录输出的 database_id，例如：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

##### 4.2 更新 wrangler.toml

编辑 `backend/wrangler.toml`，替换 `database_id`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "fashion-store-db"
database_id = "YOUR_DATABASE_ID_HERE"  # 替换为上一步的 database_id
```

##### 4.3 初始化数据库

```bash
# 在 backend 目录下执行
npx wrangler d1 execute fashion-store-db --remote --file=./migrations/0001_initial.sql
```

#### 5. 部署后端到 Cloudflare Workers

```bash
# 在 backend 目录下
npm run deploy

# 记录输出的 Worker URL，例如：
# https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev
```

#### 6. 配置前端环境变量

在 Cloudflare Pages 项目设置中添加环境变量：

```
VITE_API_URL=https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev
```

或在本地创建 `frontend/.env.local`：

```
VITE_API_URL=https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev
```

#### 7. 部署前端到 Cloudflare Pages

**方式 A：通过 Cloudflare Dashboard（推荐）**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库 `fashion-store`
4. 配置构建设置：
   - **Framework preset**: `Vite`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`（保持为根目录）
5. 添加环境变量：
   - `VITE_API_URL`: `https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`
6. 点击 **Save and Deploy**

**方式 B：通过命令行**

```bash
# 在 frontend 目录下
npm run build

# 使用 Wrangler 部署
npx wrangler pages deploy dist --project-name=fashion-store
```

#### 8. 设置 GitHub Actions 自动部署（可选）

项目已包含 GitHub Actions 配置文件：
- `.github/workflows/deploy-frontend.yml` - 前端自动部署
- `.github/workflows/deploy-backend.yml` - 后端自动部署

**配置步骤：**

1. 获取 Cloudflare API Token：
   - 登录 Cloudflare Dashboard
   - 进入 **My Profile** → **API Tokens**
   - 创建 Token，选择 **Edit Cloudflare Workers** 模板
   - 记录 Token

2. 在 GitHub 仓库设置 Secrets：
   - 进入仓库 **Settings** → **Secrets and variables** → **Actions**
   - 添加以下 Secrets：
     - `CLOUDFLARE_API_TOKEN`: 你的 Cloudflare API Token
     - `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare Account ID

3. 推送代码到 GitHub：
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

4. GitHub Actions 会自动触发部署

#### 9. 访问网站

- **前端**: `https://fashion-store.pages.dev` 或你的自定义域名
- **后端 API**: `https://fashion-store-api.YOUR_SUBDOMAIN.workers.dev`
- **管理面板**: `https://fashion-store.pages.dev/admin`
  - 默认用户名: `admin`
  - 默认密码: `admin123`

### 方式二：本地开发部署

#### 1. 本地开发

```bash
# 启动前端开发服务器
cd frontend
npm run dev
# 访问 http://localhost:5173

# 启动后端开发服务器（新终端）
cd backend
npm run dev
# API 运行在 http://localhost:8787
```

#### 2. 本地构建测试

```bash
# 构建前端
cd frontend
npm run build

# 预览构建结果
npm run preview
```

### 方式三：推送到 GitHub

#### 初次推送

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/fashion-store.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 推送到 GitHub
git push -u origin main
```

#### 日常更新

```bash
# 查看修改
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push

# 如果配置了 GitHub Actions，推送后会自动部署
```

### 故障排除

#### 问题 1：数据库连接失败

**解决方案：**
- 确认 `wrangler.toml` 中的 `database_id` 正确
- 确认数据库已初始化：`npx wrangler d1 execute fashion-store-db --remote --file=./migrations/0001_initial.sql`

#### 问题 2：前端无法连接后端 API

**解决方案：**
- 检查 `VITE_API_URL` 环境变量是否正确设置
- 确认后端 Worker 已成功部署
- 检查浏览器控制台的 CORS 错误

#### 问题 3：管理面板登录失败

**解决方案：**
- 确认数据库已正确初始化
- 检查 `users` 表是否有默认管理员账户
- 尝试重新运行数据库迁移脚本

#### 问题 4：图片无法显示

**解决方案：**
- 确认图片文件在 `frontend/public/product/` 目录下
- 检查 `product.js` 中的图片路径是否正确（应以 `/product/` 开头）
- 确认图片格式（PNG/JPG/WebP）与文件扩展名一致

#### 问题 5：GitHub Actions 部署失败

**解决方案：**
- 检查 GitHub Secrets 是否正确设置
- 查看 Actions 日志找到具体错误
- 确认 `CLOUDFLARE_API_TOKEN` 有足够的权限

### 详细部署文档

更多详细信息请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)，包含：
- 数据库详细设置
- 环境变量完整配置
- 高级部署选项
- 性能优化建议

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
