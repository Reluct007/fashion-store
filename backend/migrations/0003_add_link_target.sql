-- 添加 link_target 列用于控制链接打开方式
ALTER TABLE product_configs ADD COLUMN link_target TEXT DEFAULT '_blank';

