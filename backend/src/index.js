/**
 * Fashion Store Backend API
 * Cloudflare Workers 后端服务
 */

import { 
  initDatabase, authenticateUser, getProductConfig, getAllProductConfigs, upsertProductConfig, deleteProductConfig, 
  getSystemConfig, setSystemConfig, recordClickStat, getClickStats, getClickStatsDetail,
  getAllProducts, getProductById, getProductBySlug, createProduct, updateProduct, deleteProduct, bulkCreateProducts
} from './db.js';

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

// 转换数据库产品格式到前端格式
function formatProductForFrontend(dbProduct) {
  if (!dbProduct) return null;
  
  // 解析images JSON
  let images = [];
  if (dbProduct.images) {
    try {
      images = typeof dbProduct.images === 'string' ? JSON.parse(dbProduct.images) : dbProduct.images;
    } catch {
      images = [];
    }
  }
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    title: dbProduct.title || dbProduct.name,
    description: dbProduct.description,
    metaDescription: dbProduct.meta_description,
    metaKeywords: dbProduct.meta_keywords,
    canonicalUrl: dbProduct.canonical_url,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    category: dbProduct.category,
    image: dbProduct.image,
    images: images,
    rating: dbProduct.rating,
    reviews: dbProduct.reviews,
    onSale: dbProduct.on_sale === 1,
    stock: dbProduct.stock,
    sku: dbProduct.sku,
    brand: dbProduct.brand,
    status: dbProduct.status,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at
  };
}

// 转换前端产品格式到数据库格式
function formatProductForDatabase(frontendProduct) {
  return {
    name: frontendProduct.name,
    slug: frontendProduct.slug,
    title: frontendProduct.title,
    description: frontendProduct.description,
    meta_description: frontendProduct.metaDescription,
    meta_keywords: frontendProduct.metaKeywords,
    canonical_url: frontendProduct.canonicalUrl,
    price: frontendProduct.price,
    original_price: frontendProduct.originalPrice,
    category: frontendProduct.category,
    image: frontendProduct.image,
    images: frontendProduct.images,
    rating: frontendProduct.rating,
    reviews: frontendProduct.reviews,
    on_sale: frontendProduct.onSale,
    stock: frontendProduct.stock,
    sku: frontendProduct.sku,
    brand: frontendProduct.brand,
    status: frontendProduct.status || 'active'
  };
}

// 获取产品列表
async function getProductsHandler(request, env) {
  await ensureDBInitialized(env);
  
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status') || 'active';
  
  try {
    let dbProducts;
    if (env.DB) {
      // 从数据库获取
      const filters = { status };
      if (category) filters.category = category;
      dbProducts = await getAllProducts(env, filters);
    } else {
      // 回退到内存数据
      dbProducts = products.filter(p => !status || p.status === status);
      if (category) {
        dbProducts = dbProducts.filter(p => p.category === category);
      }
    }
    
    // 转换为前端格式
    const formattedProducts = dbProducts.map(formatProductForFrontend);
    
    // 获取每个产品的按钮配置
    if (env.DB) {
      for (const product of formattedProducts) {
        if (product && product.id) {
          const config = await getProductConfig(env, product.id, 'add_to_cart');
          if (config) {
            product.buttonConfig = config;
          }
        }
      }
    }
    
    return new Response(JSON.stringify(formattedProducts), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取单个产品
async function getProductHandler(request, env) {
  await ensureDBInitialized(env);
  
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const identifier = pathParts[pathParts.length - 1];
  
  try {
    let dbProduct;
    if (env.DB) {
      // 尝试按ID或slug获取
      const id = parseInt(identifier);
      if (!isNaN(id)) {
        dbProduct = await getProductById(env, id);
      } else {
        dbProduct = await getProductBySlug(env, identifier);
      }
    } else {
      // 回退到内存数据
      const id = parseInt(identifier);
      dbProduct = products.find(p => p.id === id);
    }
    
    if (!dbProduct) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
    
    const product = formatProductForFrontend(dbProduct);
    
    // 获取按钮配置
    if (env.DB && product && product.id) {
      const config = await getProductConfig(env, product.id, 'add_to_cart');
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
  } catch (error) {
    console.error('Error getting product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 创建产品
async function createProductHandler(request, env) {
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
  
  try {
    const data = await request.json();
    const productData = formatProductForDatabase(data);
    const newProduct = await createProduct(env, productData);
    const formatted = formatProductForFrontend(newProduct);
    
    return new Response(JSON.stringify(formatted), {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 更新产品
async function updateProductHandler(request, env) {
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
  
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop());
    const data = await request.json();
    const productData = formatProductForDatabase(data);
    const updatedProduct = await updateProduct(env, id, productData);
    const formatted = formatProductForFrontend(updatedProduct);
    
    return new Response(JSON.stringify(formatted), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 删除产品
async function deleteProductHandler(request, env) {
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
  
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop());
    const success = await deleteProduct(env, id);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ message: 'Product deleted' }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 批量上传产品
async function bulkUploadProductsHandler(request, env) {
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
  
  try {
    const data = await request.json();
    const products = Array.isArray(data.products) ? data.products : [];
    
    if (products.length === 0) {
      return new Response(JSON.stringify({ error: 'No products provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 转换产品格式
    const productDataList = products.map(formatProductForDatabase);
    const result = await bulkCreateProducts(env, productDataList);
    
    // 格式化结果
    const formattedResults = {
      total: result.total,
      success: result.success,
      failed: result.failed,
      results: result.results.map(r => ({
        index: r.index,
        success: r.success,
        product: r.product ? formatProductForFrontend(r.product) : null
      })),
      errors: result.errors
    };
    
    return new Response(JSON.stringify(formattedResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error bulk uploading products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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
  
  try {
    const data = await request.json();
    const result = await upsertProductConfig(env, data);
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in upsertProductConfigHandler:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to save config' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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

// 生成 Sitemap.xml
async function generateSitemap(request, env) {
  await ensureDBInitialized(env);
  
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    let products = [];
    if (env.DB) {
      const dbProducts = await getAllProducts(env, { status: 'active' });
      products = dbProducts.map(formatProductForFrontend);
    }
    
    // 生成 sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${products.map(product => {
  const productUrl = product.slug 
    ? `${baseUrl}/product/${product.slug}`
    : `${baseUrl}/product/${product.id}`;
  const lastmod = product.updatedAt 
    ? new Date(product.updatedAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
</urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

// 生成 Robots.txt
async function generateRobotsTxt(request, env) {
  try {
    // 使用与sitemap相同的方式获取前端URL
    const referer = request.headers.get('Referer');
    const origin = request.headers.get('Origin');
    let frontendUrl = origin || referer;
    
    if (!frontendUrl) {
      frontendUrl = 'https://fashion-store.pages.dev'; // 替换为实际的前端URL
    }
    
    if (frontendUrl && !frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    
    const baseUrl = frontendUrl || 'https://fashion-store.pages.dev';
    
    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
    
    return new Response(robots, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new Response('Error generating robots.txt', { status: 500 });
  }
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
            return getProductsHandler(request, env);
          } else if (path === '/api/products/bulk-upload') {
            // 不支持GET
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
              status: 405,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            return getProductHandler(request, env);
          }
        } else if (request.method === 'POST' && path === '/api/products/bulk-upload') {
          return bulkUploadProductsHandler(request, env);
        } else if (request.method === 'POST' && path === '/api/products') {
          return createProductHandler(request, env);
        } else if (request.method === 'PUT' && path.startsWith('/api/products/')) {
          return updateProductHandler(request, env);
        } else if (request.method === 'DELETE' && path.startsWith('/api/products/')) {
          return deleteProductHandler(request, env);
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
      
      // Sitemap.xml
      if (path === '/sitemap.xml') {
        return generateSitemap(request, env);
      }
      
      // Robots.txt
      if (path === '/robots.txt') {
        return generateRobotsTxt(request, env);
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
