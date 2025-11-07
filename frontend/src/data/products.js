/**
 * 静态产品数据文件
 * 可以通过外部脚本或工具批量更新此文件
 * 
 * 格式说明：
 * - id: 产品唯一标识（数字或字符串）
 * - name: 产品名称
 * - slug: URL友好的标识符（如果不提供，会从name自动生成）
 * - title: SEO标题
 * - description: 产品描述
 * - metaDescription: SEO描述
 * - metaKeywords: SEO关键词（逗号分隔）
 * - canonicalUrl: Canonical URL（可选）
 * - price: 价格
 * - originalPrice: 原价（可选，用于显示折扣）
 * - category: 产品分类
 * - image: 主图片路径（相对于 /products/images/）
 * - images: 额外图片数组（可选）
 * - rating: 评分（0-5）
 * - reviews: 评论数量
 * - onSale: 是否在售
 * - stock: 库存数量
 * - sku: 产品SKU
 * - brand: 品牌
 * - status: 状态（active/inactive/draft）
 * - features: 产品特点数组（可选）
 */

export const staticProducts = {
  header: {
    title: "Products Collection",
    description: "Discover our latest product collection, where we share insights, tips, and updates on the latest trends in the industry.",
    image: "/products/images/collection-hero.jpg",
    features: [
      "Exceptional Quality: We ensure every product meets the highest standards of craftsmanship and durability",
      "Charm & Creativity: Our designs combine playfulness and artistic flair, making each product both delightful and display-worthy",
      "Versatile Appeal: From home décor to thoughtful gifts, our collection fits into every lifestyle and occasion",
      "Sustainable Practices: Our commitment to sustainability is reflected in eco-conscious materials and mindful production methods"
    ]
  },
  products: [
    // 示例产品 - 可以删除或修改
    // {
    //   id: 1,
    //   name: "Elegant Summer Dress",
    //   slug: "elegant-summer-dress",
    //   title: "Elegant Summer Dress - Premium Fashion",
    //   description: "Beautiful summer dress with elegant design. Perfect for any occasion.",
    //   metaDescription: "Shop the elegant summer dress. Premium quality, stylish design. Free shipping available.",
    //   metaKeywords: "summer dress, elegant dress, fashion, women's clothing",
    //   canonicalUrl: "https://example.com/product/elegant-summer-dress",
    //   price: 89.99,
    //   originalPrice: 129.99,
    //   category: "Dresses",
    //   image: "/products/images/dress-1.jpg",
    //   images: [
    //     "/products/images/dress-1-1.jpg",
    //     "/products/images/dress-1-2.jpg",
    //     "/products/images/dress-1-3.jpg"
    //   ],
    //   rating: 4.5,
    //   reviews: 128,
    //   onSale: true,
    //   stock: 50,
    //   sku: "DRS-001",
    //   brand: "Fashion Brand",
    //   status: "active",
    //   features: [
    //     "Premium Quality Material",
    //     "Comfortable Fit",
    //     "Machine Washable",
    //     "30-Day Return Policy"
    //   ]
    // }
  ]
};

/**
 * 获取所有静态产品
 */
export function getAllStaticProducts() {
  return staticProducts.products || [];
}

/**
 * 根据ID获取静态产品
 */
export function getStaticProductById(id) {
  return staticProducts.products.find(p => p.id === id || p.id === String(id));
}

/**
 * 根据slug获取静态产品
 */
export function getStaticProductBySlug(slug) {
  return staticProducts.products.find(p => p.slug === slug);
}

/**
 * 根据分类获取静态产品
 */
export function getStaticProductsByCategory(category) {
  return staticProducts.products.filter(p => p.category === category);
}

/**
 * 获取产品头部信息
 */
export function getProductsHeader() {
  return staticProducts.header || {};
}

/**
 * 转换静态产品格式为API格式（用于统一处理）
 */
export function formatStaticProductForAPI(product) {
  return {
    ...product,
    // 确保图片路径完整
    image: product.image?.startsWith('/') ? product.image : `/products/images/${product.image}`,
    images: product.images?.map(img => 
      img.startsWith('/') ? img : `/products/images/${img}`
    ) || [],
    // 确保字段一致
    onSale: product.onSale !== undefined ? product.onSale : false,
    status: product.status || 'active',
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    stock: product.stock !== undefined ? product.stock : 0
  };
}

