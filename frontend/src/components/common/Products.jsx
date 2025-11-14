import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { getProducts } from '../../lib/api';
import { getProductUrlIdentifier } from '../../lib/slug';

export default function Products({ data = {} }) {
  const [favorites, setFavorites] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从 API 加载产品数据
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const apiProducts = await getProducts();
      setProducts(apiProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      // 如果 API 失败，使用示例数据作为后备
      setProducts([
    {
      id: 1,
      name: 'Elegant Summer Dress',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      rating: 4.5,
      reviews: 128,
      category: 'Dresses',
      onSale: true
    },
    {
      id: 2,
      name: 'Classic White Shirt',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400',
      rating: 4.8,
      reviews: 256,
      category: 'Tops'
    },
    {
      id: 3,
      name: 'Denim Jacket',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      rating: 4.6,
      reviews: 189,
      category: 'Outerwear',
      onSale: true
    },
    {
      id: 4,
      name: 'High-Waist Jeans',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      rating: 4.7,
      reviews: 312,
      category: 'Bottoms'
    },
    {
      id: 5,
      name: 'Silk Scarf',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
      rating: 4.9,
      reviews: 145,
      category: 'Accessories'
    },
    {
      id: 6,
      name: 'Leather Handbag',
      price: 149.99,
      originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      rating: 4.8,
      reviews: 278,
      category: 'Accessories',
      onSale: true
    }
  ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {data.title || 'Featured Products'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {data.description || 'Discover our curated collection of fashion-forward pieces'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No products available.</div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const productIdentifier = getProductUrlIdentifier(product);
            return (
              <div key={product.id || product.slug || productIdentifier} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.onSale && (
                    <span className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Sale
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(productIdentifier)}
                    className={`absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors ${
                      favorites.has(productIdentifier) ? 'text-rose-600' : 'text-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(productIdentifier) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <Link to={`/product/${productIdentifier}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-rose-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                  
                  {/* Rating */}
                  {Number(product.rating) > 0 && Number(product.reviews) > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                    {product.originalPrice && product.originalPrice > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Link
                    to={`/product/${productIdentifier}`}
                    className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-3 rounded-lg hover:bg-rose-700 transition-colors font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-rose-600 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors font-semibold"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

