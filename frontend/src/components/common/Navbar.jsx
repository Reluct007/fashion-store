import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';

export default function Navbar({ data = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState({ categories: false, collections: false });

  const navbarData = {
    brand: data.brand || 'Fashion Store',
    logo: data.logo || '/logo.png',
    menu: data.menu || [
      { label: 'Home', href: '/' },
      { label: 'Women', href: '/women' },
      { label: 'Men', href: '/men' },
      { label: 'Kids', href: '/kids' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ],
    categories: data.categories || [
      { label: 'Dresses', href: '/category/dresses' },
      { label: 'Tops', href: '/category/tops' },
      { label: 'Bottoms', href: '/category/bottoms' },
      { label: 'Outerwear', href: '/category/outerwear' },
      { label: 'Accessories', href: '/category/accessories' }
    ],
    collections: data.collections || [
      { label: 'New Arrivals', href: '/collection/new' },
      { label: 'Sale', href: '/collection/sale' },
      { label: 'Trending', href: '/collection/trending' }
    ]
  };

  return (
    <nav className="sticky top-0 left-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden lg:flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{navbarData.brand}</span>
            </Link>

            {/* Menu Items */}
            <div className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-rose-600 transition-colors">
                Home
              </Link>
              
              {/* Categories Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setIsDropdownOpen({ ...isDropdownOpen, categories: true })}
                onMouseLeave={() => setIsDropdownOpen({ ...isDropdownOpen, categories: false })}
              >
                <button className="text-gray-700 hover:text-rose-600 transition-colors">
                  Categories
                </button>
                {isDropdownOpen.categories && (
                  <div className="absolute left-0 mt-2 rounded-md border bg-white shadow-lg p-4 grid grid-cols-1 gap-2 w-64">
                    {navbarData.categories.map((item, idx) => (
                      <Link 
                        key={idx} 
                        to={item.href} 
                        className="text-sm text-gray-700 hover:text-rose-600 hover:underline transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Collections Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setIsDropdownOpen({ ...isDropdownOpen, collections: true })}
                onMouseLeave={() => setIsDropdownOpen({ ...isDropdownOpen, collections: false })}
              >
                <button className="text-gray-700 hover:text-rose-600 transition-colors">
                  Collections
                </button>
                {isDropdownOpen.collections && (
                  <div className="absolute left-0 mt-2 rounded-md border bg-white shadow-lg p-4 grid grid-cols-1 gap-2 w-64">
                    {navbarData.collections.map((item, idx) => (
                      <Link 
                        key={idx} 
                        to={item.href} 
                        className="text-sm text-gray-700 hover:text-rose-600 hover:underline transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Static Links */}
              {navbarData.menu.filter(i => !['Home', 'Categories', 'Collections'].includes(i.label)).map((item, index) => (
                <Link 
                  key={index} 
                  to={item.href} 
                  className="text-gray-700 hover:text-rose-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <Link 
              to="/admin" 
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{navbarData.brand}</span>
          </Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navbarData.menu.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.href}
                  className="text-gray-700 hover:text-rose-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900 mb-2">Categories</p>
                {navbarData.categories.map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={item.href}
                    className="block text-sm text-gray-600 hover:text-rose-600 py-1 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

