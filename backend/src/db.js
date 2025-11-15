// 数据库工具函数

/**
 * 初始化数据库
 */
export async function initDatabase(env) {
  if (!env.DB) {
    console.warn('D1 database not configured');
    return null;
  }

  try {
    // 创建表（如果不存在）
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        button_type TEXT NOT NULL,
        action_type TEXT NOT NULL,
        target_url TEXT,
        api_endpoint TEXT,
        is_enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, button_type)
      );

      CREATE TABLE IF NOT EXISTS system_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT,
        config_type TEXT DEFAULT 'string',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS email_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        source TEXT,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 检查是否有管理员用户
    const adminCheck = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind('admin').first();
    if (!adminCheck) {
      // 创建默认管理员（密码：admin123，存储为明文以便验证）
      const defaultPassword = 'admin123'; // 实际应该使用 bcrypt 加密，但为了简化这里存储明文
      await env.DB.prepare(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
      ).bind('admin', 'admin@fashionstore.com', defaultPassword, 'admin').run();
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // 插入默认系统配置
    await env.DB.prepare(
      'INSERT OR IGNORE INTO system_configs (config_key, config_value, config_type, description) VALUES (?, ?, ?, ?)'
    ).bind('site_name', 'Fashion Store', 'string', '网站名称').run();

    console.log('Database initialized successfully');
    return env.DB;
  } catch (error) {
    console.error('Database initialization error:', error);
    return null;
  }
}

/**
 * 用户认证
 */
export async function authenticateUser(env, username, password) {
  if (!env.DB) {
    console.log('No database available for authentication');
    return null;
  }

  try {
    console.log('Querying database for user:', username);
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).bind(username, username).first();

    if (!user) {
      console.log('User not found:', username);
      return null;
    }

    // 检查密码是否匹配
    // 支持两种格式：明文密码（用于测试）和 bcrypt 哈希（用于生产）
    let passwordMatch = false;
    
    if (user.password_hash === password) {
      // 明文密码匹配
      passwordMatch = true;
    } else if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
      // 如果是 bcrypt 哈希，需要验证（但 Cloudflare Workers 不支持 bcrypt）
      // 这种情况下，我们回退到明文检查或提示用户
      console.log('Password is hashed, but bcrypt verification not available in Workers');
      passwordMatch = false;
    } else {
      // 其他情况，直接比较
      passwordMatch = (user.password_hash === password);
    }
    
    console.log('User found:', user.username, 'Password match:', passwordMatch);

    if (passwordMatch) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    }

    console.log('Password mismatch for user:', username);
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * 获取产品配置
 */
export async function getProductConfig(env, productId, buttonType) {
  if (!env.DB) return null;

  try {
    // 首先尝试获取特定产品的配置
    const specificConfig = await env.DB.prepare(
      'SELECT * FROM product_configs WHERE product_id = ? AND button_type = ? AND is_enabled = 1'
    ).bind(productId, buttonType).first();
    
    if (specificConfig) {
      return specificConfig;
    }
    
    // 如果没有特定产品的配置，尝试获取所有产品的配置（product_id = -999）
    const allProductsConfig = await env.DB.prepare(
      'SELECT * FROM product_configs WHERE product_id = ? AND button_type = ? AND is_enabled = 1'
    ).bind(-999, buttonType).first();
    
    return allProductsConfig;
  } catch (error) {
    console.error('Get product config error:', error);
    return null;
  }
}

/**
 * 获取所有产品配置
 */
export async function getAllProductConfigs(env, publicOnly = false) {
  if (!env.DB) return [];

  try {
    let query = 'SELECT * FROM product_configs';
    if (publicOnly) {
      // 只返回启用的配置（公开访问时）
      query += ' WHERE is_enabled = 1';
    }
    query += ' ORDER BY product_id, button_type';
    const configs = await env.DB.prepare(query).all();
    return configs.results || [];
  } catch (error) {
    console.error('Get all product configs error:', error);
    return [];
  }
}

/**
 * 创建或更新产品配置
 */
export async function upsertProductConfig(env, config) {
  if (!env.DB) {
    throw new Error('Database not configured');
  }

  try {
    // 检查是否有 page_path、link_target 列（向后兼容）
    let hasPagePath = false;
    let hasLinkTarget = false;
    try {
      await env.DB.prepare('SELECT page_path FROM product_configs LIMIT 1').first();
      hasPagePath = true;
    } catch {
      // 如果列不存在，稍后添加
    }
    try {
      await env.DB.prepare('SELECT link_target FROM product_configs LIMIT 1').first();
      hasLinkTarget = true;
    } catch {
      // 如果列不存在，稍后添加
    }
    
    // 如果没有 page_path 列，尝试添加（SQLite 3.35.0+ 支持）
    if (!hasPagePath) {
      try {
        await env.DB.prepare('ALTER TABLE product_configs ADD COLUMN page_path TEXT').run();
        hasPagePath = true;
      } catch (e) {
        // 如果添加失败，忽略（可能是旧版本 SQLite 或不支持 ALTER TABLE）
        console.log('Could not add page_path column:', e.message);
      }
    }
    // 如果没有 link_target 列，尝试添加
    if (!hasLinkTarget) {
      try {
        await env.DB.prepare("ALTER TABLE product_configs ADD COLUMN link_target TEXT DEFAULT '_blank'").run();
        hasLinkTarget = true;
      } catch (e) {
        console.log('Could not add link_target column:', e.message);
      }
    }
    
    // 准备 SQL 和参数
    let sql, params;
    
    if (hasPagePath && hasLinkTarget) {
      sql = `INSERT INTO product_configs (product_id, button_type, action_type, target_url, link_target, api_endpoint, page_path, is_enabled)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(product_id, button_type) 
             DO UPDATE SET 
               action_type = excluded.action_type,
               target_url = excluded.target_url,
               link_target = excluded.link_target,
               api_endpoint = excluded.api_endpoint,
               page_path = excluded.page_path,
               is_enabled = excluded.is_enabled,
               updated_at = CURRENT_TIMESTAMP`;
      params = [
        config.product_id,
        config.button_type,
        config.action_type,
        config.target_url || null,
        config.link_target || '_blank',
        config.api_endpoint || null,
        config.page_path || null,
        config.is_enabled !== undefined ? (config.is_enabled ? 1 : 0) : 1
      ];
    } else if (hasPagePath && !hasLinkTarget) {
      sql = `INSERT INTO product_configs (product_id, button_type, action_type, target_url, api_endpoint, page_path, is_enabled)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(product_id, button_type) 
             DO UPDATE SET 
               action_type = excluded.action_type,
               target_url = excluded.target_url,
               api_endpoint = excluded.api_endpoint,
               page_path = excluded.page_path,
               is_enabled = excluded.is_enabled,
               updated_at = CURRENT_TIMESTAMP`;
      params = [
        config.product_id,
        config.button_type,
        config.action_type,
        config.target_url || null,
        config.api_endpoint || null,
        config.page_path || null,
        config.is_enabled !== undefined ? (config.is_enabled ? 1 : 0) : 1
      ];
    } else {
      sql = `INSERT INTO product_configs (product_id, button_type, action_type, target_url, api_endpoint, is_enabled)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(product_id, button_type) 
             DO UPDATE SET 
               action_type = excluded.action_type,
               target_url = excluded.target_url,
               api_endpoint = excluded.api_endpoint,
               is_enabled = excluded.is_enabled,
               updated_at = CURRENT_TIMESTAMP`;
      params = [
        config.product_id,
        config.button_type,
        config.action_type,
        config.target_url || null,
        config.api_endpoint || null,
        config.is_enabled !== undefined ? (config.is_enabled ? 1 : 0) : 1
      ];
    }
    
    const result = await env.DB.prepare(sql).bind(...params).run();

    // 返回配置对象（包含 ID）
    if (result.meta && result.meta.last_row_id) {
      // 如果是新插入的记录，获取完整记录
      const inserted = await env.DB.prepare(
        'SELECT * FROM product_configs WHERE id = ?'
      ).bind(result.meta.last_row_id).first();
      return inserted;
    } else {
      // 如果是更新，获取更新后的记录
      const updated = await env.DB.prepare(
        'SELECT * FROM product_configs WHERE product_id = ? AND button_type = ?'
      ).bind(config.product_id, config.button_type).first();
      return updated;
    }
  } catch (error) {
    console.error('Upsert product config error:', error);
    throw error; // 抛出错误而不是返回 null
  }
}

/**
 * 删除产品配置
 */
export async function deleteProductConfig(env, id) {
  if (!env.DB) return false;

  try {
    await env.DB.prepare('DELETE FROM product_configs WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Delete product config error:', error);
    return false;
  }
}

/**
 * 获取系统配置
 */
export async function getSystemConfig(env, key) {
  if (!env.DB) return null;

  try {
    const config = await env.DB.prepare('SELECT * FROM system_configs WHERE config_key = ?').bind(key).first();
    return config ? config.config_value : null;
  } catch (error) {
    console.error('Get system config error:', error);
    return null;
  }
}

/**
 * 设置系统配置
 */
export async function setSystemConfig(env, key, value, type = 'string', description = null) {
  if (!env.DB) return false;

  try {
    await env.DB.prepare(
      `INSERT INTO system_configs (config_key, config_value, config_type, description)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(config_key) 
       DO UPDATE SET 
         config_value = excluded.config_value,
         config_type = excluded.config_type,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(key, value, type, description).run();
    return true;
  } catch (error) {
    console.error('Set system config error:', error);
    return false;
  }
}

/**
 * 记录点击统计
 */
export async function recordClickStat(env, statData) {
  if (!env.DB) return null;
  try {
    // 确保 click_stats 表存在
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS click_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_url TEXT NOT NULL,
        page_type TEXT NOT NULL,
        page_id INTEGER,
        page_path TEXT,
        click_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        ip_address TEXT,
        referer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // 创建索引（如果不存在）
    try {
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_click_stats_url ON click_stats(target_url)').run();
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_click_stats_page ON click_stats(page_type, page_id)').run();
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_click_stats_time ON click_stats(click_time)').run();
    } catch {
      // 索引可能已存在，忽略错误
    }
    
    const { lastInsertRowid } = await env.DB.prepare(
      `INSERT INTO click_stats (target_url, page_type, page_id, page_path, user_agent, ip_address, referer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      statData.target_url,
      statData.page_type,
      statData.page_id || null,
      statData.page_path || null,
      statData.user_agent || null,
      statData.ip_address || null,
      statData.referer || null
    ).run();
    
    return { id: lastInsertRowid };
  } catch (error) {
    console.error('Error recording click stat:', error);
    return null;
  }
}

/**
 * 获取点击统计（按 URL 分组）
 */
export async function getClickStats(env, filters = {}) {
  if (!env.DB) return [];
  try {
    let query = `
      SELECT 
        target_url,
        page_type,
        page_id,
        page_path,
        COUNT(*) as click_count,
        MIN(click_time) as first_click,
        MAX(click_time) as last_click
      FROM click_stats
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.target_url) {
      query += ' AND target_url = ?';
      params.push(filters.target_url);
    }
    
    if (filters.page_type) {
      query += ' AND page_type = ?';
      params.push(filters.page_type);
    }
    
    if (filters.start_date) {
      query += ' AND click_time >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      query += ' AND click_time <= ?';
      params.push(filters.end_date);
    }
    
    query += ' GROUP BY target_url, page_type, page_id, page_path ORDER BY click_count DESC, last_click DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return results || [];
  } catch (error) {
    console.error('Error getting click stats:', error);
    return [];
  }
}

/**
 * 获取详细的点击记录
 */
export async function getClickStatsDetail(env, filters = {}) {
  if (!env.DB) return [];
  try {
    let query = 'SELECT * FROM click_stats WHERE 1=1';
    const params = [];
    
    if (filters.target_url) {
      query += ' AND target_url = ?';
      params.push(filters.target_url);
    }
    
    if (filters.page_type) {
      query += ' AND page_type = ?';
      params.push(filters.page_type);
    }
    
    if (filters.start_date) {
      query += ' AND click_time >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      query += ' AND click_time <= ?';
      params.push(filters.end_date);
    }
    
    query += ' ORDER BY click_time DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return results || [];
  } catch (error) {
    console.error('Error getting click stats detail:', error);
    return [];
  }
}

/**
 * 订阅邮箱
 */
export async function subscribeEmail(env, email, source = null) {
  if (!env.DB) return null;
  
  try {
    // 确保表存在
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS email_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        source TEXT,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // 检查邮箱是否已存在
    const existing = await env.DB.prepare('SELECT * FROM email_subscriptions WHERE email = ?').bind(email).first();
    
    if (existing) {
      // 如果已存在且是取消订阅状态，重新激活
      if (existing.status === 'unsubscribed') {
        await env.DB.prepare(
          'UPDATE email_subscriptions SET status = ?, subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE email = ?'
        ).bind('active', email).run();
        return { id: existing.id, email, status: 'active', message: 'Resubscribed successfully' };
      }
      return { id: existing.id, email, status: existing.status, message: 'Already subscribed' };
    }
    
    // 插入新订阅
    const result = await env.DB.prepare(
      'INSERT INTO email_subscriptions (email, status, source) VALUES (?, ?, ?)'
    ).bind(email, 'active', source).run();
    
    return { id: result.meta.last_row_id, email, status: 'active', message: 'Subscribed successfully' };
  } catch (error) {
    console.error('Error subscribing email:', error);
    throw error;
  }
}

/**
 * 取消订阅邮箱
 */
export async function unsubscribeEmail(env, email) {
  if (!env.DB) return false;
  
  try {
    await env.DB.prepare(
      'UPDATE email_subscriptions SET status = ?, unsubscribed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = ?'
    ).bind('unsubscribed', email).run();
    return true;
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return false;
  }
}

/**
 * 获取所有邮箱订阅
 */
export async function getAllEmailSubscriptions(env, filters = {}) {
  if (!env.DB) return [];
  
  try {
    let query = 'SELECT * FROM email_subscriptions WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.source) {
      query += ' AND source = ?';
      params.push(filters.source);
    }
    
    query += ' ORDER BY subscribed_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return results || [];
  } catch (error) {
    console.error('Error getting email subscriptions:', error);
    return [];
  }
}

/**
 * 删除邮箱订阅
 */
export async function deleteEmailSubscription(env, id) {
  if (!env.DB) return false;
  
  try {
    await env.DB.prepare('DELETE FROM email_subscriptions WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Error deleting email subscription:', error);
    return false;
  }
}

/**
 * 获取订阅统计
 */
export async function getEmailSubscriptionStats(env) {
  if (!env.DB) return { total: 0, active: 0, unsubscribed: 0 };
  
  try {
    const total = await env.DB.prepare('SELECT COUNT(*) as count FROM email_subscriptions').first();
    const active = await env.DB.prepare("SELECT COUNT(*) as count FROM email_subscriptions WHERE status = 'active'").first();
    const unsubscribed = await env.DB.prepare("SELECT COUNT(*) as count FROM email_subscriptions WHERE status = 'unsubscribed'").first();
    
    return {
      total: total?.count || 0,
      active: active?.count || 0,
      unsubscribed: unsubscribed?.count || 0
    };
  } catch (error) {
    console.error('Error getting email subscription stats:', error);
    return { total: 0, active: 0, unsubscribed: 0 };
  }
}

/**
 * 保存留言
 */
export async function saveContactMessage(env, contactData) {
  if (!env.DB) return null;
  
  try {
    // 确保表存在
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        status TEXT DEFAULT 'unread'
      )
    `).run();
    
    // 插入留言
    const result = await env.DB.prepare(
      'INSERT INTO contact_messages (name, email, subject, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      contactData.name,
      contactData.email,
      contactData.subject || null,
      contactData.message,
      contactData.ip_address || null,
      contactData.user_agent || null
    ).run();
    
    return { id: result.meta.last_row_id, ...contactData };
  } catch (error) {
    console.error('Error saving contact message:', error);
    throw error;
  }
}

/**
 * 获取所有留言（需要认证）
 */
export async function getContactMessages(env, filters = {}) {
  if (!env.DB) return [];
  
  try {
    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.start_date) {
      query += ' AND created_at >= ?';
      params.push(filters.start_date);
    }
    
    if (filters.end_date) {
      query += ' AND created_at <= ?';
      params.push(filters.end_date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return results || [];
  } catch (error) {
    console.error('Error getting contact messages:', error);
    return [];
  }
}

