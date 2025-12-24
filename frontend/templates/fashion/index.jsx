// 服饰类模板 - 默认模板
// 参考 Waterfilter 项目的设计风格，适配服饰类商品

import Navbar from '../../src/components/common/Navbar';
import Hero from '../../src/components/common/Hero';
import Products from '../../src/components/common/Products';
import Footer from '../../src/components/common/Footer';

// 导出模板组件
export default {
  Navbar,
  Hero,
  Products,
  Footer
};

// 也可以单独导出组件
export { default as FashionNavbar } from '../../src/components/common/Navbar';
export { default as FashionHero } from '../../src/components/common/Hero';
export { default as FashionProducts } from '../../src/components/common/Products';
export { default as FashionFooter } from '../../src/components/common/Footer';

