#!/usr/bin/env node

/**
 * 自动生成 Category 路由脚本
 * 从 product.js 中提取所有唯一的 category，并自动更新 App.jsx 中的路由
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入 product 数据
const { product: products } = await import('../data/product.js');

// 提取所有唯一的 category
const categories = [...new Set(products.map(p => p.category))]
  .filter(Boolean)
  .sort();

console.log('📊 发现的 Categories:');
categories.forEach(cat => console.log(`   - ${cat}`));

// 生成 URL 友好的 slug
function generateSlug(category) {
  return category
    .toLowerCase()
    .replace(/['']/g, '') // 移除撇号
    .replace(/[^a-z0-9]+/g, '-') // 替换非字母数字为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
}

// 生成路由配置
const routeConfigs = categories.map(category => ({
  category,
  slug: generateSlug(category),
  path: `/collection/${generateSlug(category)}`
}));

console.log('\n🔗 生成的路由:');
routeConfigs.forEach(config => {
  console.log(`   ${config.category} → ${config.path}`);
});

// 读取 App.jsx
const appPath = path.join(__dirname, '../src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf-8');

// 生成路由代码
const routeLines = routeConfigs.map(config => 
  `        <Route path="${config.path}" element={<CategoryPage />} /> {/* ${config.category} */}`
).join('\n');

// 查找插入位置（在 {/* Category and Collection Routes */} 之后）
const insertMarker = '{/* Category and Collection Routes */}';
const insertIndex = appContent.indexOf(insertMarker);

if (insertIndex === -1) {
  console.error('❌ 无法在 App.jsx 中找到插入标记');
  process.exit(1);
}

// 查找下一个注释或 Route 的结束位置
const afterMarker = appContent.substring(insertIndex + insertMarker.length);
const nextCommentMatch = afterMarker.match(/\n\s*{\/\*/);
const endIndex = nextCommentMatch 
  ? insertIndex + insertMarker.length + nextCommentMatch.index
  : appContent.indexOf('        {/* Static Pages */}');

if (endIndex === -1) {
  console.error('❌ 无法确定路由插入的结束位置');
  process.exit(1);
}

// 提取现有的路由部分
const beforeRoutes = appContent.substring(0, insertIndex + insertMarker.length);
const afterRoutes = appContent.substring(endIndex);

// 构建新的 App.jsx 内容
const newAppContent = `${beforeRoutes}
${routeLines}
${afterRoutes}`;

// 写入 App.jsx
fs.writeFileSync(appPath, newAppContent, 'utf-8');

console.log('\n✅ 成功更新 App.jsx');
console.log(`📝 添加了 ${routeConfigs.length} 个 category 路由`);

// 生成导航链接建议
console.log('\n💡 建议在 Navbar 中添加以下链接:');
routeConfigs.forEach(config => {
  console.log(`   <Link to="${config.path}">${config.category}</Link>`);
});
