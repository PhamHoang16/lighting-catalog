-- =====================================================
-- Bổ sung trường is_featured và is_popular cho posts
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
