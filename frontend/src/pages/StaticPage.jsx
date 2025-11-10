import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function StaticPage() {
  const location = useLocation();
  // 从路径中提取页面名称（例如 /careers -> careers）
  const page = location.pathname.split('/').filter(Boolean)[0] || '';
  
  // 页面内容配置
  const pageContent = {
    careers: {
      title: 'Careers',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Join Our Team</h2>
        <p class="text-gray-600 mb-4">
          We're always looking for talented individuals to join our team. At Fashion Store, we believe in 
          creating a supportive and innovative work environment where everyone can thrive.
        </p>
        <p class="text-gray-600 mb-4">
          If you're passionate about fashion and want to be part of a dynamic team, we'd love to hear from you.
        </p>
        <p class="text-gray-600">
          Please send your resume to <a href="mailto:careers@fashionstore.com" class="text-rose-600 hover:underline">careers@fashionstore.com</a>
        </p>
      `
    },
    blog: {
      title: 'Blog',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Fashion Blog</h2>
        <p class="text-gray-600 mb-4">
          Welcome to our fashion blog! Here you'll find the latest trends, style tips, and fashion inspiration.
        </p>
        <p class="text-gray-600">
          Check back soon for new articles and updates.
        </p>
      `
    },
    shipping: {
      title: 'Shipping Information',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Shipping Policy</h2>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Shipping Methods</h3>
        <p class="text-gray-600 mb-4">
          We offer various shipping options to meet your needs. Standard shipping typically takes 5-7 business days, 
          while expedited shipping options are available for faster delivery.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Shipping Rates</h3>
        <p class="text-gray-600 mb-4">
          Shipping rates are calculated at checkout based on your location and selected shipping method. 
          Free shipping is available for orders over $50.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">International Shipping</h3>
        <p class="text-gray-600">
          We currently ship to most countries worldwide. International shipping times and rates vary by location.
        </p>
      `
    },
    returns: {
      title: 'Returns & Exchanges',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Return Policy</h2>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Return Window</h3>
        <p class="text-gray-600 mb-4">
          You have 30 days from the date of purchase to return or exchange items. Items must be unworn, 
          unwashed, and in their original packaging with tags attached.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How to Return</h3>
        <p class="text-gray-600 mb-4">
          To initiate a return, please contact our customer service team at 
          <a href="mailto:returns@fashionstore.com" class="text-rose-600 hover:underline">returns@fashionstore.com</a> 
          or use the return portal in your account.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Refunds</h3>
        <p class="text-gray-600">
          Refunds will be processed to your original payment method within 5-10 business days after we receive 
          your return. Shipping costs are non-refundable unless the item was defective or incorrect.
        </p>
      `
    },
    'size-guide': {
      title: 'Size Guide',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Size Guide</h2>
        <p class="text-gray-600 mb-4">
          Finding the perfect fit is important to us. Use our size guide to help you choose the right size.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How to Measure</h3>
        <p class="text-gray-600 mb-4">
          Use a flexible measuring tape to measure your body. For the most accurate fit, measure over 
          lightweight clothing.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Size Chart</h3>
        <p class="text-gray-600 mb-4">
          Our size charts are available on each product page. Sizes may vary slightly by style and brand.
        </p>
        <p class="text-gray-600">
          If you're unsure about your size, please contact our customer service team for assistance.
        </p>
      `
    },
    faq: {
      title: 'Frequently Asked Questions',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How do I place an order?</h3>
        <p class="text-gray-600 mb-4">
          Simply browse our collection, select your items, and add them to your cart. Then proceed to checkout 
          to complete your purchase.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
        <p class="text-gray-600 mb-4">
          We accept all major credit cards, PayPal, and other secure payment methods.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How long does shipping take?</h3>
        <p class="text-gray-600 mb-4">
          Standard shipping typically takes 5-7 business days. Expedited options are available at checkout.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Can I track my order?</h3>
        <p class="text-gray-600">
          Yes! Once your order ships, you'll receive a tracking number via email that you can use to track 
          your package.
        </p>
      `
    },
    privacy: {
      title: 'Privacy Policy',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
        <p class="text-gray-600 mb-4">
          At Fashion Store, we take your privacy seriously. This policy explains how we collect, use, and 
          protect your personal information.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h3>
        <p class="text-gray-600 mb-4">
          We collect information that you provide directly to us, such as when you create an account, make a 
          purchase, or contact us for support.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h3>
        <p class="text-gray-600 mb-4">
          We use your information to process orders, communicate with you, improve our services, and provide 
          personalized experiences.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Your Rights</h3>
        <p class="text-gray-600">
          You have the right to access, update, or delete your personal information at any time. Please contact 
          us if you have any questions about your privacy.
        </p>
      `
    },
    terms: {
      title: 'Terms of Service',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
        <p class="text-gray-600 mb-4">
          By using Fashion Store, you agree to these terms and conditions. Please read them carefully.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h3>
        <p class="text-gray-600 mb-4">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of 
          this agreement.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Use License</h3>
        <p class="text-gray-600 mb-4">
          Permission is granted to temporarily download one copy of the materials on Fashion Store's website 
          for personal, non-commercial transitory viewing only.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Limitations</h3>
        <p class="text-gray-600">
          In no event shall Fashion Store or its suppliers be liable for any damages arising out of the use 
          or inability to use the materials on Fashion Store's website.
        </p>
      `
    },
    cookies: {
      title: 'Cookie Policy',
      content: `
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
        <p class="text-gray-600 mb-4">
          This Cookie Policy explains how Fashion Store uses cookies and similar technologies to recognize 
          you when you visit our website.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">What Are Cookies?</h3>
        <p class="text-gray-600 mb-4">
          Cookies are small text files that are placed on your computer or mobile device when you visit a 
          website. They are widely used to make websites work more efficiently.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">How We Use Cookies</h3>
        <p class="text-gray-600 mb-4">
          We use cookies to remember your preferences, improve your browsing experience, and analyze website 
          traffic and usage.
        </p>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Managing Cookies</h3>
        <p class="text-gray-600">
          You can control and manage cookies through your browser settings. However, disabling cookies may 
          affect the functionality of our website.
        </p>
      `
    }
  };

  const currentPage = pageContent[page] || {
    title: 'Page Not Found',
    content: '<p class="text-gray-600">The page you are looking for does not exist.</p>'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              {currentPage.title}
            </h1>
            <div 
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: currentPage.content }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

