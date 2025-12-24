import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Star, Minus, Plus, 
  Truck, RotateCcw, Shield, Check 
} from 'lucide-react';
import { getProduct, getProducts, recordClickStat } from '../lib/api';
import { getProductUrlIdentifier } from '../lib/slug';
import CountdownTimer from '../components/common/CountdownTimer';
import SocialShare from '../components/common/SocialShare';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SEO from '../components/common/SEO';
import Toast from '../components/common/Toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [displayImage, setDisplayImage] = useState(''); // 当前显示的主图URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [buttonConfig, setButtonConfig] = useState(null);
  const [countdownTimer, setCountdownTimer] = useState(null);
  // 尺码和颜色选择
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  // Toast notification state
  const [toast, setToast] = useState(null);

  // 促销结束时间（示例：24小时后）
  const saleEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProduct(id);
      setProduct(productData);
      
      // 初始化默认选择的尺码和颜色，并设置主图
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0].name);
        // 如果第一个颜色有独立的产品图片，使用该颜色的第一张产品图片
        if (productData.colors[0].productImages && productData.colors[0].productImages.length > 0) {
          setDisplayImage(productData.colors[0].productImages[0]);
        } else if (productData.images && productData.images.length > 0) {
          setDisplayImage(productData.images[0]);
        } else if (productData.image) {
          setDisplayImage(productData.image);
        }
      } else if (productData.images && productData.images.length > 0) {
        setDisplayImage(productData.images[0]);
      } else if (productData.image) {
        setDisplayImage(productData.image);
      }
      
      // 加载相关产品
      const allProducts = await getProducts();
      const related = allProducts
        .filter(p => p.id !== productData.id && p.category === productData.category)
        .slice(0, 4);
      setRelatedProducts(related);
      
      // 检查是否有按钮配置
      if (productData.buttonConfig) {
        setButtonConfig(productData.buttonConfig);
      }

      // 加载倒计时配置
      try {
        const timerResponse = await fetch(
          `${API_BASE_URL}/api/countdown-timers/query?product_id=${productData.id}`
        );
        if (timerResponse.ok) {
          const timerData = await timerResponse.json();
          if (timerData && timerData.end_date) {
            setCountdownTimer(timerData);
          }
        }
        
        // 如果没有产品特定的倒计时，尝试获取分类倒计时
        if (!countdownTimer && productData.category) {
          const categoryTimerResponse = await fetch(
            `${API_BASE_URL}/api/countdown-timers/query?category=${encodeURIComponent(productData.category)}`
          );
          if (categoryTimerResponse.ok) {
            const categoryTimerData = await categoryTimerResponse.json();
            if (categoryTimerData && categoryTimerData.end_date) {
              setCountdownTimer(categoryTimerData);
            }
          }
        }
      } catch (err) {
        console.error('Error loading countdown timer:', err);
        // 不影响页面加载，只记录错误
      }
    } catch (err) {
      setError('Failed to load product: ' + err.message);
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // 验证尺码和颜色选择
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setToast({ message: 'Please select a size', type: 'error' });
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setToast({ message: 'Please select a color', type: 'error' });
      return;
    }

    // 检查库存
    if (selectedSize && selectedColor && product.stock && product.stock[selectedSize]) {
      const stockCount = product.stock[selectedSize][selectedColor] || 0;
      if (stockCount < quantity) {
        setToast({ message: `Only ${stockCount} items available in stock`, type: 'error' });
        return;
      }
    }

    // 如果配置了按钮跳转，则跳转到指定 URL
    if (buttonConfig && buttonConfig.action_type === 'link' && buttonConfig.target_url) {
      // 记录点击统计
      try {
        await recordClickStat({
          target_url: buttonConfig.target_url,
          page_type: 'product',
          page_id: product.id,
          page_path: null
        });
      } catch (err) {
        console.error('Failed to record click stat:', err);
      }
      
      window.open(
        buttonConfig.target_url,
        (buttonConfig.link_target && (buttonConfig.link_target === '_blank' || buttonConfig.link_target === '_self'))
          ? buttonConfig.link_target
          : (buttonConfig.target_url.startsWith('http') ? '_blank' : '_self')
      );
      return;
    }
    
    // 如果配置了 API 端点，则调用 API
    if (buttonConfig && buttonConfig.action_type === 'api' && buttonConfig.api_endpoint) {
      fetch(buttonConfig.api_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity,
          size: selectedSize,
          color: selectedColor
        }),
      }).then(() => {
        setToast({ message: 'Product added successfully!', type: 'success' });
      }).catch(() => {
        setToast({ message: 'Failed to add product', type: 'error' });
      });
      return;
    }
    
    // 默认行为：添加到购物车
    const variantInfo = [];
    if (selectedSize) variantInfo.push(`Size: ${selectedSize}`);
    if (selectedColor) variantInfo.push(`Color: ${selectedColor}`);
    const variantText = variantInfo.length > 0 ? ` (${variantInfo.join(', ')})` : '';
    setToast({ message: `Added ${quantity} x ${product.name}${variantText} to cart!`, type: 'success' });
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(10, prev + delta)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link to="/" className="text-rose-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // 生成 canonical URL
  const getCanonicalUrl = () => {
    if (!product) return '';
    const productIdentifier = getProductUrlIdentifier(product);
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : '';
    return `${baseUrl}/product/${productIdentifier}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {product && (
        <SEO
          title={`${product.name} - Fashion Store`}
          description={product.description || `${product.name} - Shop now at Fashion Store`}
          canonical={getCanonicalUrl()}
          ogImage={product.image || (product.images && product.images[0])}
          ogType="product"
        />
      )}
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-rose-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-rose-600">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              <div className="relative mb-4">
                <img
                  src={displayImage || (product.images && product.images[selectedImage] ? product.images[selectedImage] : product.image)}
                  alt={product.name}
                  className="w-full object-contain rounded-lg"
                  onError={(e) => {
                    // 如果当前图片加载失败，回退到默认图片
                    if (displayImage && displayImage !== product.image) {
                      setDisplayImage(product.image || (product.images && product.images[0]));
                    }
                  }}
                />
                {/* 图片缩略图 - 显示所有图片，包括颜色图片 */}
                {(product.images && product.images.length > 1) || (product.colors && product.colors.some(c => c.image)) ? (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {/* 显示主图片列表 */}
                    {product.images && product.images.map((img, index) => {
                      const isCurrentImage = displayImage === img || (!displayImage && selectedImage === index);
                      return (
                        <button
                          key={`main-${index}`}
                          onClick={() => {
                            setDisplayImage(img);
                            setSelectedImage(index);
                          }}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            isCurrentImage ? 'border-rose-600 ring-2 ring-rose-200' : 'border-gray-300 hover:border-rose-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {/* 促销标签 */}
                {(product.onSale === true || product.onSale === 1) && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                      SALE
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg">
                      -{discount}%
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute bottom-4 right-4 p-3 rounded-full ${
                    isFavorite ? 'bg-rose-600 text-white' : 'bg-white text-gray-400'
                  } hover:bg-rose-600 hover:text-white transition-colors`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              {Number(product.rating) > 0 && Number(product.reviews) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.rating} ({product.reviews} {product.reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > 0 && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Save {discount}%
                    </span>
                  )}
                </div>
                {(product.onSale === true || product.onSale === 1) && (
                  <div className="mt-4">
                    <CountdownTimer endDate={saleEndDate} />
                  </div>
                )}
              </div>

              {/* Color Selection - 颜色在上 */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color {selectedColor && <span className="text-gray-500">({selectedColor})</span>}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      // 可用性检查：默认所有颜色都可用
                      // 只有在选择了尺寸且该尺寸下该颜色库存明确为0时，才标记为不可用
                      let isAvailable = true;
                      if (product.stock && selectedSize && product.stock[selectedSize] && product.stock[selectedSize][color.name] !== undefined) {
                        // 只有在明确知道该尺寸下该颜色的库存为0时，才标记为不可用
                        isAvailable = (product.stock[selectedSize][color.name] || 0) > 0;
                      }
                      // 如果没有选择尺寸，或者没有库存信息，或者库存信息中没有该颜色，默认可用
                      
                      const isSelected = selectedColor === color.name;
                      const hasColorImage = color.image && color.image.trim() !== '';
                      
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // 点击颜色时跳转到对应的产品页面
                            if (color.url) {
                              window.location.href = `/product/${color.url}`;
                            }
                          }}
                          className={`relative rounded-lg border-2 transition-all overflow-hidden ${
                            isSelected
                              ? 'border-rose-600 ring-2 ring-rose-200 scale-110 cursor-pointer'
                              : isAvailable
                              ? 'border-gray-300 hover:border-rose-300 cursor-pointer'
                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                          } ${hasColorImage ? 'w-16 h-16' : 'w-12 h-12 rounded-full'}`}
                          style={!hasColorImage ? { backgroundColor: color.code } : {}}
                          title={color.name}
                        >
                          {hasColorImage ? (
                            <>
                              <img
                                src={color.image}
                                alt={color.name}
                                className="w-full h-full object-cover pointer-events-none select-none"
                                draggable="false"
                                onError={(e) => {
                                  // 如果图片加载失败，回退到颜色代码
                                  e.target.style.display = 'none';
                                  e.target.parentElement.style.backgroundColor = color.code;
                                  e.target.parentElement.classList.add('rounded-full');
                                  e.target.parentElement.classList.remove('rounded-lg');
                                }}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                  <Check className="w-6 h-6 text-white drop-shadow-lg pointer-events-none" />
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="w-full h-full pointer-events-none select-none" style={{ backgroundColor: color.code }} />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <Check className="w-6 h-6 text-white drop-shadow-lg pointer-events-none" />
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection - 尺寸在下 */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size {selectedSize && <span className="text-gray-500">({selectedSize})</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      // 简化可用性检查：如果没有库存信息，默认可用
                      // 只有在有库存信息且明确显示为0时才不可用
                      const hasStock = product.stock && product.stock[size];
                      const isAvailable = !hasStock || 
                        (selectedColor 
                          ? (product.stock[size][selectedColor] || 0) > 0
                          : product.colors && product.colors.length > 0
                            ? product.colors.some(color => 
                                product.stock[size] && (product.stock[size][color.name] || 0) > 0
                              )
                            : true);
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSize(size);
                          }}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'border-rose-600 bg-rose-50 text-rose-600 cursor-pointer'
                              : isAvailable
                              ? 'border-gray-300 hover:border-rose-300 text-gray-700 cursor-pointer'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Countdown Timer */}
              {countdownTimer && countdownTimer.end_date && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔥</span>
                      <span className="text-lg font-bold text-red-600">
                        {countdownTimer.title || 'Lowest Price! Black Friday ends in:'}
                      </span>
                    </div>
                    <CountdownTimer endDate={countdownTimer.end_date} />
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {/* 显示库存信息 */}
                  {selectedSize && selectedColor && product.stock && product.stock[selectedSize] && (
                    <span className="text-sm text-gray-600">
                      {product.stock[selectedSize][selectedColor] > 0
                        ? `${product.stock[selectedSize][selectedColor]} in stock`
                        : 'Out of stock'}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                    (product.colors && product.colors.length > 0 && !selectedColor) ||
                    (selectedSize && selectedColor && product.stock && product.stock[selectedSize] && 
                     product.stock[selectedSize][selectedColor] === 0)
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white py-4 rounded-lg hover:bg-rose-700 transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {(selectedSize && selectedColor && product.stock && product.stock[selectedSize] && 
                    product.stock[selectedSize][selectedColor] === 0)
                    ? 'Out of Stock'
                    : 'Add to Cart'}
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-4 rounded-lg border-2 ${
                    isFavorite
                      ? 'border-rose-600 bg-rose-50 text-rose-600'
                      : 'border-gray-300 hover:border-rose-600'
                  } transition-colors`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Social Share */}
              <div className="mb-6">
                <SocialShare product={product} />
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-rose-600" />
                  <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  <span className="text-sm text-gray-600">30-day return policy</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-rose-600" />
                  <span className="text-sm text-gray-600">Secure payment</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-rose-600" />
                  <span className="text-sm text-gray-600">In stock - Ready to ship</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description and Features Section */}
          {(product.description && product.description.trim()) || (product.features && product.features.length > 0) ? (
            <div className="mb-12 space-y-8">
              {/* Description */}
              {product.description && product.description.trim() && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Description</h2>
                  <div className="mt-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Features Module */}
              {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {product.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-5 h-5 text-rose-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id || item.slug}
                    to={`/product/${getProductUrlIdentifier(item)}`}
                    className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-[3/4] object-cover object-top group-hover:scale-105 transition-transform"
                      />
                      {item.onSale && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                          SALE
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">${item.price}</span>
                        {item.originalPrice && item.originalPrice > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

