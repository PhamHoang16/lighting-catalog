-- Banners table for homepage carousel
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép tất cả mọi người được xem banners" 
    ON public.banners FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Chỉ role admin mới được sửa banners" 
    ON public.banners FOR ALL 
    USING (auth.jwt() ->> 'role' = 'admin') 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Default seed data (optional) so the user sees something immediately
INSERT INTO public.banners (title, image_url, sort_order) VALUES
('Banner 1', 'https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=SUMMER+SALE+2026', 1),
('Banner 2', 'https://via.placeholder.com/1200x400/d97706/ffffff?text=NEW+COLLECTION', 2);
