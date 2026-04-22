-- =====================================================
-- Thêm sort_order cho products để admin kiểm soát thứ tự hiển thị
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- 1. Thêm cột sort_order vào products (mặc định 0)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- 2. Tạo composite index cho storefront query: ORDER BY sort_order ASC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_sort_order_created
ON products(sort_order ASC, created_at DESC);
