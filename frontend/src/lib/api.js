// API 配置和工具函数

const API_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

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

/**
 * 将静态产品数据转换为 API 格式
 */
function normalizeProduct(product, index) {
  // 从静态数据格式转换为前端使用的格式
  return {
    id: `static_${index}`, // 静态产品使用特殊 ID 前缀
    name: product.title || product.name || 'Product',
    title: product.title || product.name || 'Product',
    description: product.description || '',
    price: product.price || 0,
    originalPrice: product.originalPrice || null,
    image: product.image || '',
    images: product.images || [],
    category: product.category || 'Uncategorized',
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    onSale: product.onSale || false,
    features: product.features || [],
    // 尺码、颜色和库存信息
    sizes: product.sizes || [],
    colors: product.colors || [],
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
  
  // 将 API 产品转换为 Map（使用 title/name 作为键）
  apiProducts.forEach(product => {
    const key = (product.title || product.name || '').toLowerCase().trim();
    if (key) {
      apiProductMap.set(key, product);
    }
  });
  
  // 先添加静态产品（优先级更高）
  staticProductsList.forEach((product, index) => {
    const normalized = normalizeProduct(product, index);
    merged.push(normalized);
    
    // 如果 API 中有同名产品，移除它（静态数据优先）
    const key = (product.title || product.name || '').toLowerCase().trim();
    if (key) {
      apiProductMap.delete(key);
    }
  });
  
  // 添加剩余的 API 产品
  apiProductMap.forEach(product => {
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
 */
export async function getProduct(id) {
  // 加载静态产品数据
  const staticProducts = await loadStaticProducts();
  
  // 如果是静态产品 ID
  if (typeof id === 'string' && id.startsWith('static_')) {
    const index = parseInt(id.replace('static_', ''));
    if (staticProducts[index]) {
      return normalizeProduct(staticProducts[index], index);
    }
  }
  
  // 尝试从静态产品中通过 title/name 匹配
  const staticMatch = staticProducts.find((p, index) => {
    const normalized = normalizeProduct(p, index);
    return normalized.id === id || normalized.name === id || normalized.title === id;
  });
  
  if (staticMatch) {
    const index = staticProducts.indexOf(staticMatch);
    return normalizeProduct(staticMatch, index);
  }
  
  // 从 API 获取
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`);
    if (response.ok) {
      return await response.json();
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

