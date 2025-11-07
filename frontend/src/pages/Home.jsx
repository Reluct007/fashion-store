import { getCurrentTemplate } from '../../config/template-config';
import Newsletter from '../components/common/Newsletter';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/StructuredData';

// 直接导入模板组件（React 中使用静态导入）
import FashionTemplate from '../../templates/fashion';
import ModernTemplate from '../../templates/modern';
import MinimalTemplate from '../../templates/minimal';

export default function Home() {
  // 获取当前模板
  const currentTemplate = getCurrentTemplate();
  
  // 根据模板名称选择组件
  const getTemplateComponents = () => {
    switch (currentTemplate) {
      case 'modern':
        return ModernTemplate;
      case 'minimal':
        return MinimalTemplate;
      default:
        return FashionTemplate;
    }
  };
  
  const TemplateComponents = getTemplateComponents();
  const { Navbar, Hero, Products, Footer } = TemplateComponents;

  const pageData = {
    hero: {
      badge: 'New Collection',
      title: 'Discover Your Style',
      description: 'Explore our latest fashion collection with trendy designs and premium quality.',
      ctaText: 'Shop Now'
    },
    products: {
      title: 'Featured Products',
      description: 'Discover our curated collection of fashion-forward pieces'
    }
  };

  const baseUrl = window.location.origin;
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Fashion Store - Discover Your Style"
        description="Explore our latest fashion collection with trendy designs and premium quality. Shop the latest trends in clothing, accessories, and more."
        keywords="fashion, clothing, style, trends, online shopping, fashion store"
        canonical={baseUrl}
        type="website"
      />
      <StructuredData
        type="WebSite"
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Fashion Store",
          "url": baseUrl,
          "description": "Discover your style with our latest fashion collection"
        }}
      />
      <Navbar />
      <main className="flex-grow">
        <Hero data={pageData.hero} />
        <Products data={pageData.products} />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
