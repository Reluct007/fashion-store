import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from '../../contexts/CartContext';
import { getStaticCategoryConfigs } from '../../lib/categories';

export default function Navbar({ data = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, getCartCount } = useCart();

  const categoryConfigs = getStaticCategoryConfigs();
  const categorySubmenu = categoryConfigs.map(c => ({
    label: c.label,
    href: `/collection/${c.slug}`
  }));

  const navbarData = {
    brand: data.brand || 'Fashion Store',
    logo: data.logo || '/logo.png',
    menu: data.menu || [
      {
        label: 'Shop',
        href: '/products',
        submenu: categorySubmenu
      },
      {
        label: 'About',
        href: '/about'
      },
      {
        label: 'Contact',
        href: '/contact'
      }
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
              {navbarData.menu.map((item, index) => (
                item.submenu ? (
                  <div 
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link 
                      to={item.href}
                      className="text-gray-700 hover:text-rose-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                    {activeDropdown === item.label && (
                      <div 
                        className={`absolute left-0 top-full mt-1 rounded-md border bg-white shadow-lg p-4 grid gap-2 z-50 ${
                          item.submenu.length > 10 ? 'grid-cols-2 w-96' : 'grid-cols-1 w-64'
                        }`}
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {item.submenu.map((subitem, idx) => (
                          <Link 
                            key={idx} 
                            to={subitem.href} 
                            className="text-sm text-gray-700 hover:text-rose-600 hover:underline transition-colors py-1 cursor-pointer"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    key={index} 
                    to={item.href} 
                    className="text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
            </button>
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
                <div key={index}>
                  <Link 
                    to={item.href}
                    className="text-gray-700 hover:text-rose-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-2 flex flex-col gap-2">
                      {item.submenu.map((subitem, idx) => (
                        <Link 
                          key={idx} 
                          to={subitem.href}
                          className="block text-sm text-gray-600 hover:text-rose-600 py-1 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
      />
    </nav>
  );
}

