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
    
    // 初始化产品表
    await initProductsTable(env);

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
  if (!env.DB) {
    throw new Error('Database not configured');
  }

  try {
    // 检查是否有 page_path 列（向后兼容）
    let hasPagePath = false;
    try {
      await env.DB.prepare('SELECT page_path FROM product_configs LIMIT 1').first();
      hasPagePath = true;
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
    
    // 准备 SQL 和参数
    let sql, params;
    
    if (hasPagePath) {
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
 * 初始化产品表
 */
export async function initProductsTable(env) {
  if (!env.DB) return null;
  
  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        title TEXT,
        description TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        canonical_url TEXT,
        price REAL NOT NULL,
        original_price REAL,
        category TEXT,
        image TEXT,
        images TEXT,
        rating REAL DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        on_sale BOOLEAN DEFAULT 0,
        stock INTEGER DEFAULT 0,
        sku TEXT,
        brand TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    `);
    return true;
  } catch (error) {
    console.error('Error initializing products table:', error);
    return false;
  }
}

/**
 * 生成slug（URL友好的字符串）
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 获取所有产品
 */
export async function getAllProducts(env, filters = {}) {
  if (!env.DB) return [];
  
  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.onSale !== undefined) {
      query += ' AND on_sale = ?';
      params.push(filters.onSale ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const { results } = await env.DB.prepare(query).bind(...params).all();
    return results || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

/**
 * 根据ID获取产品
 */
export async function getProductById(env, id) {
  if (!env.DB) return null;
  
  try {
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    return product || null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * 根据slug获取产品
 */
export async function getProductBySlug(env, slug) {
  if (!env.DB) return null;
  
  try {
    const product = await env.DB.prepare('SELECT * FROM products WHERE slug = ?').bind(slug).first();
    return product || null;
  } catch (error) {
    console.error('Error getting product by slug:', error);
    return null;
  }
}

/**
 * 创建产品
 */
export async function createProduct(env, productData) {
  if (!env.DB) {
    throw new Error('Database not configured');
  }
  
  try {
    const slug = productData.slug || generateSlug(productData.name);
    
    // 确保slug唯一
    let finalSlug = slug;
    let counter = 1;
    while (await getProductBySlug(env, finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    
    const images = Array.isArray(productData.images) 
      ? JSON.stringify(productData.images)
      : productData.images || null;
    
    const result = await env.DB.prepare(`
      INSERT INTO products (
        name, slug, title, description, meta_description, meta_keywords, canonical_url,
        price, original_price, category, image, images, rating, reviews,
        on_sale, stock, sku, brand, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      productData.name,
      finalSlug,
      productData.title || null,
      productData.description || null,
      productData.meta_description || null,
      productData.meta_keywords || null,
      productData.canonical_url || null,
      productData.price,
      productData.original_price || null,
      productData.category || null,
      productData.image || null,
      images,
      productData.rating || 0,
      productData.reviews || 0,
      productData.on_sale ? 1 : 0,
      productData.stock || 0,
      productData.sku || null,
      productData.brand || null,
      productData.status || 'active'
    ).run();
    
    return await getProductById(env, result.meta.last_row_id);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * 更新产品
 */
export async function updateProduct(env, id, productData) {
  if (!env.DB) {
    throw new Error('Database not configured');
  }
  
  try {
    const existingProduct = await getProductById(env, id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    
    let slug = productData.slug || existingProduct.slug;
    if (productData.name && !productData.slug) {
      slug = generateSlug(productData.name);
      // 如果slug改变，检查是否唯一
      if (slug !== existingProduct.slug) {
        let finalSlug = slug;
        let counter = 1;
        while (await getProductBySlug(env, finalSlug)) {
          const existing = await getProductBySlug(env, finalSlug);
          if (existing && existing.id !== id) {
            finalSlug = `${slug}-${counter}`;
            counter++;
          } else {
            break;
          }
        }
        slug = finalSlug;
      }
    }
    
    const images = Array.isArray(productData.images)
      ? JSON.stringify(productData.images)
      : productData.images || existingProduct.images || null;
    
    await env.DB.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        slug = ?,
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        meta_description = COALESCE(?, meta_description),
        meta_keywords = COALESCE(?, meta_keywords),
        canonical_url = COALESCE(?, canonical_url),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        category = COALESCE(?, category),
        image = COALESCE(?, image),
        images = COALESCE(?, images),
        rating = COALESCE(?, rating),
        reviews = COALESCE(?, reviews),
        on_sale = COALESCE(?, on_sale),
        stock = COALESCE(?, stock),
        sku = COALESCE(?, sku),
        brand = COALESCE(?, brand),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      productData.name || null,
      slug,
      productData.title || null,
      productData.description || null,
      productData.meta_description || null,
      productData.meta_keywords || null,
      productData.canonical_url || null,
      productData.price !== undefined ? productData.price : null,
      productData.original_price !== undefined ? productData.original_price : null,
      productData.category || null,
      productData.image || null,
      images,
      productData.rating !== undefined ? productData.rating : null,
      productData.reviews !== undefined ? productData.reviews : null,
      productData.on_sale !== undefined ? (productData.on_sale ? 1 : 0) : null,
      productData.stock !== undefined ? productData.stock : null,
      productData.sku || null,
      productData.brand || null,
      productData.status || null,
      id
    ).run();
    
    return await getProductById(env, id);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * 删除产品
 */
export async function deleteProduct(env, id) {
  if (!env.DB) return false;
  
  try {
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

/**
 * 批量创建产品
 */
export async function bulkCreateProducts(env, products) {
  if (!env.DB) {
    throw new Error('Database not configured');
  }
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < products.length; i++) {
    try {
      const product = await createProduct(env, products[i]);
      results.push({ index: i, success: true, product });
    } catch (error) {
      errors.push({ index: i, success: false, error: error.message, data: products[i] });
    }
  }
  
  return { results, errors, total: products.length, success: results.length, failed: errors.length };
}

