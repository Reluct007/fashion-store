-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 产品配置表（存储按钮跳转链接等配置）
CREATE TABLE IF NOT EXISTS product_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  button_type TEXT NOT NULL, -- 'add_to_cart', 'buy_now', etc.
  action_type TEXT NOT NULL, -- 'link', 'api', 'modal'
  target_url TEXT,
  api_endpoint TEXT,
  is_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, button_type)
);

-- 系统配置表（存储全局变量）
CREATE TABLE IF NOT EXISTS system_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  config_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员用户（密码：admin123，需要在实际使用中修改）
-- 密码哈希使用 bcrypt，这里只是示例，实际应该使用安全的哈希算法
INSERT OR IGNORE INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@fashionstore.com', '$2b$10$rOzJqCqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZqQZ', 'admin');

-- 插入默认系统配置
INSERT OR IGNORE INTO system_configs (config_key, config_value, config_type, description) VALUES
('site_name', 'Fashion Store', 'string', '网站名称'),
('api_url', 'https://fashion-store-api.reluct007.workers.dev', 'string', 'API 地址'),
('enable_cart', 'true', 'boolean', '是否启用购物车功能');

