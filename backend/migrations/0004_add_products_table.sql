-- 产品表（完整的商品信息，包含SEO字段）
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT, -- SEO标题
  description TEXT, -- 产品描述
  meta_description TEXT, -- SEO描述
  meta_keywords TEXT, -- SEO关键词（逗号分隔）
  canonical_url TEXT, -- Canonical URL
  price REAL NOT NULL,
  original_price REAL,
  category TEXT,
  image TEXT,
  images TEXT, -- JSON数组，存储多张图片
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  on_sale BOOLEAN DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku TEXT, -- 商品SKU
  brand TEXT, -- 品牌
  status TEXT DEFAULT 'active', -- active, inactive, draft
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

