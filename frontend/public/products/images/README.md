# 产品图片目录

此目录用于存放产品的图片文件。

## 目录结构

```
products/
├── images/
│   ├── product-1.jpg          # 产品主图
│   ├── product-1-1.jpg        # 产品详情图1
│   ├── product-1-2.jpg        # 产品详情图2
│   └── ...
└── collection-hero.jpg        # 产品集合头部图片
```

## 命名规范

1. **产品主图**：使用产品ID或slug命名，如 `product-1.jpg` 或 `elegant-dress.jpg`
2. **产品详情图**：在主图名称后添加序号，如 `product-1-1.jpg`, `product-1-2.jpg`
3. **集合图片**：使用描述性名称，如 `collection-hero.jpg`

## 图片要求

- **格式**：推荐使用 JPG 或 PNG
- **尺寸**：
  - 产品主图：建议 800x800px 或更高
  - 产品详情图：建议 1200x1200px 或更高
  - 集合图片：建议 1920x600px（横幅）或 800x600px（卡片）
- **文件大小**：建议单个图片不超过 2MB
- **优化**：建议在上传前使用工具压缩图片

## 在 products.js 中引用

```javascript
{
  id: 1,
  name: "Product Name",
  image: "/products/images/product-1.jpg",  // 相对于 public 目录
  images: [
    "/products/images/product-1-1.jpg",
    "/products/images/product-1-2.jpg"
  ]
}
```

