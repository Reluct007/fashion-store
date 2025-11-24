// API 配置和工具函数

const API_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

// 导入slug工具函数
import { generateSlug, findProductByIdentifier } from './slug';

// 静态产品数据缓存
let staticProductsCache = null;
let staticProductsLoading = false;

/**
 * 加载静态产品数据（懒加载）
 */
async function loadStaticProducts() {
  if (staticProductsCache !== null) {
    return staticProductsCache;
  }
  
  if (staticProductsLoading) {
    // 如果正在加载，等待
    while (staticProductsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return staticProductsCache || [];
  }
  
  staticProductsLoading = true;
  try {
    // 动态导入静态产品数据
    const productModule = await import('../../data/product.js');
    staticProductsCache = productModule.product || [];
  } catch (error) {
    console.warn('Failed to load static product data:', error);
    staticProductsCache = [];
  } finally {
    staticProductsLoading = false;
  }
  
  return staticProductsCache;
}

// Slug映射缓存（用于处理重复标题）
let slugMapCache = null;

/**
 * 重置slug映射缓存（在需要重新生成时调用）
 */
function resetSlugMapCache() {
  slugMapCache = null;
}

/**
 * 将静态产品数据转换为 API 格式
 */
function normalizeProduct(product, index, slugMap = null) {
  // 处理不同的数据格式（支持originalprice/sellingprice和originalPrice/price）
  const title = product.title || product.name || 'Product';
  
  // 优先使用 sellingprice，然后是 price，确保转换为数字
  // 注意：sellingprice 优先，即使 price 存在也要优先使用 sellingprice
  let price = 0;
  // 明确检查 sellingprice 字段（小写）
  if (product.sellingprice !== undefined && product.sellingprice !== null && product.sellingprice !== '') {
    const sellingPriceNum = Number(product.sellingprice);
    if (!isNaN(sellingPriceNum) && sellingPriceNum >= 0) {
      price = sellingPriceNum;
    }
  } 
  // 只有在 sellingprice 不存在或无效时才使用 price
  else if (product.price !== undefined && product.price !== null && product.price !== '' && price === 0) {
    const priceNum = Number(product.price);
    if (!isNaN(priceNum) && priceNum >= 0) {
      price = priceNum;
    }
  }
  
  // 处理 originalPrice：如果 originalprice 为 0 或空字符串，则返回 null
  // 明确检查 originalprice 字段（小写）
  const originalPriceValue = product.originalprice !== undefined ? product.originalprice : (product.originalPrice !== undefined ? product.originalPrice : null);
  const originalPrice = (originalPriceValue !== null && originalPriceValue !== undefined && originalPriceValue !== '' && originalPriceValue !== '0' && Number(originalPriceValue) > 0) 
    ? Number(originalPriceValue) 
    : null;
  
  // 处理sizes和colors（可能是字符串格式的JSON）
  let sizes = product.sizes || [];
  let colors = product.colors || [];
  
  if (typeof product.size === 'string') {
    try {
      sizes = JSON.parse(product.size);
    } catch (e) {
      console.warn('Failed to parse size:', e);
    }
  }
  
  if (typeof product.color === 'string') {
    try {
      colors = JSON.parse(product.color);
      // 处理每个颜色的 productImages 字段
      // 如果是字符串（用 | 分隔的 URL），转换为数组
      if (Array.isArray(colors)) {
        colors = colors.map(color => {
          if (color.productImages && typeof color.productImages === 'string') {
            // 将 | 分隔的字符串转换为数组
            const images = color.productImages.split('|').map(url => url.trim()).filter(url => url);
            console.log(`🔧 解析颜色 ${color.name} 的 productImages:`, images.length, '张图片');
            color.productImages = images;
          }
          return color;
        });
      }
    } catch (e) {
      console.warn('Failed to parse color:', e);
    }
  }
  
  // 从静态数据格式转换为前端使用的格式
  // 注意：slug会在mergeProducts函数中统一生成和处理，这里先不设置
  return {
    id: `static_${index}`, // 静态产品使用特殊 ID 前缀（保留用于向后兼容）
    slug: '', // 将在mergeProducts中设置
    name: title,
    title: title,
    description: product.description || '',
    price: price,
    originalPrice: originalPrice,
    image: product.image || '',
    images: product.images || [],
    category: product.category || 'Uncategorized',
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    onSale: product.onSale || (originalPrice && price && originalPrice > price),
    features: product.features || [],
    // 尺码、颜色和库存信息
    sizes: sizes,
    colors: colors,
    stock: product.stock || {},
    // 保留原始静态数据
    _isStatic: true,
    _staticData: product
  };
}

/**
 * 合并静态产品和 API 产品数据（静态数据优先）
 */
function mergeProducts(staticProductsList, apiProducts) {
  const merged = [];
  const apiProductMap = new Map();
  const slugMap = new Map(); // 用于跟踪所有已使用的slug
  
  // 将 API 产品转换为 Map（使用 title/name 作为键）
  apiProducts.forEach(product => {
    const key = (product.title || product.name || '').toLowerCase().trim();
    if (key) {
      apiProductMap.set(key, product);
    }
    
    // 如果API产品有slug，也添加到slugMap
    if (product.slug) {
      slugMap.set(product.slug, product);
    }
  });
  
  // 先添加静态产品（优先级更高）
  staticProductsList.forEach((product, index) => {
    const title = product.title || product.name || '';
    
    // 生成基础slug
    let baseSlug = '';
    if (title && title.trim()) {
      baseSlug = generateSlug(title);
    }
    
    // 如果slug为空，使用索引作为后备
    if (!baseSlug || baseSlug.trim() === '') {
      baseSlug = `product-${index}`;
    }
    
    // 确保slug唯一性（检查是否与已存在的slug冲突）
    let finalSlug = baseSlug;
    let slugCounter = 0;
    while (slugMap.has(finalSlug)) {
      slugCounter++;
      // 如果冲突，添加数字后缀
      finalSlug = `${baseSlug}-${slugCounter}`;
    }
    
    // 创建标准化产品对象
    const normalized = normalizeProduct(product, index, null);
    normalized.slug = finalSlug; // 使用最终确定的slug
    slugMap.set(finalSlug, normalized);
    
    // 调试：确保价格没有被反转
    if (normalized.price === 0 && normalized.originalPrice && normalized.originalPrice > 0) {
      console.warn(`Warning: Product "${normalized.name}" has price=0 but originalPrice=${normalized.originalPrice}. This might indicate data is reversed.`);
      // 如果价格是0但原价存在，可能是数据被反转了，尝试修复
      if (normalized.originalPrice > 0) {
        const tempPrice = normalized.price;
        normalized.price = normalized.originalPrice;
        normalized.originalPrice = tempPrice > 0 ? tempPrice : null;
      }
    }
    
    merged.push(normalized);
    
    // 如果 API 中有同名产品，移除它（静态数据优先）
    if (title && title.trim()) {
      const key = title.toLowerCase().trim();
      if (key) {
        apiProductMap.delete(key);
      }
    }
  });
  
  // 添加剩余的 API 产品，为它们生成slug（如果还没有）
  apiProductMap.forEach((product) => {
    if (!product.slug) {
      const title = product.title || product.name || '';
      let baseSlug = '';
      
      if (title && title.trim()) {
        baseSlug = generateSlug(title);
      }
      
      // 如果slug为空，使用索引作为后备
      if (!baseSlug || baseSlug.trim() === '') {
        baseSlug = `product-${merged.length}`;
      }
      
      // 确保slug唯一
      let finalSlug = baseSlug;
      let slugCounter = 0;
      while (slugMap.has(finalSlug)) {
        slugCounter++;
        finalSlug = `${baseSlug}-${slugCounter}`;
      }
      
      product.slug = finalSlug;
      slugMap.set(finalSlug, product);
    }
    merged.push(product);
  });
  
  return merged;
}

/**
 * 获取所有产品（合并静态和 API 数据）
 */
export async function getProducts(category = null) {
  // 加载静态产品数据
  const staticProducts = await loadStaticProducts();
  
  let apiProducts = [];
  
  try {
    const url = category 
      ? `${API_URL}/api/products?category=${category}`
      : `${API_URL}/api/products`;
    
    const response = await fetch(url);
    if (response.ok) {
      apiProducts = await response.json();
    }
  } catch (error) {
    console.warn('Failed to fetch products from API:', error);
  }
  
  // 合并静态产品和 API 产品
  const mergedProducts = mergeProducts(staticProducts, apiProducts);
  
  // 为没有配置的产品应用"所有产品"配置
  // 这包括静态产品和没有特定配置的 API 产品
  // 注意：后端 API 已经为 API 产品应用了配置（包括"所有产品"配置的回退）
  // 这里主要是为静态产品加载"所有产品"配置
  try {
    // 尝试获取配置（即使没有认证 token，后端可能也允许访问）
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    headers['Content-Type'] = 'application/json';
    
    const configsResponse = await fetch(`${API_URL}/api/product-configs`, {
      headers: headers,
    });
    if (configsResponse.ok) {
      const allConfigs = await configsResponse.json();
      // 查找"所有产品"配置（product_id = -999）
      const allProductsConfig = allConfigs.find(
        config => config.product_id === -999 && 
                 config.button_type === 'add_to_cart' && 
                 (config.is_enabled === 1 || config.is_enabled === true)
      );
      
      if (allProductsConfig) {
        // 为没有配置的产品应用"所有产品"配置
        // 主要是静态产品，因为 API 产品的配置已经在后端处理
        mergedProducts.forEach(product => {
          if (!product.buttonConfig) {
            product.buttonConfig = allProductsConfig;
          }
        });
      }
    }
  } catch (error) {
    // 静默失败，不影响产品加载
    console.warn('Failed to load all products config:', error);
  }
  
  // 如果指定了分类，进行筛选
  if (category) {
    return mergedProducts.filter(p => 
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  return mergedProducts;
}

/**
 * 获取单个产品（优先从静态数据查找，然后从 API）
 * 支持通过slug或id查找（向后兼容）
 */
export async function getProduct(identifier) {
  // 加载所有产品（包括静态和API）
  const allProducts = await getProducts();
  
  // 使用slug工具函数查找产品
  const product = findProductByIdentifier(allProducts, identifier);
  
  if (product) {
    // 为静态产品加载"所有产品"配置
    if (product._isStatic) {
      try {
        // 尝试获取配置（即使没有认证 token）
        const headers = {};
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        headers['Content-Type'] = 'application/json';
        
        const configsResponse = await fetch(`${API_URL}/api/product-configs`, {
          headers: headers,
        });
        if (configsResponse.ok) {
          const allConfigs = await configsResponse.json();
          const allProductsConfig = allConfigs.find(
            config => config.product_id === -999 && 
                     config.button_type === 'add_to_cart' && 
                     (config.is_enabled === 1 || config.is_enabled === true)
          );
          if (allProductsConfig) {
            product.buttonConfig = allProductsConfig;
          }
        }
      } catch (error) {
        console.warn('Failed to load product config for static product:', error);
      }
    }
    
    return product;
  }
  
  // 如果还是找不到，尝试从 API 获取（向后兼容）
  try {
    const response = await fetch(`${API_URL}/api/products/${identifier}`);
    if (response.ok) {
      const product = await response.json();
      
      // 如果API产品没有slug，生成一个
      if (!product.slug) {
        const title = product.title || product.name || 'Product';
        product.slug = generateSlug(title) || `product-${Date.now()}`;
      }
      
      return product;
    }
  } catch (error) {
    console.warn('Failed to fetch product from API:', error);
  }
  
  throw new Error('Product not found');
}

/**
 * 创建产品
 */
export async function createProduct(product) {
  const response = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
}

/**
 * 更新产品
 */
export async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
}

/**
 * 删除产品
 */
export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
  return response.json();
}

/**
 * 获取所有订单
 */
export async function getOrders() {
  const response = await fetch(`${API_URL}/api/orders`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

/**
 * 创建订单
 */
export async function createOrder(order) {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  return response.json();
}

/**
 * 健康检查
 */
export async function healthCheck() {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  return response.json();
}

/**
 * 获取认证 token
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * 获取认证 headers
 */
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

/**
 * 用户登录
 */
export async function login(username, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}

/**
 * 获取所有产品配置
 */
export async function getProductConfigs() {
  const response = await fetch(`${API_URL}/api/product-configs`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch product configs');
  }
  return response.json();
}

/**
 * 创建或更新产品配置
 */
export async function upsertProductConfig(config) {
  const response = await fetch(`${API_URL}/api/product-configs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save product config');
  }
  return response.json();
}

/**
 * 删除产品配置
 */
export async function deleteProductConfig(id) {
  const response = await fetch(`${API_URL}/api/product-configs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete product config');
  }
  return response.json();
}

/**
 * 获取系统配置
 */
export async function getSystemConfigs() {
  const response = await fetch(`${API_URL}/api/system-configs`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch system configs');
  }
  return response.json();
}

/**
 * 设置系统配置
 */
export async function setSystemConfig(key, value, type = 'string', description = null) {
  const response = await fetch(`${API_URL}/api/system-configs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ key, value, type, description }),
  });
  if (!response.ok) {
    throw new Error('Failed to set system config');
  }
  return response.json();
}

/**
 * 记录点击统计
 */
export async function recordClickStat(statData) {
  const response = await fetch(`${API_URL}/api/click-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to record click stat');
  }
  return response.json();
}

/**
 * 获取点击统计
 */
export async function getClickStats(filters = {}) {
  const params = new URLSearchParams();
  if (filters.target_url) params.append('target_url', filters.target_url);
  if (filters.page_type) params.append('page_type', filters.page_type);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await fetch(`${API_URL}/api/click-stats?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch click stats');
  }
  return response.json();
}

/**
 * 获取详细点击记录
 */
export async function getClickStatsDetail(filters = {}) {
  const params = new URLSearchParams();
  if (filters.target_url) params.append('target_url', filters.target_url);
  if (filters.page_type) params.append('page_type', filters.page_type);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await fetch(`${API_URL}/api/click-stats/detail?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch click stats detail');
  }
  return response.json();
}

/**
 * 订阅邮箱
 */
export async function subscribeEmail(email, source = 'website') {
  const response = await fetch(`${API_URL}/api/email-subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, source }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to subscribe');
  }
  return response.json();
}

/**
 * 取消订阅邮箱
 */
export async function unsubscribeEmail(email) {
  const response = await fetch(`${API_URL}/api/email-subscriptions/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to unsubscribe');
  }
  return response.json();
}

/**
 * 获取所有邮箱订阅（需要认证）
 */
export async function getEmailSubscriptions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.source) params.append('source', filters.source);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await fetch(`${API_URL}/api/email-subscriptions?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch email subscriptions');
  }
  return response.json();
}

/**
 * 删除邮箱订阅（需要认证）
 */
export async function deleteEmailSubscription(id) {
  const response = await fetch(`${API_URL}/api/email-subscriptions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete email subscription');
  }
  return response.json();
}

/**
 * 获取订阅统计（需要认证）
 */
export async function getEmailSubscriptionStats() {
  const response = await fetch(`${API_URL}/api/email-subscriptions/stats`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch email subscription stats');
  }
  return response.json();
}

/**
 * 提交留言
 */
export async function submitContactMessage(contactData) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit message');
  }
  return response.json();
}

/**
 * 获取活跃用户数（基于点击统计中的唯一 IP 地址，需要认证）
 */
export async function getActiveUsersCount() {
  try {
    // 获取最近30天的点击统计详情，用于计算唯一用户数
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    const response = await fetch(`${API_URL}/api/click-stats/detail?start_date=${startDate}&limit=10000`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      // 如果 API 不可用，返回 0
      return 0;
    }
    
    const stats = await response.json();
    
    // 计算唯一 IP 地址数量
    if (Array.isArray(stats) && stats.length > 0) {
      const uniqueIPs = new Set();
      stats.forEach(stat => {
        if (stat.ip_address) {
          uniqueIPs.add(stat.ip_address);
        }
      });
      return uniqueIPs.size;
    }
    
    return 0;
  } catch (error) {
    console.warn('Failed to fetch active users count:', error);
    return 0;
  }
}

