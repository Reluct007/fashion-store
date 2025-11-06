-- 添加点击统计表
-- 使用方法: npx wrangler d1 execute fashion-store-db --remote --file=./migrations/0003_add_click_stats.sql

CREATE TABLE IF NOT EXISTS click_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_url TEXT NOT NULL,
  page_type TEXT NOT NULL, -- 'home', 'product', 'page', 'list'
  page_id INTEGER, -- product_id 或 page_path 的标识
  page_path TEXT, -- 单页面的路径
  click_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  referer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_click_stats_url ON click_stats(target_url);
CREATE INDEX IF NOT EXISTS idx_click_stats_page ON click_stats(page_type, page_id);
CREATE INDEX IF NOT EXISTS idx_click_stats_time ON click_stats(click_time);

