-- =====================================================
-- Nâng cấp bảng categories: Danh mục đa cấp + Hình ảnh
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- 1. Thêm cột parent_id (tham chiếu chính bảng categories)
ALTER TABLE categories
ADD COLUMN parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 2. Thêm cột image_url (ảnh đại diện danh mục)
ALTER TABLE categories
ADD COLUMN image_url TEXT;

-- 3. Thêm cột description (mô tả ngắn)
ALTER TABLE categories
ADD COLUMN description TEXT;

-- 4. Tạo index cho parent_id để query con theo cha nhanh hơn
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
