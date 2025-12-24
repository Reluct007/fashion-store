import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from '../../contexts/CartContext';

export default function Navbar({ data = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, getCartCount } = useCart();

  const navbarData = {
    brand: data.brand || 'Fashion Store',
    logo: data.logo || '/logo.png',
    menu: data.menu || [
      {
        label: 'The Originals',
        href: '/collections/classic-prints',
        submenu: [
          { label: 'Monkey', href: '/collections/monkey' },
          { label: 'Hearts', href: '/collections/hearts' },
          { label: 'Moby', href: '/collections/moby' },
          { label: 'Hathi', href: '/collections/hathi' },
          { label: 'Amanda', href: '/collections/amanda' },
          { label: 'Jemina', href: '/collections/jemina' },
          { label: 'Big Cata', href: '/collections/cata' }
        ]
      },
      {
        label: 'New Arrivals',
        href: '/collections/new-arrivals',
        submenu: [
          { label: 'Shop All New Arrivals', href: '/collections/new-arrivals' },
          { label: "Women's New Arrivals", href: '/collections/womens-new-arrivals' },
          { label: 'Pajamas New Arrivals', href: '/collections/pajamas-new-arrivals' },
          { label: "Kids' New Arrivals", href: '/collections/kids-new-arrivals' },
          { label: 'Accessories New Arrivals', href: '/collections/accessories-new-arrivals' },
          { label: 'Swim New Arrivals', href: '/collections/swim-new-arrivals' }
        ]
      },
      {
        label: 'Pajamas',
        href: '/collections/pajamas',
        submenu: [
          { label: 'Shop All Pajamas', href: '/collections/pajamas' },
          { label: "Women's Pajamas", href: '/collections/womens-pajamas' },
          { label: "Kids' Pajamas", href: '/collections/kids-pajamas' },
          { label: "Men's Pajamas", href: '/collections/mens-pajamas' },
          { label: 'Robes & Kimonos', href: '/collections/robes' },
          { label: 'Baby Pajamas', href: '/collections/baby-clothing' }
        ]
      },
      {
        label: 'Clothing',
        href: '/collections/womens-clothes',
        submenu: [
          { label: 'Shop All Womens', href: '/collections/womens-clothes' },
          { label: 'Dresses', href: '/collections/dresses' },
          { label: 'Tops', href: '/collections/tops' },
          { label: 'Bottoms', href: '/collections/bottoms' },
          { label: 'Swim', href: '/collections/womens-swim' },
          { label: 'Shop All Mens', href: '/collections/mens' },
          { label: 'Shop All Kids & Baby', href: '/collections/kids-and-baby' }
        ]
      },
      {
        label: 'Intimates',
        href: '/collections/intimates',
        submenu: [
          { label: 'Shop All Intimates', href: '/collections/intimates' },
          { label: 'Bralettes + Tops', href: '/collections/intimates-bralettes-tops' },
          { label: 'Underwear + Bottoms', href: '/collections/intimates-undies-bottoms' },
          { label: 'Pima Soft Lounge', href: '/collections/intimates-pima-soft-lounge' }
        ]
      },
      {
        label: 'Accessories',
        href: '/collections/accessories',
        submenu: [
          { label: 'Shop All Accessories', href: '/collections/accessories' },
          { label: 'Gifts', href: '/collections/gifts' },
          { label: 'Makeup & Toiletry Cases', href: '/collections/makeup-toiletry-bags' },
          { label: 'Bags', href: '/collections/bags' },
          { label: 'Jewelry', href: '/collections/jewelry' },
          { label: 'Hats & Hair Accessories', href: '/collections/hair' },
          { label: 'Shoes & Socks', href: '/collections/shoes' }
        ]
      },
      {
        label: 'Home',
        href: '/collections/home',
        submenu: [
          { label: 'Shop All Home & Bedding', href: '/collections/home' },
          { label: 'Quilts & Duvets', href: '/collections/quilts-duvets' },
          { label: 'Sheets & Pillowcases', href: '/collections/sheets-pillowcases' },
          { label: 'Decorative Pillows', href: '/collections/decorative-pillows' },
          { label: 'Sleepover Bags', href: '/collections/sleepover-bags' }
        ]
      },
      {
        label: 'Sale',
        href: '/collections/sale',
        submenu: [
          { label: 'Shop All Sale', href: '/collections/sale' },
          { label: "Women's Sale", href: '/collections/womens-sale' },
          { label: "Kids' & Baby Sale", href: '/collections/kids-sale' },
          { label: 'Accessories Sale', href: '/collections/accessories-sale' },
          { label: 'Home Sale', href: '/collections/home-sale' }
        ]
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
                        className="absolute left-0 top-full mt-1 rounded-md border bg-white shadow-lg p-4 grid grid-cols-1 gap-2 w-64 z-50"
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

