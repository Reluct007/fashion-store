// 极简模板
// 极简主义设计风格，专注内容展示

import { Link } from 'react-router-dom';

// 极简导航栏
function MinimalNavbar({ data = {} }) {
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-gray-900">
            {data.brand || 'Fashion Store'}
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900 transition-colors">Products</Link>
            <Link to="/admin" className="text-gray-700 hover:text-gray-900 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// 极简 Hero
function MinimalHero({ data = {} }) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {data.title || 'Fashion Store'}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {data.description || 'Simple, elegant, timeless.'}
        </p>
        <Link 
          to="/products"
          className="inline-block px-6 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}

// 极简产品展示（使用现有的 Products 组件）
import Products from '../../src/components/common/Products';

// 极简页脚
function MinimalFooter({ data = {} }) {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Fashion Store
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default {
  Navbar: MinimalNavbar,
  Hero: MinimalHero,
  Products: Products,
  Footer: MinimalFooter
};

