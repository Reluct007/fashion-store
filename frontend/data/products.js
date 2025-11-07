/**
 * 静态产品数据文件
 * 可以通过外部脚本或工具批量更新此文件
 * 
 * 支持两种格式：
 * 
 * 格式1（标准格式）：
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
 * - image: 主图片路径（使用 /product/ 路径）
 * - images: 额外图片数组（可选）
 * - rating: 评分（0-5）
 * - reviews: 评论数量
 * - onSale: 是否在售
 * - stock: 库存数量
 * - sku: 产品SKU
 * - brand: 品牌
 * - status: 状态（active/inactive/draft）
 * - features: 产品特点数组（字符串数组或对象数组）
 * 
 * 格式2（PANDING格式，兼容）：
 * - title: 产品标题（作为name使用）
 * - category: 产品分类
 * - description: 产品描述
 * - image: 主图片路径
 * - images: 图片数组
 * - image_names: 图片名称数组（可选）
 * - features: 特点数组，每个特点包含 {title, description}
 */

export const staticProducts = {
  header: {
    title: "Products Collection",
    description: "Discover our latest product collection, where we share insights, tips, and updates on the latest trends in the industry.",
      image: "/product/collection-hero.jpg",
    features: [
      "Exceptional Quality: We ensure every product meets the highest standards of craftsmanship and durability",
      "Charm & Creativity: Our designs combine playfulness and artistic flair, making each product both delightful and display-worthy",
      "Versatile Appeal: From home décor to thoughtful gifts, our collection fits into every lifestyle and occasion",
      "Sustainable Practices: Our commitment to sustainability is reflected in eco-conscious materials and mindful production methods"
    ]
  },
  products: [
    // 示例产品 - 可以删除或修改
    
    // 格式1示例（标准格式）
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
    //   image: "/product/dress-1.jpg",
    //   images: [
    //     "/product/dress-1-1.jpg",
    //     "/product/dress-1-2.jpg",
    //     "/product/dress-1-3.jpg"
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
    
    // 格式2示例（PANDING格式）
    // {
    //   title: "Protective Case 6.7'' Labubu Doll, Clear Hanging Display Case",
    //   category: "Labubu",
    //   description: "Elevate your retail offerings with our high-quality, customizable playing cards manufactured specifically for B2B clients, designed for durability and vibrant printing.",
    //   image: "/product/61Q9iVNA6fL.jpg",
    //   images: [
    //     "/product/imageBlock-360-thumbnail-icon-small._CB612115888_FMpng_RI_.png",
    //     "/product/41A4EQeubeL.jpg",
    //     "/product/31JMV+nYHWL.jpg"
    //   ],
    //   image_names: [
    //     "61Q9iVNA6fL.jpg",
    //     "imageBlock-360-thumbnail-icon-small._CB612115888_FMpng_RI_.png",
    //     "41A4EQeubeL.jpg"
    //   ],
    //   features: [
    //     {
    //       title: "Premium PVC Material",
    //       description: "Our playing cards are crafted from high-quality PVC material that enhances durability and flexibility, ensuring a longer lifespan compared to standard paper cards."
    //     },
    //     {
    //       title: "Customizable Designs",
    //       description: "We offer full-color digital printing on our playing cards, allowing you to create unique and engaging designs tailored to your brand's identity."
    //     }
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
 * 支持通过id、slug或title查找（兼容PANDING格式）
 */
export function getStaticProductById(id) {
  return staticProducts.products.find(p => {
    // 标准格式：通过id查找
    if (p.id === id || p.id === String(id)) return true;
    // 如果没有id，尝试通过slug或title匹配
    if (!p.id) {
      if (p.slug === id || p.slug === String(id)) return true;
      if (p.title === id || p.title === String(id)) return true;
      if (p.title && generateSlug(p.title) === id) return true;
    }
    return false;
  });
}

/**
 * 根据slug获取静态产品
 * 支持通过slug或title查找（兼容PANDING格式）
 */
export function getStaticProductBySlug(slug) {
  return staticProducts.products.find(p => {
    // 标准格式：通过slug查找
    if (p.slug === slug) return true;
    // PANDING格式：通过title生成的slug查找
    if (p.title && !p.slug && generateSlug(p.title) === slug) return true;
    // 如果slug不存在，尝试通过title匹配
    if (!p.slug && p.title && generateSlug(p.title) === slug) return true;
    return false;
  });
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
 * 生成slug（URL友好的字符串）
 */
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 转换静态产品格式为API格式（用于统一处理）
 * 支持标准格式和PANDING格式
 */
export function formatStaticProductForAPI(product) {
  // 检测是否为PANDING格式（有title但没有name和id）
  const isPANDINGFormat = product.title && !product.name && !product.id;
  
  if (isPANDINGFormat) {
    // 转换PANDING格式为标准格式
    const formatted = {
      id: product.id || generateSlug(product.title),
      name: product.title,
      slug: product.slug || generateSlug(product.title),
      title: product.title,
      description: product.description || '',
      metaDescription: product.description || '',
      metaKeywords: product.category ? `${product.category}, ${product.title}` : product.title,
      category: product.category || '',
      image: product.image?.startsWith('/') ? product.image : `/product/${product.image}`,
      images: (product.images || []).map(img => 
        img.startsWith('/') ? img : `/product/${img}`
      ),
      // 处理features：如果是对象数组，转换为字符串数组
      features: product.features ? product.features.map(f => 
        typeof f === 'string' ? f : `${f.title}: ${f.description}`
      ) : [],
      // 默认值
      price: product.price || 0,
      originalPrice: product.originalPrice,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      onSale: product.onSale !== undefined ? product.onSale : false,
      stock: product.stock !== undefined ? product.stock : 0,
      sku: product.sku,
      brand: product.brand,
      status: product.status || 'active',
      // 保留原始数据
      image_names: product.image_names
    };
    return formatted;
  }
  
  // 标准格式，只需确保字段完整
  return {
    ...product,
    // 确保有name（如果没有，使用title）
    name: product.name || product.title || '',
    // 确保有slug
    slug: product.slug || generateSlug(product.name || product.title || ''),
    // 确保图片路径完整（统一使用 /product/ 路径）
    image: product.image?.startsWith('/') ? product.image : `/product/${product.image || ''}`,
    images: (product.images || []).map(img => 
      img.startsWith('/') ? img : `/product/${img}`
    ),
    // 处理features：如果是对象数组，转换为字符串数组
    features: product.features ? product.features.map(f => 
      typeof f === 'string' ? f : `${f.title}: ${f.description}`
    ) : [],
    // 确保字段一致
    onSale: product.onSale !== undefined ? product.onSale : false,
    status: product.status || 'active',
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    stock: product.stock !== undefined ? product.stock : 0,
    price: product.price || 0
  };
}

