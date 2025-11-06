/**
 * Fashion Store Backend API
 * Cloudflare Workers 后端服务
 */

// 简单的内存存储（生产环境应该使用 Cloudflare D1 数据库）
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

// 获取产品列表
async function getProducts(request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }
  
  return new Response(JSON.stringify(filteredProducts), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 获取单个产品
async function getProduct(request) {
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

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      // 产品 API
      if (path.startsWith('/api/products')) {
        if (request.method === 'GET') {
          if (path === '/api/products') {
            return getProducts(request);
          } else {
            return getProduct(request);
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

