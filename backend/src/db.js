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
    `);

    // 检查是否有管理员用户
    const adminCheck = await env.DB.prepare('SELECT * FROM users WHERE role = ?').bind('admin').first();
    if (!adminCheck) {
      // 创建默认管理员（密码：admin123，需要修改）
      const defaultPassword = 'admin123'; // 实际应该使用 bcrypt 加密
      await env.DB.prepare(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
      ).bind('admin', 'admin@fashionstore.com', defaultPassword, 'admin').run();
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
  if (!env.DB) return null;

  try {
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).bind(username, username).first();

    if (!user) return null;

    // 简单的密码验证（实际应该使用 bcrypt）
    if (user.password_hash === password) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
    }

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
    const config = await env.DB.prepare(
      'SELECT * FROM product_configs WHERE product_id = ? AND button_type = ? AND is_enabled = 1'
    ).bind(productId, buttonType).first();

    return config;
  } catch (error) {
    console.error('Get product config error:', error);
    return null;
  }
}

/**
 * 获取所有产品配置
 */
export async function getAllProductConfigs(env) {
  if (!env.DB) return [];

  try {
    const configs = await env.DB.prepare('SELECT * FROM product_configs ORDER BY product_id, button_type').all();
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
  if (!env.DB) return null;

  try {
    const result = await env.DB.prepare(
      `INSERT INTO product_configs (product_id, button_type, action_type, target_url, api_endpoint, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(product_id, button_type) 
       DO UPDATE SET 
         action_type = excluded.action_type,
         target_url = excluded.target_url,
         api_endpoint = excluded.api_endpoint,
         is_enabled = excluded.is_enabled,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(
      config.product_id,
      config.button_type,
      config.action_type,
      config.target_url || null,
      config.api_endpoint || null,
      config.is_enabled !== undefined ? config.is_enabled : 1
    ).run();

    return result;
  } catch (error) {
    console.error('Upsert product config error:', error);
    return null;
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

