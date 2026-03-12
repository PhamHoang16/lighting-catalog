-- =====================================================
-- MIGRATION: Quote → Order + Product Variants
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- ══════════════════════════════════════════════════════
-- 1. PRODUCT VARIANTS (dùng JSONB trong bảng products)
-- ══════════════════════════════════════════════════════
-- Thêm cột variants (JSONB) lưu cấu trúc biến thể
-- Cấu trúc:
-- {
--   "options": [
--     { "name": "Công suất", "values": ["4W", "6W", "10W"] },
--     { "name": "Màu chóa", "values": ["Đen nhám", "Vàng gold"] }
--   ],
--   "variants": [
--     { "combination": ["4W", "Đen nhám"], "price": 294000, "stock": 50, "sku": "DL-4W-DEN" },
--     { "combination": ["4W", "Vàng gold"], "price": 310000, "stock": 30, "sku": "DL-4W-VANG" },
--     ...
--   ]
-- }
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB;

-- ══════════════════════════════════════════════════════
-- 2. ORDERS TABLE (refactor từ quote_requests)
-- ══════════════════════════════════════════════════════
-- Đổi tên bảng quote_requests → orders
ALTER TABLE quote_requests RENAME TO orders;

-- Thêm các cột mới cho đơn hàng
ALTER TABLE orders ADD COLUMN IF NOT EXISTS title VARCHAR(10) DEFAULT 'anh';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(20) DEFAULT 'delivery';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_at_home BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_company BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,0) DEFAULT 0;

-- Đổi tên cột để phù hợp ngữ cảnh
-- (phone + customer_name + message + items + status + created_at giữ nguyên)

-- Cập nhật status values
-- 'new' → 'pending', 'processing' → 'confirmed', 'completed' → 'completed', 'cancelled' → 'cancelled'
UPDATE orders SET status = 'pending' WHERE status = 'new';
UPDATE orders SET status = 'confirmed' WHERE status = 'processing';

-- ══════════════════════════════════════════════════════
-- 3. BRANDS TABLE (nếu chưa tạo)
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Thêm brand_id vào products (nếu chưa có)
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
