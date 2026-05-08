# Deploy lighting-catalog lên VPS

> **Server:** Ubuntu 24.04 | 6 vCPU / 6GB RAM | h2cloud  
> **App:** Next.js 16 + Supabase  
> **Domain:** ledxinh.com

---

## Checklist tổng quan

- [ ] Bước 1 — Cài Node.js
- [ ] Bước 2 — Cài PM2 + Nginx
- [ ] Bước 3 — Upload code từ máy local
- [ ] Bước 4 — Cấu hình .env trên server
- [ ] Bước 5 — Build app
- [ ] Bước 6 — Chạy app với PM2
- [ ] Bước 7 — Cấu hình Nginx
- [ ] Bước 8 — Trỏ DNS
- [ ] Bước 9 — Cài SSL

---

## Bước 1 — Cài Node.js 20 (trên server)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22
node -v && npm -v
```

✅ Kết quả mong đợi: `v20.x.x` và `10.x.x`

---

## Bước 2 — Cài PM2 và Nginx (trên server)

```bash
npm install -g pm2
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

✅ Kiểm tra: `nginx -v` và `pm2 -v`

---

## Bước 3 — Upload code từ máy local

> Chạy lệnh này trên **máy local** (không phải server)

```bash
cd /home/hoangpham/working/lighting/lighting-catalog

rsync -avz --progress \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .gitnexus \
  --exclude DEPLOY.md \
  --exclude server-test.sh \
  . root@<IP_PUBLIC_SERVER>:~/lighting-catalog/
```

> Thay `<IP_PUBLIC_SERVER>` bằng IP public thực của server (chạy `curl ifconfig.me` trên server để lấy).

✅ Kiểm tra trên server: `ls ~/lighting-catalog/`

---

## Bước 4 — Cấu hình .env trên server

Upload file .env:

```bash
# Chạy trên máy local
scp /home/hoangpham/working/lighting/lighting-catalog/.env.local \
  root@<IP_PUBLIC_SERVER>:~/lighting-catalog/.env.local
```

Kiểm tra trên server:

```bash
cat ~/lighting-catalog/.env.local
```

✅ Phải thấy `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Bước 5 — Build app (trên server)

```bash
cd ~/lighting-catalog
npm install
npm run build
```

> Build lần đầu mất 3–5 phút.  
> Nếu lỗi **JavaScript heap out of memory**:
> ```bash
> export NODE_OPTIONS="--max-old-space-size=4096"
> npm run build
> ```

✅ Kết quả mong đợi: thấy `✓ Compiled successfully` hoặc `Route (app)` listing ở cuối

---

## Bước 6 — Chạy app với PM2 (trên server)

```bash
cd ~/lighting-catalog
pm2 start npm --name "lighting-catalog" -- start
pm2 status
```

Kiểm tra app đang chạy:

```bash
curl http://localhost:3000
```

✅ Phải trả về HTML (không báo lỗi Connection refused)

Setup tự khởi động sau reboot:

```bash
pm2 save
pm2 startup
# Copy và chạy lệnh mà pm2 in ra
```

---

## Bước 7 — Cấu hình Nginx (trên server)

```bash
nano /etc/nginx/sites-available/ledxinh.com
```

Paste nội dung:

```nginx
server {
    listen 80;
    server_name ledxinh.com www.ledxinh.com;

    client_max_body_size 50M;

    location / {
        proxy_pass          http://localhost:3000;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade             $http_upgrade;
        proxy_set_header    Connection          'upgrade';
        proxy_set_header    Host                $host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   $scheme;
        proxy_cache_bypass  $http_upgrade;
    }
}
```

Kích hoạt:

```bash
ln -s /etc/nginx/sites-available/ledxinh.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

✅ `nginx -t` phải báo `syntax is ok` và `test is successful`

---

## Bước 8 — Trỏ DNS

Lấy IP public của server:

```bash
curl ifconfig.me
```

Vào DNS manager của domain `ledxinh.com`, tạo 2 record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `<IP public>` | 300 |
| A | www | `<IP public>` | 300 |

Kiểm tra DNS đã propagate (chờ 2–5 phút):

```bash
nslookup ledxinh.com
# hoặc
dig ledxinh.com +short
```

✅ Phải trả về đúng IP public của server

---

## Bước 9 — Cài SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d ledxinh.com -d www.ledxinh.com
```

Certbot sẽ hỏi email và tự cấu hình HTTPS trong Nginx.

Kiểm tra auto-renew:

```bash
certbot renew --dry-run
```

✅ Truy cập `https://ledxinh.com` — phải thấy website với ổ khóa xanh

---

## Cập nhật code sau này

Mỗi khi có thay đổi, từ **máy local** chạy:

```bash
cd /home/hoangpham/working/lighting/lighting-catalog

# 1. Upload code mới
rsync -avz --progress \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .gitnexus \
  --exclude DEPLOY.md \
  --exclude server-test.sh \
  . root@<IP_PUBLIC_SERVER>:~/lighting-catalog/

# 2. Build và restart
ssh root@<IP_PUBLIC_SERVER> "cd ~/lighting-catalog && npm install && npm run build && pm2 restart lighting-catalog"
```

---

## Xử lý sự cố

**Xem log app:**
```bash
pm2 logs lighting-catalog --lines 50
```

**Xem log Nginx:**
```bash
tail -f /var/log/nginx/error.log
```

**Restart app:**
```bash
pm2 restart lighting-catalog
```

**Kiểm tra port:**
```bash
ss -tlnp | grep :3000
ss -tlnp | grep :80
```
