// 静态产品数据
// 参考 PANDING 项目的格式
// 图片路径使用 /product/ 前缀，图片文件存放在 public/product/ 目录
export const product = [
  {
    title: "示例产品 1",
    category: "Fashion",
    description: "这是第一个示例产品的描述",
    image: "/product/example1.jpg",
    images: ["/product/example1.jpg", "/product/example1-2.jpg"],
    image_names: ["example1.jpg", "example1-2.jpg"],
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.5,
    reviews: 128,
    onSale: true,
    // 尺码选项
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    // 颜色选项（支持名称和颜色代码）
    colors: [
      { name: "黑色", code: "#000000", image: "/product/example1-black.jpg" },
      { name: "白色", code: "#FFFFFF", image: "/product/example1-white.jpg" },
      { name: "红色", code: "#FF0000", image: "/product/example1-red.jpg" }
    ],
    // 库存信息（可选）
    stock: {
      "XS": { "黑色": 10, "白色": 5, "红色": 8 },
      "S": { "黑色": 15, "白色": 12, "红色": 10 },
      "M": { "黑色": 20, "白色": 18, "红色": 15 },
      "L": { "黑色": 18, "白色": 15, "红色": 12 },
      "XL": { "黑色": 12, "白色": 10, "红色": 8 },
      "XXL": { "黑色": 5, "白色": 3, "红色": 5 }
    },
    features: [
      {
        title: "高质量材料",
        description: "采用优质材料制作，确保耐用性和舒适性"
      },
      {
        title: "时尚设计",
        description: "紧跟时尚潮流，展现个性风格"
      }
    ]
  },
  {
    title: "示例产品 2",
    category: "Accessories",
    description: "这是第二个示例产品的描述",
    image: "/product/example2.jpg",
    images: ["/product/example2.jpg"],
    image_names: ["example2.jpg"],
    price: 49.99,
    rating: 4.8,
    reviews: 256,
    onSale: false,
    // 尺码选项（对于配饰可能不需要，或使用通用尺寸）
    sizes: ["One Size"],
    // 颜色选项
    colors: [
      { name: "金色", code: "#FFD700", image: "/product/example2-gold.jpg" },
      { name: "银色", code: "#C0C0C0", image: "/product/example2-silver.jpg" }
    ],
    stock: {
      "One Size": { "金色": 25, "银色": 30 }
    },
    features: [
      {
        title: "精美工艺",
        description: "精湛的制作工艺，每一个细节都经过精心打磨"
      }
    ]
  }
];
