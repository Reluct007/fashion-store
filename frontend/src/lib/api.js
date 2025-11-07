// API 配置和工具函数

import { getAllStaticProducts, formatStaticProductForAPI } from '../data/products';

const API_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

/**
 * 合并静态产品和API产品
 * 静态产品优先，如果ID或slug相同，使用静态产品
 */
function mergeProducts(staticProducts, apiProducts) {
  const merged = [...staticProducts];
  const staticIds = new Set(staticProducts.map(p => String(p.id)));
  const staticSlugs = new Set(staticProducts.map(p => p.slug).filter(Boolean));
  
  // 添加API产品（排除已存在的）
  apiProducts.forEach(apiProduct => {
    const apiId = String(apiProduct.id);
    const apiSlug = apiProduct.slug;
    
    if (!staticIds.has(apiId) && (!apiSlug || !staticSlugs.has(apiSlug))) {
      merged.push(apiProduct);
    }
  });
  
  return merged;
}

/**
 * 获取所有产品
 * 优先使用静态产品，然后合并API产品
 */
export async function getProducts(category = null) {
  try {
    // 获取静态产品
    const staticProducts = getAllStaticProducts()
      .map(formatStaticProductForAPI)
      .filter(p => p.status === 'active' || p.status === undefined);
    
    // 尝试从API获取产品
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
      console.warn('Failed to fetch products from API, using static products only:', error);
    }
    
    // 合并产品
    let mergedProducts = mergeProducts(staticProducts, apiProducts);
    
    // 如果指定了分类，进行过滤
    if (category) {
      mergedProducts = mergedProducts.filter(p => p.category === category);
    }
    
    return mergedProducts;
  } catch (error) {
    console.error('Error getting products:', error);
    // 如果出错，至少返回静态产品
    const staticProducts = getAllStaticProducts()
      .map(formatStaticProductForAPI)
      .filter(p => (!category || p.category === category) && (p.status === 'active' || p.status === undefined));
    return staticProducts;
  }
}

/**
 * 获取单个产品
 * 优先从静态产品中查找，如果没有则从API获取
 */
export async function getProduct(id) {
  // 先尝试从静态产品中查找
  const staticProducts = getAllStaticProducts();
  const staticProduct = staticProducts.find(p => 
    p.id === id || p.id === String(id) || p.slug === id
  );
  
  if (staticProduct) {
    return formatStaticProductForAPI(staticProduct);
  }
  
  // 如果静态产品中没有，从API获取
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
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create product');
  }
  return response.json();
}

/**
 * 批量上传产品
 */
export async function bulkUploadProducts(products) {
  const response = await fetch(`${API_URL}/api/products/bulk-upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ products }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to bulk upload products');
  }
  return response.json();
}

/**
 * 更新产品
 */
export async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update product');
  }
  return response.json();
}

/**
 * 删除产品
 */
export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete product');
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

