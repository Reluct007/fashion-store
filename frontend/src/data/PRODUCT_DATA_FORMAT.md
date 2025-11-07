# 产品数据格式说明

本文档说明如何在 `products.js` 文件中添加或更新产品信息。

## 文件位置

`frontend/src/data/products.js`

## 数据结构

### 完整产品对象示例

```javascript
{
  id: 1,                              // 必需：产品唯一标识（数字或字符串）
  name: "Elegant Summer Dress",       // 必需：产品名称
  slug: "elegant-summer-dress",       // 可选：URL友好标识（不提供则从name生成）
  title: "Elegant Summer Dress - Premium Fashion",  // 可选：SEO标题
  description: "Beautiful summer dress...",         // 可选：产品描述
  metaDescription: "Shop the elegant...",           // 可选：SEO描述
  metaKeywords: "summer dress, fashion",            // 可选：SEO关键词（逗号分隔）
  canonicalUrl: "https://example.com/product/...",  // 可选：Canonical URL
  price: 89.99,                       // 必需：价格
  originalPrice: 129.99,              // 可选：原价（用于显示折扣）
  category: "Dresses",                // 可选：产品分类
  image: "/products/images/dress-1.jpg",            // 可选：主图片路径
  images: [                           // 可选：额外图片数组
    "/products/images/dress-1-1.jpg",
    "/products/images/dress-1-2.jpg"
  ],
  rating: 4.5,                        // 可选：评分（0-5）
  reviews: 128,                       // 可选：评论数量
  onSale: true,                       // 可选：是否在售（默认false）
  stock: 50,                          // 可选：库存数量（默认0）
  sku: "DRS-001",                     // 可选：产品SKU
  brand: "Fashion Brand",             // 可选：品牌
  status: "active",                   // 可选：状态（active/inactive/draft，默认active）
  features: [                         // 可选：产品特点数组
    "Premium Quality Material",
    "Comfortable Fit",
    "Machine Washable"
  ]
}
```

## 字段说明

### 必需字段

- **id**: 产品唯一标识符，可以是数字或字符串
- **name**: 产品名称
- **price**: 产品价格（数字）

### 可选字段

- **slug**: URL友好的标识符。如果不提供，系统会从 `name` 自动生成
- **title**: SEO标题，用于搜索引擎优化。如果不提供，使用 `name`
- **description**: 产品详细描述
- **metaDescription**: SEO元描述，用于搜索引擎结果展示
- **metaKeywords**: SEO关键词，逗号分隔
- **canonicalUrl**: Canonical URL，用于SEO
- **originalPrice**: 原价，用于显示折扣信息
- **category**: 产品分类（如：Dresses, Tops, Bottoms等）
- **image**: 主图片路径，相对于 `public` 目录
- **images**: 额外图片数组
- **rating**: 产品评分（0-5之间的数字）
- **reviews**: 评论数量
- **onSale**: 是否在售（布尔值）
- **stock**: 库存数量
- **sku**: 产品SKU代码
- **brand**: 品牌名称
- **status**: 产品状态
  - `active`: 激活状态，会显示在网站上
  - `inactive`: 非激活状态，不会显示
  - `draft`: 草稿状态，不会显示
- **features**: 产品特点数组

## 图片路径

图片应存放在 `frontend/public/products/images/` 目录下。

### 路径格式

- 绝对路径（推荐）：`/products/images/product-1.jpg`
- 或者相对于 public 目录：`products/images/product-1.jpg`

### 示例

```javascript
{
  image: "/products/images/dress-1.jpg",
  images: [
    "/products/images/dress-1-1.jpg",
    "/products/images/dress-1-2.jpg",
    "/products/images/dress-1-3.jpg"
  ]
}
```

## 添加新产品

1. 在 `products.js` 文件的 `products` 数组中添加新对象
2. 将产品图片上传到 `public/products/images/` 目录
3. 确保图片路径正确
4. 保存文件

### 示例

```javascript
export const staticProducts = {
  header: { ... },
  products: [
    // 现有产品...
    {
      id: 2,
      name: "Classic White Shirt",
      slug: "classic-white-shirt",
      price: 49.99,
      category: "Tops",
      image: "/products/images/shirt-1.jpg",
      status: "active"
    }
  ]
};
```

## 批量导入

您可以使用脚本批量导入产品数据。示例脚本格式：

```javascript
// import-script.js
const products = [
  // 从CSV、JSON或其他数据源导入的产品数组
];

// 写入 products.js 文件
// （需要文件系统操作）
```

## 注意事项

1. **ID唯一性**：确保每个产品的 `id` 是唯一的
2. **Slug唯一性**：如果手动设置 `slug`，确保它是唯一的
3. **图片路径**：确保图片文件存在于指定路径
4. **价格格式**：价格应为数字类型，不要使用字符串
5. **状态管理**：只有 `status: "active"` 的产品会显示在网站上

## 与数据库产品的关系

- 静态产品数据优先显示
- 如果静态产品和数据库产品有相同的ID或slug，静态产品会优先
- 可以通过管理面板管理数据库产品，通过文件管理静态产品

