# 倒计时功能使用指南

## 当前状态

✅ **后端已部署**：`https://fashion-store-api.reluct007.workers.dev`
✅ **代码已推送到 GitHub**
⚠️ **网络连接问题**：本地网络无法访问 Cloudflare Workers

## 解决方案

### 方案 1：使用 VPN 或代理访问

如果你的网络限制了对 Cloudflare 的访问，可以：
1. 使用 VPN 连接
2. 配置网络代理
3. 然后访问你的在线网站进行测试

### 方案 2：本地开发测试（推荐）

由于网络问题，建议使用本地开发环境测试功能：

```bash
# 1. 启动后端（在一个终端窗口）
cd backend
npx wrangler dev --port 8787

# 2. 启动前端（在另一个终端窗口）
cd frontend
npm run dev
```

然后访问 `http://localhost:5173` 进行测试。

### 方案 3：直接访问在线网站

如果你的前端已部署到 Cloudflare Pages，可以直接访问：
- 网站地址：`https://fashion-store.pages.dev`（或你的自定义域名）
- 管理后台：`https://你的域名/admin`

## 功能使用说明

### 1. 配置倒计时（管理后台）

1. 访问管理后台：`/admin`
2. 登录（用户名：admin，密码：admin123）
3. 点击 "Countdown Timers" 标签页
4. 点击 "+ Add New Timer" 按钮
5. 填写配置：
   - **Select Product**：选择特定产品（如 "Monkey Quilted Slippers"）
   - **Or Select Category**：或选择分类（如 "Monkey"）
   - **Title**：自定义标题（可选），例如：
     - "🔥 限时优惠！促销结束倒计时："
     - "Lowest Price! Black Friday ends in:"
   - **End Date & Time**：选择倒计时结束时间
   - **Enabled**：勾选启用
6. 点击 "Save" 保存

### 2. 查看倒计时（产品页面）

访问配置了倒计时的产品详情页，你会看到：
- 位置：在 "Quantity" 选择器上方
- 样式：
  - 🔥 火焰图标
  - 红色渐变背景框
  - 自定义标题（或默认文字）
  - 大号红色数字显示：天 | 小时 | 分钟 | 秒
  - 白色背景的时间单位框

### 3. 倒计时优先级

- **产品特定倒计时** > **分类倒计时**
- 如果一个产品同时有产品倒计时和分类倒计时，显示产品倒计时

### 4. 自动过期

- 时间到期后自动显示 "Sale Ended"
- 过期的倒计时会自动隐藏

## API 端点

所有倒计时相关的 API 端点：

```
GET  /api/countdown-timers              # 获取所有倒计时（管理员）
GET  /api/countdown-timers?public=true  # 获取有效倒计时（公开）
GET  /api/countdown-timers/query?product_id=X  # 获取产品倒计时
GET  /api/countdown-timers/query?category=X    # 获取分类倒计时
POST /api/countdown-timers              # 创建/更新倒计时（管理员）
DELETE /api/countdown-timers/:id        # 删除倒计时（管理员）
```

## 故障排除

### 错误：Failed to fetch

**原因**：无法连接到后端 API

**解决方法**：
1. 检查网络连接
2. 确认 `.env.local` 文件中的 `VITE_API_URL` 配置正确
3. 尝试使用 VPN 或代理
4. 使用本地开发环境（`npx wrangler dev`）

### 倒计时不显示

**可能原因**：
1. 倒计时未启用（检查 "Enabled" 选项）
2. 倒计时已过期
3. 产品 ID 或分类名称不匹配

**解决方法**：
1. 在管理后台检查倒计时配置
2. 确认结束时间在未来
3. 确认产品 ID 或分类名称正确

## 技术细节

### 数据库表结构

```sql
CREATE TABLE countdown_timers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,           -- 产品 ID（可选）
  category TEXT,                -- 分类名称（可选）
  title TEXT,                   -- 自定义标题（可选）
  end_date DATETIME NOT NULL,   -- 结束时间
  is_enabled BOOLEAN DEFAULT 1, -- 是否启用
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 前端组件

- **CountdownTimerManager**：管理后台的倒计时管理组件
- **CountdownTimer**：产品页面的倒计时显示组件
- **ProductDetail**：集成倒计时显示的产品详情页

## 下一步

1. 解决网络连接问题（使用 VPN 或本地开发）
2. 测试倒计时功能
3. 根据需要调整样式和文案
