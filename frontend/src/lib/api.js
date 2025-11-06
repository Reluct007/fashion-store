// API 配置和工具函数

const API_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

/**
 * 获取所有产品
 */
export async function getProducts(category = null) {
  const url = category 
    ? `${API_URL}/api/products?category=${category}`
    : `${API_URL}/api/products`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

/**
 * 获取单个产品
 */
export async function getProduct(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
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

