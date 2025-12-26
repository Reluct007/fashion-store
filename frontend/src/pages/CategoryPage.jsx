import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { getProducts } from '../lib/api';
import { getProductUrlIdentifier } from '../lib/slug';
import { getCategoryLabelBySlug } from '../lib/categories';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const location = useLocation();
  
  // 从URL路径中提取category，优先使用params，否则从pathname提取
  const getCategoryFromPath = () => {
    if (categorySlug) {
      return categorySlug;
    }
    const path = location.pathname;
    // 提取路径的第一段（除了/）
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2 && (segments[0] === 'collection' || segments[0] === 'collections')) {
      return segments[1];
    }
    return segments[0] || null;
  };
  
  const category = getCategoryFromPath();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadProducts();
  }, [category, location.pathname]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // 如果是分类页面，按分类筛选；如果是集合页面，获取所有产品然后筛选
      const allProducts = await getProducts();
      
      let filteredProducts = [];
      if (category) {
        const categoryLabel = getCategoryLabelBySlug(category);
        const normalizedCategoryLabel = (categoryLabel || category || '').toLowerCase();
        const normalizedCategoryFallback = (category || '').toLowerCase().replace(/-/g, ' ');

        filteredProducts = allProducts.filter(product => {
          const productCategory = (product.category || '').toLowerCase();
          if (!productCategory) return false;

          if (categoryLabel) {
            return productCategory === normalizedCategoryLabel;
          }

          return (
            productCategory === normalizedCategoryLabel ||
            productCategory === normalizedCategoryFallback ||
            productCategory.includes(normalizedCategoryLabel) ||
            normalizedCategoryLabel.includes(productCategory)
          );
        });
      } else {
        filteredProducts = allProducts;
      }
      
      setProducts(filteredProducts);
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

  // 获取页面标题
  const getPageTitle = () => {
    if (!category) return 'All Products';
    const categoryLabel = getCategoryLabelBySlug(category);
    if (categoryLabel) return categoryLabel;
    const readable = String(category).replace(/-/g, ' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
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

  const getCanonicalUrl = () => {
    if (typeof window !== 'undefined' && category) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      // 使用当前路径，但去除查询参数和 hash
      const path = window.location.pathname;
      return `${baseUrl}${path}`;
    }
    return '';
  };

  const getPageDescription = () => {
    const categoryName = getPageTitle();
    return `Browse our ${categoryName} collection. Find the perfect ${categoryName.toLowerCase()} pieces for your style.`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${getPageTitle()} - Fashion Store`}
        description={getPageDescription()}
        canonical={getCanonicalUrl()}
        ogType="website"
      />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg mb-4">No products found in this category.</p>
              <Link
                to="/products"
                className="text-rose-600 hover:underline"
              >
                View All Products
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
                          className="w-full aspect-[3/4] object-cover object-top group-hover:scale-105 transition-transform duration-300"
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

