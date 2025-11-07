/**
 * 产品数据示例文件
 * 
 * 使用方法：
 * 1. 将此文件复制为 products.js
 * 2. 修改下面的产品数据
 * 3. 将产品图片放到 public/products/images/ 目录
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
    {
      id: 1,
      name: "Elegant Summer Dress",
      slug: "elegant-summer-dress",
      title: "Elegant Summer Dress - Premium Fashion",
      description: "Beautiful summer dress with elegant design. Perfect for any occasion. Made from high-quality fabric that is both comfortable and stylish.",
      metaDescription: "Shop the elegant summer dress. Premium quality, stylish design. Free shipping available.",
      metaKeywords: "summer dress, elegant dress, fashion, women's clothing, casual wear",
      canonicalUrl: "https://example.com/product/elegant-summer-dress",
      price: 89.99,
      originalPrice: 129.99,
      category: "Dresses",
      image: "/products/images/dress-1.jpg",
      images: [
        "/products/images/dress-1-1.jpg",
        "/products/images/dress-1-2.jpg",
        "/products/images/dress-1-3.jpg"
      ],
      rating: 4.5,
      reviews: 128,
      onSale: true,
      stock: 50,
      sku: "DRS-001",
      brand: "Fashion Brand",
      status: "active",
      features: [
        "Premium Quality Material",
        "Comfortable Fit",
        "Machine Washable",
        "30-Day Return Policy"
      ]
    },
    {
      id: 2,
      name: "Classic White Shirt",
      slug: "classic-white-shirt",
      title: "Classic White Shirt - Timeless Style",
      description: "Classic white shirt that never goes out of style. Perfect for both casual and formal occasions.",
      metaDescription: "Classic white shirt for men and women. Timeless design, premium quality cotton.",
      metaKeywords: "white shirt, classic shirt, formal wear, business casual",
      price: 49.99,
      category: "Tops",
      image: "/products/images/shirt-1.jpg",
      images: [
        "/products/images/shirt-1-1.jpg",
        "/products/images/shirt-1-2.jpg"
      ],
      rating: 4.8,
      reviews: 256,
      onSale: false,
      stock: 100,
      sku: "SHI-002",
      brand: "Classic Collection",
      status: "active",
      features: [
        "100% Cotton",
        "Wrinkle Resistant",
        "Easy Care",
        "Classic Fit"
      ]
    },
    {
      id: 3,
      name: "Denim Jacket",
      slug: "denim-jacket",
      title: "Denim Jacket - Casual Cool",
      description: "Stylish denim jacket for a casual, cool look. Perfect for layering in any season.",
      metaDescription: "Stylish denim jacket. Durable fabric, classic design. Perfect for everyday wear.",
      metaKeywords: "denim jacket, casual jacket, outerwear, fashion",
      price: 79.99,
      originalPrice: 99.99,
      category: "Outerwear",
      image: "/products/images/jacket-1.jpg",
      rating: 4.6,
      reviews: 189,
      onSale: true,
      stock: 75,
      sku: "JKT-003",
      brand: "Denim Co",
      status: "active"
    }
  ]
};

