/**
 * Fashion Store Backend API
 * Cloudflare Workers 后端服务
 */

import { initDatabase, authenticateUser, getProductConfig, getAllProductConfigs, upsertProductConfig, deleteProductConfig, getSystemConfig, setSystemConfig, recordClickStat, getClickStats, getClickStatsDetail } from './db.js';

// 简单的内存存储（用于兼容性，如果数据库未配置则使用内存）
let products = [
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
    category: 'Tops',
    onSale: false
  }
];

let orders = [];
let dbInitialized = false;

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 CORS 预检请求
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// 验证 JWT token（简化版，实际应该使用真正的 JWT）
async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // 简化版认证（实际应该使用 JWT）
  const token = authHeader.substring(7);
  // 这里只是示例，实际应该验证 token
  if (token === 'admin_token') {
    return { id: 1, username: 'admin', role: 'admin' };
  }
  
  return null;
}

// 初始化数据库
async function ensureDBInitialized(env) {
  if (!dbInitialized && env.DB) {
    await initDatabase(env);
    dbInitialized = true;
  }
}

// 用户登录
async function login(request, env) {
  try {
    await ensureDBInitialized(env);
    
    const { username, password } = await request.json();
    
    // 如果没有数据库配置，使用内存认证作为回退
    if (!env.DB) {
      console.log('No database configured, using fallback authentication');
      if (username === 'admin' && password === 'admin123') {
        return new Response(JSON.stringify({
          success: true,
          token: 'admin_token',
          user: { id: 1, username: 'admin', role: 'admin' }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 使用数据库认证
    console.log('Attempting database authentication for:', username);
    const user = await authenticateUser(env, username, password);
    
    if (!user) {
      console.log('Authentication failed for:', username);
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Authentication successful for:', username);
    // 生成简单的 token（实际应该使用 JWT）
    const token = `token_${user.id}_${Date.now()}`;
    
    return new Response(JSON.stringify({
      success: true,
      token,
      user
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    // 如果数据库出错，回退到内存认证
    const { username, password } = await request.json();
    if (username === 'admin' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        token: 'admin_token',
        user: { id: 1, username: 'admin', role: 'admin' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Login failed: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取产品列表
async function getProducts(request, env) {
  await ensureDBInitialized(env);
  
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }
  
  // 获取每个产品的按钮配置
  if (env.DB) {
    for (const product of filteredProducts) {
      const config = await getProductConfig(env, product.id, 'add_to_cart');
      if (config) {
        product.buttonConfig = config;
      }
    }
  }
  
  return new Response(JSON.stringify(filteredProducts), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 获取单个产品
async function getProduct(request, env) {
  await ensureDBInitialized(env);
  
  const url = new URL(request.url);
  const id = parseInt(url.pathname.split('/').pop());
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
  
  // 获取按钮配置
  if (env.DB) {
    const config = await getProductConfig(env, id, 'add_to_cart');
    if (config) {
      product.buttonConfig = config;
    }
  }
  
  return new Response(JSON.stringify(product), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 创建产品
async function createProduct(request) {
  const data = await request.json();
  
  const newProduct = {
    id: products.length + 1,
    ...data,
    createdAt: new Date().toISOString(),
  };
  
  products.push(newProduct);
  
  return new Response(JSON.stringify(newProduct), {
    status: 201,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 更新产品
async function updateProduct(request) {
  const url = new URL(request.url);
  const id = parseInt(url.pathname.split('/').pop());
  const data = await request.json();
  
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
  
  products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() };
  
  return new Response(JSON.stringify(products[index]), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 删除产品
async function deleteProduct(request) {
  const url = new URL(request.url);
  const id = parseInt(url.pathname.split('/').pop());
  
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
  
  products.splice(index, 1);
  
  return new Response(JSON.stringify({ message: 'Product deleted' }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 获取产品配置列表
async function getProductConfigs(request, env) {
  await ensureDBInitialized(env);
  
  if (!env.DB) {
    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const configs = await getAllProductConfigs(env);
  return new Response(JSON.stringify(configs), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 创建或更新产品配置
async function upsertProductConfigHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const data = await request.json();
  const result = await upsertProductConfig(env, data);
  
  if (!result) {
    return new Response(JSON.stringify({ error: 'Failed to save config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 删除产品配置
async function deleteProductConfigHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const id = parseInt(url.pathname.split('/').pop());
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const success = await deleteProductConfig(env, id);
  
  return new Response(JSON.stringify({ success }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 获取系统配置
async function getSystemConfigs(request, env) {
  await ensureDBInitialized(env);
  
  if (!env.DB) {
    return new Response(JSON.stringify({}), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // 获取所有配置（简化版，实际应该查询所有）
  return new Response(JSON.stringify({}), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 设置系统配置
async function setSystemConfigHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const { key, value, type, description } = await request.json();
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const success = await setSystemConfig(env, key, value, type, description);
  
  return new Response(JSON.stringify({ success }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 创建订单
async function createOrder(request) {
  const data = await request.json();
  
  const newOrder = {
    id: orders.length + 1,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  
  return new Response(JSON.stringify(newOrder), {
    status: 201,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 获取订单列表
async function getOrders(request) {
  return new Response(JSON.stringify(orders), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 记录点击统计
async function recordClickStatHandler(request, env) {
  await ensureDBInitialized(env);
  
  try {
    const data = await request.json();
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || '';
    const referer = request.headers.get('Referer') || '';
    
    const statData = {
      target_url: data.target_url,
      page_type: data.page_type || 'unknown',
      page_id: data.page_id || null,
      page_path: data.page_path || null,
      user_agent: userAgent,
      ip_address: clientIP,
      referer: referer
    };
    
    const result = await recordClickStat(env, statData);
    
    return new Response(JSON.stringify({ success: true, id: result?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error recording click stat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取点击统计
async function getClickStatsHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const filters = {
    target_url: url.searchParams.get('target_url') || undefined,
    page_type: url.searchParams.get('page_type') || undefined,
    start_date: url.searchParams.get('start_date') || undefined,
    end_date: url.searchParams.get('end_date') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : undefined
  };
  
  const stats = await getClickStats(env, filters);
  
  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 获取详细点击记录
async function getClickStatsDetailHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const filters = {
    target_url: url.searchParams.get('target_url') || undefined,
    page_type: url.searchParams.get('page_type') || undefined,
    start_date: url.searchParams.get('start_date') || undefined,
    end_date: url.searchParams.get('end_date') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : 100
  };
  
  const stats = await getClickStatsDetail(env, filters);
  
  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      await ensureDBInitialized(env);
      
      // 认证 API
      if (path === '/api/auth/login' && request.method === 'POST') {
        return login(request, env);
      }
      
      // 产品配置 API
      if (path.startsWith('/api/product-configs')) {
        if (request.method === 'GET' && path === '/api/product-configs') {
          return getProductConfigs(request, env);
        } else if (request.method === 'POST' && path === '/api/product-configs') {
          return upsertProductConfigHandler(request, env);
        } else if (request.method === 'DELETE' && path.startsWith('/api/product-configs/')) {
          return deleteProductConfigHandler(request, env);
        }
      }
      
      // 系统配置 API
      if (path.startsWith('/api/system-configs')) {
        if (request.method === 'GET' && path === '/api/system-configs') {
          return getSystemConfigs(request, env);
        } else if (request.method === 'POST' && path === '/api/system-configs') {
          return setSystemConfigHandler(request, env);
        }
      }
      
      // 点击统计 API
      if (path.startsWith('/api/click-stats')) {
        if (path === '/api/click-stats' && request.method === 'POST') {
          return recordClickStatHandler(request, env);
        } else if (path === '/api/click-stats' && request.method === 'GET') {
          return getClickStatsHandler(request, env);
        } else if (path === '/api/click-stats/detail' && request.method === 'GET') {
          return getClickStatsDetailHandler(request, env);
        }
      }
      
      // 产品 API
      if (path.startsWith('/api/products')) {
        if (request.method === 'GET') {
          if (path === '/api/products') {
            return getProducts(request, env);
          } else {
            return getProduct(request, env);
          }
        } else if (request.method === 'POST' && path === '/api/products') {
          return createProduct(request);
        } else if (request.method === 'PUT' && path.startsWith('/api/products/')) {
          return updateProduct(request);
        } else if (request.method === 'DELETE' && path.startsWith('/api/products/')) {
          return deleteProduct(request);
        }
      }
      
      // 订单 API
      if (path.startsWith('/api/orders')) {
        if (request.method === 'GET' && path === '/api/orders') {
          return getOrders(request);
        } else if (request.method === 'POST' && path === '/api/orders') {
          return createOrder(request);
        }
      }
      
      // 健康检查
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
      
      // 404
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
