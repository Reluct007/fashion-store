import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { getProducts } from '../lib/api';
import { getProductUrlIdentifier } from '../lib/slug';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function CategoryPage() {
  const { category: paramCategory } = useParams();
  const location = useLocation();
  
  // 从URL路径中提取category，优先使用params，否则从pathname提取
  const getCategoryFromPath = () => {
    if (paramCategory) {
      return paramCategory;
    }
    const path = location.pathname;
    // 提取路径的第一段（除了/）
    const segments = path.split('/').filter(Boolean);
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
        // 分类筛选（不区分大小写）
        const categoryLower = category.toLowerCase();
        filteredProducts = allProducts.filter(product => {
          const productCategory = (product.category || '').toLowerCase();
          
          // 精确匹配分类名称
          if (productCategory === categoryLower) {
            return true;
          }
          
          // 特殊处理：女性/男性/儿童
          if (categoryLower === 'women' || categoryLower === 'woman') {
            return productCategory.includes('women') || 
                   productCategory.includes('woman') ||
                   productCategory.includes('female') ||
                   productCategory === 'fashion'; // 默认所有产品都是女性时尚
          }
          
          if (categoryLower === 'men' || categoryLower === 'man') {
            return productCategory.includes('men') || 
                   productCategory.includes('man') ||
                   productCategory.includes('male');
          }
          
          if (categoryLower === 'kids' || categoryLower === 'kid' || categoryLower === 'children') {
            return productCategory.includes('kids') || 
                   productCategory.includes('kid') ||
                   productCategory.includes('child') ||
                   productCategory.includes('children');
          }
          
          // 分类匹配
          if (categoryLower === 'dresses') {
            return productCategory.includes('dress');
          }
          if (categoryLower === 'tops') {
            return productCategory.includes('top') || 
                   productCategory.includes('shirt') ||
                   productCategory.includes('blouse');
          }
          if (categoryLower === 'bottoms') {
            return productCategory.includes('bottom') ||
                   productCategory.includes('pants') ||
                   productCategory.includes('jeans');
          }
          if (categoryLower === 'outerwear') {
            return productCategory.includes('outerwear') ||
                   productCategory.includes('jacket') ||
                   productCategory.includes('coat');
          }
          if (categoryLower === 'accessories') {
            return productCategory.includes('accessor');
          }
          
          // 集合筛选
          if (categoryLower === 'sale') {
            return product.onSale === true || 
                   (product.originalPrice && product.price && product.originalPrice > product.price);
          }
          if (categoryLower === 'new') {
            return true; // 所有产品都可以是新款
          }
          if (categoryLower === 'trending') {
            return product.rating && product.rating >= 4.5;
          }
          
          // 模糊匹配
          return productCategory.includes(categoryLower) || 
                 categoryLower.includes(productCategory);
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
    const categoryLower = category.toLowerCase();
    const categoryMap = {
      'women': 'Women\'s Fashion',
      'men': 'Men\'s Fashion',
      'kids': 'Kids\' Fashion',
      'dresses': 'Dresses',
      'tops': 'Tops',
      'bottoms': 'Bottoms',
      'outerwear': 'Outerwear',
      'accessories': 'Accessories',
      'new': 'New Arrivals',
      'sale': 'Sale',
      'trending': 'Trending'
    };
    return categoryMap[categoryLower] || category.charAt(0).toUpperCase() + category.slice(1);
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

