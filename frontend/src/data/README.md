# 静态产品数据管理

本项目支持两种产品管理方式：

1. **静态产品数据**（类似 PANDING 项目）- 通过文件管理
2. **数据库产品数据** - 通过管理面板管理

## 静态产品数据

### 文件位置

- 产品数据文件：`frontend/src/data/products.js`
- 示例文件：`frontend/src/data/products.example.js`
- 格式说明：`frontend/src/data/PRODUCT_DATA_FORMAT.md`

### 图片存放位置

- 产品图片目录：`frontend/public/products/images/`
- 图片路径说明：`frontend/public/products/images/README.md`

## 使用方法

### 1. 添加新产品

1. 打开 `frontend/src/data/products.js`
2. 在 `products` 数组中添加新产品对象
3. 将产品图片上传到 `frontend/public/products/images/` 目录
4. 确保图片路径正确

### 2. 批量导入产品

您可以使用脚本批量导入产品数据：

```javascript
// 示例：从 CSV 导入
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvData = fs.readFileSync('products.csv', 'utf-8');
const records = parse(csvData, { columns: true });

const products = records.map(record => ({
  id: parseInt(record.id),
  name: record.name,
  slug: record.slug || generateSlug(record.name),
  price: parseFloat(record.price),
  category: record.category,
  image: `/products/images/${record.image}`,
  // ... 其他字段
}));

// 写入 products.js
const content = `export const staticProducts = {
  header: { ... },
  products: ${JSON.stringify(products, null, 2)}
};`;
fs.writeFileSync('src/data/products.js', content);
```

### 3. 产品优先级

- **静态产品优先**：如果静态产品和数据库产品有相同的 ID 或 slug，静态产品会优先显示
- **合并显示**：静态产品和数据库产品会合并显示在产品列表中

## 文件结构

```
frontend/
├── src/
│   └── data/
│       ├── products.js          # 产品数据文件（实际使用）
│       ├── products.example.js  # 产品数据示例
│       ├── PRODUCT_DATA_FORMAT.md  # 数据格式说明
│       └── README.md            # 本文件
└── public/
    └── products/
        └── images/              # 产品图片目录
            ├── README.md        # 图片使用说明
            └── .gitkeep
```

## 数据格式

详细的数据格式说明请参考 `PRODUCT_DATA_FORMAT.md`。

### 必需字段

- `id`: 产品唯一标识
- `name`: 产品名称
- `price`: 价格

### 可选字段

- `slug`: URL友好标识（自动生成）
- `title`: SEO标题
- `description`: 产品描述
- `metaDescription`: SEO描述
- `metaKeywords`: SEO关键词
- `canonicalUrl`: Canonical URL
- `category`: 分类
- `image`: 主图片路径
- `images`: 额外图片数组
- `status`: 状态（active/inactive/draft）
- 等等...

## 注意事项

1. **ID唯一性**：确保每个产品的 ID 是唯一的
2. **Slug唯一性**：如果手动设置 slug，确保它是唯一的
3. **图片路径**：图片路径相对于 `public` 目录
4. **状态管理**：只有 `status: "active"` 的产品会显示
5. **数据格式**：确保 JSON 格式正确，否则会导致加载失败

## 与数据库产品的区别

| 特性 | 静态产品 | 数据库产品 |
|------|---------|-----------|
| 管理方式 | 文件编辑 | 管理面板 |
| 更新方式 | 修改文件 | 在线编辑 |
| 批量导入 | 脚本导入 | 批量上传 |
| 版本控制 | Git管理 | 数据库存储 |
| 性能 | 更快 | 需要API请求 |
| 适用场景 | 大量产品、批量更新 | 少量产品、频繁更新 |

## 最佳实践

1. **大量产品**：使用静态产品数据，通过脚本批量导入
2. **频繁更新**：使用数据库产品，通过管理面板管理
3. **混合使用**：核心产品使用静态数据，促销产品使用数据库
4. **SEO优化**：静态产品可以更好地控制 SEO 字段

