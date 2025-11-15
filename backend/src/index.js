/**
 * Fashion Store Backend API
 * Cloudflare Workers 后端服务
 */

import { initDatabase, authenticateUser, getProductConfig, getAllProductConfigs, upsertProductConfig, deleteProductConfig, getSystemConfig, setSystemConfig, recordClickStat, getClickStats, getClickStatsDetail, subscribeEmail, unsubscribeEmail, getAllEmailSubscriptions, deleteEmailSubscription, getEmailSubscriptionStats, saveContactMessage, getContactMessages } from './db.js';
import { sendSubscriptionNotification, sendContactNotification, sendEmail } from './email.js';

// 简单的内存存储（用于兼容性，如果数据库未配置则使用内存）
let products = [];

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
  
  // 支持两种 token 格式：
  // 1. admin_token（回退认证）
  // 2. token_${user.id}_${timestamp}（数据库认证）
  if (token === 'admin_token') {
    return { id: 1, username: 'admin', role: 'admin' };
  }
  
  // 验证 token_ 格式的 token
  if (token.startsWith('token_')) {
    // 解析 token 格式：token_${user.id}_${timestamp}
    const parts = token.split('_');
    if (parts.length >= 3) {
      const userId = parseInt(parts[1]);
      // 如果数据库可用，验证用户是否存在
      if (env.DB) {
        try {
          await ensureDBInitialized(env);
          const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
          if (user) {
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role || 'admin'
            };
          }
        } catch (error) {
          console.error('Error verifying token with database:', error);
        }
      }
      // 如果数据库不可用或查询失败，仍然允许访问（简化版认证）
      return { id: userId, username: 'admin', role: 'admin' };
    }
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
  // getProductConfig 已经实现了回退到"所有产品"配置的逻辑
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
  
  // 检查是否需要认证
  const user = await verifyAuth(request, env);
  // 如果已认证，返回所有配置；如果未认证，只返回启用的配置（用于产品页面应用配置）
  const publicOnly = !user;
  
  const configs = await getAllProductConfigs(env, publicOnly);
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

// 订阅邮箱
async function subscribeEmailHandler(request, env) {
  await ensureDBInitialized(env);
  
  try {
    const { email, source } = await request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const result = await subscribeEmail(env, email, source || 'website');
    
    // 如果是新订阅（不是已存在的），发送通知邮件
    if (result && (result.message === 'Subscribed successfully' || result.message === 'Resubscribed successfully')) {
      try {
        const emailResult = await sendSubscriptionNotification(env, email, source || 'website');
        if (!emailResult.success) {
          console.error('Failed to send subscription notification:', emailResult.error, emailResult.details);
        } else {
          console.log('Subscription notification sent successfully:', emailResult.id);
        }
      } catch (emailError) {
        // 邮件发送失败不影响订阅流程
        console.error('Failed to send subscription notification:', emailError);
      }
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error subscribing email:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to subscribe' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 取消订阅邮箱
async function unsubscribeEmailHandler(request, env) {
  await ensureDBInitialized(env);
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const success = await unsubscribeEmail(env, email);
    
    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to unsubscribe' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取所有邮箱订阅（需要认证）
async function getEmailSubscriptionsHandler(request, env) {
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
    status: url.searchParams.get('status') || undefined,
    source: url.searchParams.get('source') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : undefined
  };
  
  const subscriptions = await getAllEmailSubscriptions(env, filters);
  
  return new Response(JSON.stringify(subscriptions), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 删除邮箱订阅（需要认证）
async function deleteEmailSubscriptionHandler(request, env) {
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
  
  if (!id) {
    return new Response(JSON.stringify({ error: 'Invalid subscription ID' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const success = await deleteEmailSubscription(env, id);
  
  return new Response(JSON.stringify({ success }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 获取订阅统计（需要认证）
async function getEmailSubscriptionStatsHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const stats = await getEmailSubscriptionStats(env);
  
  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 提交留言
async function submitContactHandler(request, env) {
  await ensureDBInitialized(env);
  
  try {
    const contactData = await request.json();
    const { name, email, subject, message } = contactData;
    
    // 验证必填字段
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 获取客户端 IP 和 User-Agent
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                     'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    
    // 保存留言
    const result = await saveContactMessage(env, {
      name,
      email,
      subject: subject || null,
      message,
      ip_address: clientIP,
      user_agent: userAgent,
    });
    
    // 发送通知邮件给管理员
    try {
      const emailResult = await sendContactNotification(env, { name, email, subject, message });
      if (!emailResult.success) {
        console.error('Failed to send contact notification:', emailResult.error, emailResult.details);
      } else {
        console.log('Contact notification sent successfully:', emailResult.id);
      }
    } catch (emailError) {
      // 邮件发送失败不影响留言保存
      console.error('Failed to send contact notification:', emailError);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Message submitted successfully',
      id: result.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to submit message' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 获取所有留言（需要认证）
async function getContactMessagesHandler(request, env) {
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
    status: url.searchParams.get('status') || undefined,
    start_date: url.searchParams.get('start_date') || undefined,
    end_date: url.searchParams.get('end_date') || undefined,
    limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')) : undefined
  };
  
  const messages = await getContactMessages(env, filters);
  
  return new Response(JSON.stringify(messages), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// 测试邮件发送功能
async function testEmailHandler(request, env) {
  await ensureDBInitialized(env);
  
  const user = await verifyAuth(request, env);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 获取测试邮箱地址（从请求参数或使用管理员邮箱）
    const url = new URL(request.url);
    const testEmail = url.searchParams.get('to') || env.ADMIN_EMAIL || 'send.mail@saysno.com';
    
    console.log('Testing email service:', {
      service: env.EMAIL_SERVICE || 'resend',
      from: env.EMAIL_FROM || 'onboarding@resend.dev',
      to: testEmail,
      hasApiKey: !!env.EMAIL_API_KEY
    });
    
    const result = await sendEmail(env, {
      to: testEmail,
      subject: '测试邮件 - Fashion Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e11d48;">邮件服务测试</h2>
          <p>这是一封测试邮件，用于验证邮件服务配置是否正确。</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>发送时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
            <p><strong>邮件服务：</strong> ${env.EMAIL_SERVICE || 'resend'}</p>
            <p><strong>发件人：</strong> ${env.EMAIL_FROM || 'onboarding@resend.dev'}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">如果您收到这封邮件，说明邮件服务配置成功！</p>
        </div>
      `,
      text: `邮件服务测试\n\n这是一封测试邮件，用于验证邮件服务配置是否正确。\n\n发送时间：${new Date().toLocaleString('zh-CN')}\n邮件服务：${env.EMAIL_SERVICE || 'resend'}\n发件人：${env.EMAIL_FROM || 'onboarding@resend.dev'}\n\n如果您收到这封邮件，说明邮件服务配置成功！`
    });
    
    return new Response(JSON.stringify({
      success: result.success,
      message: result.success ? '测试邮件已发送' : '测试邮件发送失败',
      result: result,
      config: {
        service: env.EMAIL_SERVICE || 'resend',
        from: env.EMAIL_FROM || 'onboarding@resend.dev',
        to: testEmail,
        hasApiKey: !!env.EMAIL_API_KEY
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error testing email:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to send test email',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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
      
      // 邮箱订阅 API
      if (path.startsWith('/api/email-subscriptions')) {
        if (path === '/api/email-subscriptions' && request.method === 'POST') {
          return subscribeEmailHandler(request, env);
        } else if (path === '/api/email-subscriptions' && request.method === 'GET') {
          return getEmailSubscriptionsHandler(request, env);
        } else if (path === '/api/email-subscriptions/stats' && request.method === 'GET') {
          return getEmailSubscriptionStatsHandler(request, env);
        } else if (path.startsWith('/api/email-subscriptions/') && request.method === 'DELETE') {
          return deleteEmailSubscriptionHandler(request, env);
        }
      }
      
      // 取消订阅 API（公开端点）
      if (path === '/api/email-subscriptions/unsubscribe' && request.method === 'POST') {
        return unsubscribeEmailHandler(request, env);
      }
      
      // 留言 API
      if (path.startsWith('/api/contact')) {
        if (path === '/api/contact' && request.method === 'POST') {
          return submitContactHandler(request, env);
        } else if (path === '/api/contact' && request.method === 'GET') {
          return getContactMessagesHandler(request, env);
        }
      }
      
      // 测试邮件 API（需要认证）
      if (path === '/api/test-email' && request.method === 'GET') {
        return testEmailHandler(request, env);
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
