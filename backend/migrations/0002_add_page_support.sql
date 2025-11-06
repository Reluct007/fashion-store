-- 添加页面类型支持（首页、单页面）
-- 使用方法: npx wrangler d1 execute fashion-store-db --remote --file=./migrations/0002_add_page_support.sql

-- 添加 page_type 字段（如果不存在）
-- 注意：SQLite 不支持直接添加列到现有表，需要重建表
-- 这里提供迁移方案

-- 方案：使用 product_id 的特殊值
-- product_id = 0: 首页
-- product_id > 0: 产品详情页
-- product_id = -1: 单页面（使用 page_path 字段）

-- 添加 page_path 字段用于单页面路径
ALTER TABLE product_configs ADD COLUMN page_path TEXT;

-- 更新现有记录的 page_type（通过 product_id 推断）
-- 如果 product_id > 0，则为产品页面
-- 如果 product_id = 0，则为首页
-- 如果 product_id = -1，则为单页面

