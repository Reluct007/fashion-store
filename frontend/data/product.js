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
    features: [
      {
        title: "精美工艺",
        description: "精湛的制作工艺，每一个细节都经过精心打磨"
      }
    ]
  }
];
