import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero({ data = {} }) {
  const heroData = {
    badge: data.badge || 'New Collection',
    title: data.title || 'Discover Your Style',
    description: data.description || 'Explore our latest fashion collection with trendy designs and premium quality.',
    image: data.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    ctaText: data.ctaText || 'Shop Now'
  };

  return (
    <section className="py-8 px-4 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <span className="text-sm font-semibold text-rose-600">{heroData.badge}</span>
              <ArrowRight className="w-4 h-4 text-rose-600" />
            </div>
            <h1 className="my-4 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              {heroData.title}
            </h1>
            <p className="mb-8 max-w-xl text-gray-600 text-lg">
              {heroData.description}
            </p>
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold"
            >
              {heroData.ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative">
            <img 
              src={heroData.image} 
              alt={heroData.title}
              className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg object-cover shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

