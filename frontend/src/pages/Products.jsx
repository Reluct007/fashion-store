import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { getProducts } from '../lib/api';
import { getProductUrlIdentifier } from '../lib/slug';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiProducts = await getProducts();
      setProducts(apiProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again later.');
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Products
            </h1>
            <p className="text-gray-600">
              Discover our complete collection of fashion-forward pieces
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg mb-4">No products available.</p>
              <Link
                to="/"
                className="text-rose-600 hover:underline"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const productIdentifier = getProductUrlIdentifier(product);
                const productName = product.name || product.title || 'Product';
                const productImage = product.image || (product.images && product.images[0]) || '';
                const productPrice = product.price || 0;
                const productOriginalPrice = product.originalPrice || null;
                const productRating = product.rating || 0;
                const productReviews = product.reviews || 0;
                const isOnSale = product.onSale || (productOriginalPrice && productOriginalPrice > productPrice);

                return (
                  <div
                    key={product.id || product.slug || productIdentifier}
                    className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative overflow-hidden">
                      <Link to={`/product/${productIdentifier}`}>
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                          }}
                        />
                      </Link>
                      {(isOnSale === true || isOnSale === 1) && (
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
                      <p className="text-sm text-gray-500 mb-2">{product.category || 'Fashion'}</p>
                      <Link to={`/product/${productIdentifier}`}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-rose-600 transition-colors line-clamp-2">
                          {productName}
                        </h3>
                      </Link>

                      {/* Rating */}
                      {productRating > 0 && productReviews > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(productRating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {productRating} ({productReviews})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          ${productPrice.toFixed(2)}
                        </span>
                        {productOriginalPrice && productOriginalPrice > 0 && productOriginalPrice > productPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${productOriginalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

