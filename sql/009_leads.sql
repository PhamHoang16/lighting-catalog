-- 009_leads.sql
-- Bảng leads: thông tin khách đăng ký tư vấn từ form cuối trang (footer).

CREATE TABLE IF NOT EXISTS leads (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    phone       text NOT NULL,
    email       text,
    status      text NOT NULL DEFAULT 'new',
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
