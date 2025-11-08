import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Star, Minus, Plus, 
  Truck, RotateCcw, Shield, Check 
} from 'lucide-react';
import { getProduct, getProducts, recordClickStat } from '../lib/api';
import CountdownTimer from '../components/common/CountdownTimer';
import SocialShare from '../components/common/SocialShare';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [buttonConfig, setButtonConfig] = useState(null);
  // 尺码和颜色选择
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // 促销结束时间（示例：24小时后）
  const saleEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProduct(id);
      setProduct(productData);
      
      // 初始化默认选择的尺码和颜色
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0].name);
        // 如果第一个颜色有图片，更新主图片
        if (productData.colors[0].image) {
          const imageIndex = productData.images?.findIndex(img => img === productData.colors[0].image);
          if (imageIndex >= 0) {
            setSelectedImage(imageIndex);
          }
        }
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
      alert('Please select a size');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    // 检查库存
    if (selectedSize && selectedColor && product.stock && product.stock[selectedSize]) {
      const stockCount = product.stock[selectedSize][selectedColor] || 0;
      if (stockCount < quantity) {
        alert(`Only ${stockCount} items available in stock`);
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
      
      window.open(buttonConfig.target_url, buttonConfig.target_url.startsWith('http') ? '_blank' : '_self');
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
        alert('Product added successfully!');
      }).catch(() => {
        alert('Failed to add product');
      });
      return;
    }
    
    // 默认行为：添加到购物车
    const variantInfo = [];
    if (selectedSize) variantInfo.push(`Size: ${selectedSize}`);
    if (selectedColor) variantInfo.push(`Color: ${selectedColor}`);
    const variantText = variantInfo.length > 0 ? ` (${variantInfo.join(', ')})` : '';
    alert(`Added ${quantity} x ${product.name}${variantText} to cart!`);
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

  return (
    <div className="min-h-screen flex flex-col">
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
                  src={product.images && product.images[selectedImage] ? product.images[selectedImage] : product.image}
                  alt={product.name}
                  className="w-full h-[500px] object-cover rounded-lg"
                />
                {/* 图片缩略图 */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index ? 'border-rose-600 ring-2 ring-rose-200' : 'border-gray-300 hover:border-rose-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* 促销标签 */}
                {product.onSale && (
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
                  {product.rating || 0} ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
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
                {product.onSale && (
                  <div className="mt-4">
                    <CountdownTimer endDate={saleEndDate} />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {product.description || 'Premium quality product with exceptional design and craftsmanship.'}
              </p>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size {selectedSize && <span className="text-gray-500">({selectedSize})</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      // 如果已选择颜色，检查该尺码和颜色的库存
                      const isAvailable = selectedColor && product.stock && product.stock[size]
                        ? (product.stock[size][selectedColor] || 0) > 0
                        : product.colors && product.colors.length > 0
                        ? product.colors.some(color => 
                            product.stock && product.stock[size] && (product.stock[size][color.name] || 0) > 0
                          )
                        : true;
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'border-rose-600 bg-rose-50 text-rose-600'
                              : isAvailable
                              ? 'border-gray-300 hover:border-rose-300 text-gray-700'
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

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color {selectedColor && <span className="text-gray-500">({selectedColor})</span>}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      // 如果已选择尺码，检查该尺码和颜色的库存
                      const isAvailable = selectedSize && product.stock && product.stock[selectedSize]
                        ? (product.stock[selectedSize][color.name] || 0) > 0
                        : product.sizes && product.sizes.length > 0
                        ? product.sizes.some(size => 
                            product.stock && product.stock[size] && (product.stock[size][color.name] || 0) > 0
                          )
                        : true;
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          onClick={() => {
                            setSelectedColor(color.name);
                            // 如果选择了颜色，更新主图片
                            if (color.image) {
                              const imageIndex = product.images?.findIndex(img => img === color.image);
                              if (imageIndex >= 0) {
                                setSelectedImage(imageIndex);
                              }
                            }
                          }}
                          disabled={!isAvailable}
                          className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-rose-600 ring-2 ring-rose-200 scale-110'
                              : isAvailable
                              ? 'border-gray-300 hover:border-rose-300'
                              : 'border-gray-200 opacity-50 cursor-not-allowed'
                          }`}
                          style={{ backgroundColor: color.code }}
                          title={color.name}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-6 h-6 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </button>
                      );
                    })}
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

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
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
                        {item.originalPrice && (
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

