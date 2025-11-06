// 现代简约模板
// 简洁现代的网站设计风格

import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react';
import { useState } from 'react';

// 现代简约导航栏
function ModernNavbar({ data = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{data.brand || 'Fashion Store'}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900 transition-colors">Products</Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <Link to="/admin" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Admin
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// 现代简约 Hero
function ModernHero({ data = {} }) {
  return (
    <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {data.title || 'Discover Your Style'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {data.description || 'Explore our latest fashion collection with trendy designs and premium quality.'}
          </p>
          <Link 
            to="/products"
            className="inline-block px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

// 现代简约产品展示（使用现有的 Products 组件）
import Products from '../../src/components/common/Products';

// 现代简约页脚
function ModernFooter({ data = {} }) {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/sale" className="hover:text-white transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Fashion Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default {
  Navbar: ModernNavbar,
  Hero: ModernHero,
  Products: Products,
  Footer: ModernFooter
};

