-- =====================================================
-- Tạo bảng posts cho Module Tin tức / Blog
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    thumbnail_url TEXT,
    summary TEXT,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index cho slug để truy vấn nhanh
CREATE INDEX idx_posts_slug ON public.posts(slug);

-- Index cho created_at để sắp xếp theo thời gian
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);

-- RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Ai cũng xem được bài đã xuất bản, admin xem được tất cả
CREATE POLICY "Cho phép xem bài viết (tuỳ role)"
    ON public.posts FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

-- INSERT / UPDATE / DELETE: Chỉ user đã đăng nhập
CREATE POLICY "Chỉ admin mới được thao tác bài viết"
    ON public.posts FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
