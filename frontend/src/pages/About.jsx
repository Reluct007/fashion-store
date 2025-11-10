import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ShoppingBag, Heart, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About Fashion Store
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your one-stop destination for the latest fashion trends and timeless pieces.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              At Fashion Store, we believe that fashion is more than just clothing—it's a form of self-expression. 
              Our mission is to provide high-quality, stylish clothing that allows our customers to express their 
              unique personalities and feel confident in their own skin.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We are committed to offering a diverse range of fashion-forward pieces that cater to all styles, 
              sizes, and budgets, while maintaining the highest standards of quality and customer service.
            </p>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality First</h3>
                <p className="text-gray-600">
                  We carefully curate our collection to ensure every piece meets our high standards for quality and style.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Focused</h3>
                <p className="text-gray-600">
                  Your satisfaction is our priority. We're dedicated to providing exceptional customer service and support.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Style Excellence</h3>
                <p className="text-gray-600">
                  We stay ahead of fashion trends to bring you the latest styles and timeless classics.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-4">
                Fashion Store was founded with a simple vision: to make fashion accessible to everyone. 
                What started as a small boutique has grown into a trusted online destination for fashion enthusiasts worldwide.
              </p>
              <p className="mb-4">
                Over the years, we've built relationships with top designers and manufacturers to bring you 
                a curated selection of clothing that combines style, quality, and affordability. Our team of 
                fashion experts works tirelessly to ensure our collection stays fresh and on-trend.
              </p>
              <p>
                Today, we're proud to serve thousands of customers who trust us for their fashion needs. 
                We're constantly evolving and improving to better serve you, and we're excited about what the future holds.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-rose-50 rounded-lg p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Fashion Community</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Stay updated with our latest collections, exclusive offers, and fashion tips by subscribing to our newsletter.
            </p>
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold"
            >
              Shop Now
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

