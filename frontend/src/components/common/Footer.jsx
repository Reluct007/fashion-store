import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import SubscribeForm from './SubscribeForm';
import PaymentMethods from './PaymentMethods';

export default function Footer({ data = {} }) {
  const footerData = {
    brand: data.brand || 'Fashion Store',
    description: data.description || 'Your one-stop destination for the latest fashion trends and timeless pieces.',
    links: {
      shop: [
        { label: 'Women', href: '/women' },
        { label: 'Men', href: '/men' },
        { label: 'Kids', href: '/kids' },
        { label: 'Sale', href: '/sale' }
      ],
      company: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '/careers' },
        { label: 'Blog', href: '/blog' }
      ],
      customer: [
        { label: 'Shipping', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Size Guide', href: '/size-guide' },
        { label: 'FAQ', href: '/faq' }
      ],
      legal: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' }
      ]
    },
    contact: {
      email: 'info@fashionstore.com',
      phone: '+1 (555) 123-4567',
      address: '123 Fashion Street, Style City, SC 12345'
    },
    social: {
      facebook: '#',
      instagram: '#',
      twitter: '#'
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FS</span>
              </div>
              <span className="text-2xl font-bold text-white">{footerData.brand}</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {footerData.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rose-500" />
                <span className="text-sm">{footerData.contact.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-rose-500" />
                <span className="text-sm">{footerData.contact.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 mt-1" />
                <span className="text-sm">{footerData.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerData.links.shop.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="hover:text-rose-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerData.links.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="hover:text-rose-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 mb-6">
              {footerData.links.customer.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="hover:text-rose-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Newsletter Subscription */}
            <div>
              <h3 className="text-white font-semibold mb-4">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-3">
                Subscribe to get special offers and updates
              </p>
              <SubscribeForm variant="footer" source="footer" />
            </div>
          </div>
        </div>

        {/* Payment Methods & Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left: Social Media & Copyright */}
            <div className="flex flex-col gap-4">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <a 
                  href={footerData.social.facebook} 
                  className="p-2 bg-gray-800 rounded-full hover:bg-rose-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href={footerData.social.instagram} 
                  className="p-2 bg-gray-800 rounded-full hover:bg-rose-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href={footerData.social.twitter} 
                  className="p-2 bg-gray-800 rounded-full hover:bg-rose-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>

              {/* Copyright */}
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} {footerData.brand}. All rights reserved.
              </p>
            </div>

            {/* Right: Payment Methods */}
            <PaymentMethods />
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 text-sm mt-6 pt-6 border-t border-gray-800">
            {footerData.links.legal.map((link, index) => (
              <Link 
                key={index} 
                to={link.href} 
                className="hover:text-rose-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

