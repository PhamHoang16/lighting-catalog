-- =====================================================
-- Thêm sort_order cho categories + is_best_seller cho products
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- 1. Thêm cột sort_order vào categories (mặc định 0)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Tạo index cho sort_order
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- 3. Thêm cột is_best_seller vào products (mặc định false)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- 4. Tạo index cho is_best_seller (filtered index cho query hiệu quả)
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true;
