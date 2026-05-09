# Supabase → Self-Host Migration Plan (lighting-catalog)

> **Status:** Phase 0 đã xong (files), Phase 1–5 còn lại.
> **Created:** 2026-05-08
> **Target stack:** PostgreSQL self-host (Docker) + Drizzle ORM + iron-session + Local FS storage + Server Actions

---

## 1. Hiện trạng & Mục tiêu

**Hiện tại:** Next.js 16 + React 19 + Tailwind 4. Toàn bộ data layer dùng Supabase (Auth, Postgres, Storage). Deploy trên 1 VPS Ubuntu 24.04 (6 vCPU / 6GB RAM) qua PM2 + Nginx.

**Sau migration:** Zero dependency Supabase. Postgres chạy trong Docker container cùng VPS. Auth tự làm bằng iron-session (1 admin). Ảnh lưu local FS, Nginx serve trực tiếp.

**Constraints:**
- Postgres chạy trong Docker trên VPS hiện tại (đã user xác nhận)
- 1 admin user duy nhất (bảng `admin_users`, không OAuth)
- Phải migrate **đầy đủ data + ảnh** từ Supabase (không seed lại)
- Giữ pattern Next.js cache (`unstable_cache` + `revalidateTag`) — chỉ thay nội dung fetcher
- Giữ TypeScript types ở `src/lib/types/database.ts` (component không phải sửa type)

---

## 2. Stack quyết định (Plan Alpha)

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| DB | PostgreSQL 16 (Docker) | Schema gốc Supabase là Postgres, dùng JSONB nặng (specs/variants/items) |
| ORM | Drizzle ORM + drizzle-kit | Bundle nhỏ, không có binary engine, query gần SQL, dễ map 1-1 từ Supabase JS |
| Auth | iron-session + bcryptjs | 1 admin → không cần Auth.js. ~80 dòng code login/logout/middleware |
| Storage | Local FS `/var/lighting-uploads/` + Nginx serve `/uploads/*` | 1 VPS, không cần CDN ngay. Thêm Route Handler `/api/upload` để admin upload |
| API | Server Actions (mutations) + Route Handlers (upload + checkout) | Giữ pattern hiện tại, ít refactor |

**Trade-offs đã chấp nhận:**
- Mất ảnh nếu disk VPS hỏng → dùng cron `tar` + rsync để backup (tách topic, làm sau)
- Khó scale ngang sang nhiều VPS → nếu cần, đổi `lib/storage/local.ts` sang R2/MinIO sau

---

## 3. Architecture sau migration

```
┌─────────────────────────────────────────────────────────┐
│ VPS Ubuntu 24.04 (6 vCPU, 6GB RAM)                     │
│                                                         │
│  ┌──────────────────┐   ┌────────────────────────────┐ │
│  │ Nginx :80/:443   │──▶│ Next.js (PM2) :3000        │ │
│  │  /uploads/* ──┐  │   │  ├─ Server Components      │ │
│  │  /         ──┘└──┼──▶│  ├─ Server Actions         │ │
│  │              │   │   │  ├─ Route Handlers         │ │
│  └──────────────┼───┘   │  └─ middleware.ts          │ │
│                 │       └──────────┬─────────────────┘ │
│                 │                  │ pg                 │
│                 ▼                  ▼                    │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │ /var/lighting-       │  │ Postgres 16 (Docker)    │ │
│  │   uploads/           │  │ :5432 (localhost only)  │ │
│  │   ├─ products/       │  │ Volume lighting-pgdata  │ │
│  │   ├─ categories/     │  └─────────────────────────┘ │
│  │   ├─ brands/         │                              │
│  │   ├─ banners/        │                              │
│  │   └─ posts/          │                              │
│  └──────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

**Quy ước file paths:**
- `src/lib/supabase/` — **xóa toàn bộ ở Phase 5**
- `src/lib/db/` — DB client + schema + queries
- `src/lib/auth/` — iron-session config + helpers
- `src/lib/storage/` — file upload helpers
- `src/app/api/upload/` — Route Handler upload ảnh
- `src/app/actions/admin.ts` — Server Actions cho admin CRUD

---

## 4. Schema mapping (đã làm Phase 0)

7 bảng (6 cũ + `admin_users` mới):

| Bảng | Note |
|---|---|
| `banners` | Giữ nguyên |
| `categories` | Self-reference `parent_id` (đa cấp), index `parent_id` + `sort_order` |
| `brands` | Giữ nguyên |
| `products` | JSONB `specs`/`variants`, `text[]` gallery, FK category_id (RESTRICT) + brand_id (SET NULL), composite index `(sort_order, created_at)` |
| `orders` | JSONB `items` (notNull), status mặc định `pending` |
| `posts` | `is_featured`/`is_popular`/`is_published` flags |
| `admin_users` (mới) | id, email (unique), password_hash, created_at |

**Quy tắc map Supabase → Drizzle:**
- JSONB → `jsonb('col').$type<TypeFromDatabaseTs>()`
- `text[]` → `text('col').array()`
- `uuid` mặc định `gen_random_uuid()` → `.defaultRandom()`
- `timestamptz` → `timestamp({ withTimezone: true })`
- `numeric(12,0)` → `numeric({ precision: 12, scale: 0 })` (lưu ý: trả về `string` ở Drizzle, cần convert sang `number` ở query layer)

**Drizzle relations:** `productsRelations` join `categories` + `brands`; `categoriesRelations` self-ref qua `relationName: "category_parent"`.

---

## 5. Phase Roadmap

### ✅ Phase 0 — Setup & Schema (DONE — chỉ còn run thực)

**Files đã tạo:**
- `docker-compose.yml` — Postgres 16, port 127.0.0.1:5432, healthcheck, volume `lighting-pgdata`
- `drizzle.config.ts`
- `src/lib/db/schema.ts` — 7 bảng + relations
- `src/lib/db/index.ts` — DB singleton (Pool, max 10, global cache cho dev hot-reload)
- `src/lib/db/types.ts` — `InferSelectModel`/`InferInsertModel` exports
- `scripts/migrate-from-supabase.ts` — copy 6 bảng REST → Postgres, idempotent (`ON CONFLICT (id) DO NOTHING`), chunked 200 rows
- `scripts/migrate-storage.ts` — recursive list bucket `product-images` → download → ghi vào `UPLOAD_DIR`
- `scripts/rewrite-image-urls.ts` — đổi URL `<supabase>/storage/v1/object/public/product-images/...` → `/uploads/...` cho banners/categories/brands/products(image+gallery)/posts(thumbnail+content HTML)
- `scripts/seed-admin.ts` — bcrypt hash + insert (idempotent theo email)
- `.env.local` — secrets random đã sinh (PG password, SESSION_SECRET, ADMIN_INIT_PASSWORD)
- `.env.example` — placeholder cho deploy

**Files đã sửa:**
- `package.json` — thêm `drizzle-orm`, `pg`, `iron-session`, `bcryptjs`, `drizzle-kit`, `tsx`, `@types/{pg,bcryptjs}` + scripts `db:push`, `db:studio`, `db:migrate-data`, `db:migrate-storage`, `db:rewrite-urls`, `db:seed-admin`

**❗ Còn phải chạy thực sự (next agent / user làm):**
```bash
npm install
docker compose up -d
npx drizzle-kit push           # tạo 7 bảng
npm run db:seed-admin          # tạo admin user
npm run db:migrate-data        # copy 6 bảng từ Supabase
sudo mkdir -p /var/lighting-uploads/{products,categories,brands,banners,posts}
sudo chown $USER /var/lighting-uploads
npm run db:migrate-storage     # copy ảnh từ Supabase Storage
npm run db:rewrite-urls        # đổi URL trong DB
```

**Verify:**
- `docker compose ps` → postgres healthy
- `npx drizzle-kit studio` → thấy 7 bảng có data
- `SELECT count(*) FROM products` khớp với Supabase
- `ls /var/lighting-uploads/products | wc -l` khớp với số ảnh trong bucket

---

### 🟡 Phase 1 — Query Layer (TODO)

**Mục tiêu:** Có module `src/lib/db/queries/` chứa toàn bộ data access function — return type giống hệt Supabase hiện tại để Phase 3 chỉ cần thay 1 dòng import.

**Files cần tạo:**
- `src/lib/db/queries/products.ts` — `getProductBySlug`, `getProductsByCategory`, `getLatestProducts`, `getBestSellers`, `getAllProducts`, `getProductsForAdmin(filter)`, `createProduct`, `updateProduct`, `deleteProduct`, `bulkInsertProducts`
- `src/lib/db/queries/categories.ts` — `getAllCategories`, `getCategoryBySlug`, `getCategoryTree` (build in-memory từ flat list), CRUD
- `src/lib/db/queries/brands.ts` — `getAllBrands`, `getBrandBySlug`, CRUD
- `src/lib/db/queries/banners.ts` — `getActiveBanners`, CRUD
- `src/lib/db/queries/posts.ts` — `getPublishedPosts`, `getPostBySlug`, `getFeaturedPosts`, CRUD
- `src/lib/db/queries/orders.ts` — `createOrder`, `getOrders(filter)`, `getOrderById`, `updateOrderStatus`

**Quy tắc API:**
1. Trả về **cùng shape Supabase trả về** (nested object `categories: { name, slug }`, `brands: { name, slug, logo_url }` cho ProductWithRelations)
2. Dùng Drizzle `relations` API (`db.query.products.findFirst({ with: { categories: true } })`) thay vì raw SQL
3. **KHÔNG tự cache** — caller (Server Component) sẽ wrap bằng `unstable_cache` ở Phase 3
4. Convert `numeric` (string) → `number` cho `price` và `total_amount` trước khi return

**Verify:** `tsc --noEmit` pass, không file query nào import `@supabase/*`.

---

### 🟡 Phase 2 — Auth (iron-session) (TODO)

**Files cần tạo:**
- `src/lib/auth/session.ts` — config iron-session (`cookieName: 'lc_session'`, secret từ env, secure prod, httpOnly, sameSite lax, maxAge 7d). Type `SessionData = { userId: string; email: string }`
- `src/lib/auth/login.ts` — Server Action `loginAction(email, password)`: query `admin_users`, `bcrypt.compare`, set session
- `src/lib/auth/logout.ts` — Server Action `logoutAction`: `session.destroy()`
- `src/lib/auth/require-admin.ts` — `requireAdmin()` cho Server Components: throw `redirect('/login')` nếu no session

**Files cần sửa:**
- `src/middleware.ts` — bỏ `updateSession` Supabase, dùng `getIronSession` đọc cookie, redirect `/login` nếu missing trên `/admin/*`
- `src/app/login/page.tsx` — thay `supabase.auth.signInWithPassword` bằng `loginAction`
- `src/components/admin/Header.tsx` — thay `supabase.auth.signOut()` bằng `logoutAction`

**Lưu ý:** iron-session cookie ký AES, không cần bảng session. Edge runtime middleware support iron-session nhưng cần đúng import path.

**Verify:** Login set cookie `lc_session`, `/admin/*` accessible sau login, logout xóa cookie.

---

### 🟡 Phase 3 — Component Refactor (TODO)

**Mục tiêu:** Mọi component (Server + Client) ngưng gọi Supabase. Cache pattern giữ nguyên 100%.

**Files Server Component cần sửa (~12):**
- `src/app/(storefront)/page.tsx`
- `src/app/(storefront)/danh-muc/page.tsx`
- `src/app/(storefront)/danh-muc/[slug]/page.tsx`
- `src/app/(storefront)/san-pham/[slug]/page.tsx`
- `src/app/(storefront)/tat-ca-danh-muc/page.tsx`
- `src/app/(storefront)/tin-tuc/page.tsx`
- `src/app/(storefront)/tin-tuc/[slug]/page.tsx`
- `src/app/(storefront)/dat-hang/page.tsx`
- `src/app/(storefront)/thanh-toan/page.tsx`
- `src/components/storefront/{Header,Footer,FeaturedCategories,LatestProducts}.tsx`
- `src/app/(admin)/admin/page.tsx` + tất cả admin pages dưới `(admin)/admin/`

**Pattern thay đổi:**
```ts
// TRƯỚC
const supabase = createStaticClient();
const data = await unstable_cache(
  async () => {
    const { data } = await supabase.from('products').select('*').limit(8);
    return data ?? [];
  },
  ['latest-products'],
  { tags: ['products'], revalidate: 3600 }
)();

// SAU (cache wrapper giữ nguyên!)
import { getLatestProducts } from '@/lib/db/queries/products';
const data = await unstable_cache(
  () => getLatestProducts(8),
  ['latest-products'],
  { tags: ['products'], revalidate: 3600 }
)();
```

**Files Client Component cần refactor (5 file lớn):**
| File | Thay đổi |
|---|---|
| `components/admin/ProductFormModal.tsx` | Thay supabase queries (categories/brands list, insert/update) → Server Actions: `getAdminFormDataAction()`, `saveProductAction(data)` |
| `components/admin/ProductImportModal.tsx` | Thay bulk insert → `bulkImportProductsAction(rows)` |
| `components/admin/ProductToolbar.tsx` | Thay query categories filter → pre-fetch ở parent Server Component, pass props (xóa supabase call) |
| `components/admin/OrderDetailModal.tsx` | Thay update status → `updateOrderStatusAction(id, status)` |
| `components/admin/product-form/RichTextEditor.tsx` | Thay storage upload → fetch `/api/upload` (Phase 4 tạo route) |

**File cần tạo mới:**
- `src/app/actions/admin.ts` — toàn bộ Server Actions admin: `saveProduct`, `deleteProduct`, `bulkImportProducts`, `saveCategoryAction`, `saveBrandAction`, `saveBannerAction`, `savePostAction`, `updateOrderStatusAction`, `getAdminFormDataAction`. Mỗi action gọi `requireAdmin()` đầu tiên + `revalidateTag(...)` sau khi mutation.

**Quy tắc:**
- KHÔNG import `@/lib/db` vào Client Component (sẽ leak `pg` vào bundle)
- Tất cả DB call phải qua file `'use server'`
- Sau mutation Server Action: `useTransition()` + `router.refresh()` ở client để cập nhật UI

**Verify:** `npm run build` pass, `grep -r "supabase" src/components src/app | grep -v supabase/` → empty (chưa xóa folder lib/supabase, sẽ làm Phase 5).

---

### 🟡 Phase 4 — Storage (TODO)

**Files cần tạo:**
- `src/lib/storage/local.ts` — `saveUploadedFile(file: File, folder: 'products' | 'categories' | 'brands' | 'banners' | 'posts'): Promise<string>` → write `UPLOAD_DIR/folder/<uuid>.<ext>`, return `/uploads/folder/<uuid>.<ext>` (dùng `NEXT_PUBLIC_UPLOAD_PATH` env)
- `src/lib/storage/delete.ts` — `deleteUploadedFile(url): Promise<void>` (best-effort)
- `src/app/api/upload/route.ts` — POST: `requireAdmin()`, parse FormData, validate MIME `image/*` + size <5MB + magic byte check (đọc 4 byte đầu), save, return `{ url }`

**Files cần sửa:**
- `components/admin/ProductFormModal.tsx` — fetch `/api/upload` thay `supabase.storage.from(...).upload(...)`
- `components/admin/product-form/RichTextEditor.tsx` — cùng pattern
- `DEPLOY.md` — thêm:
  - `mkdir -p /var/lighting-uploads/{products,categories,brands,banners,posts}`
  - Nginx: `location /uploads/ { alias /var/lighting-uploads/; expires 30d; add_header Cache-Control "public, max-age=2592000"; }`
  - Đổi env vars Supabase → DATABASE_URL/SESSION_SECRET/UPLOAD_DIR

**Verify:** Upload từ admin → file trong `/var/lighting-uploads/products/`, URL hiện trong `<img>`, Nginx serve OK, không auth → 401.

---

### 🟡 Phase 5 — Cleanup (TODO)

**Files cần xóa:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/static.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/` (folder rỗng)

**Files cần sửa:**
- `package.json` — remove `@supabase/ssr`, `@supabase/supabase-js`
- `.env.example` + `.env.local` — xoá `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `next.config.ts` — bỏ `*.supabase.co` khỏi `images.remotePatterns`
- `DEPLOY.md` — update toàn bộ section Supabase

**Migration scripts (`scripts/migrate-*.ts`)** vẫn dùng `@supabase/supabase-js`. Sau khi migrate xong:
- Option A: xóa luôn cả scripts và remove deps (không cần migrate lại)
- Option B (recommended): giữ scripts nhưng đánh dấu legacy, có thể `npm install --no-save @supabase/supabase-js` khi cần chạy

**Smoke test plan:**
1. Storefront — `/`, `/danh-muc`, `/danh-muc/[slug]`, `/san-pham/[slug]`, `/tin-tuc`, `/tin-tuc/[slug]`, đặt hàng `/dat-hang` → `/thanh-toan` (tạo order)
2. Admin login — `/login` với email + password seed → redirect `/admin`
3. Admin CRUD đầy đủ 6 bảng + upload ảnh + variants
4. Cache — sau update product → storefront refresh thấy data mới (revalidateTag hoạt động)
5. Build — `npm run build` không error

**Verify:**
- `grep -r "supabase" src` → empty
- `grep -r "@supabase" package.json` → empty
- PM2 restart → app start không error

---

## 6. Risk Register

| Phase | Risk | Mitigation |
|---|---|---|
| 0 | Schema mismatch (timestamp, array NULL vs `[]`) | Dump 1 row mẫu mỗi bảng, so sánh với insert kết quả |
| 0 | Migrate data fail giữa chừng | Idempotent với `ON CONFLICT DO NOTHING`, rerun an toàn |
| 0 | Postgres OOM trên VPS 6GB | `shared_buffers=512MB`, `effective_cache_size=2GB`, `max_connections=20` (đã set trong docker-compose.yml) |
| 1 | Drizzle relation join shape khác Supabase | Snapshot test 1 query phức tạp (`getProductBySlug` với category+brand) |
| 1 | N+1 khi build category tree | Load all flat + build tree in-memory thay vì recursive query |
| 2 | iron-session cookie quá lớn | Chỉ lưu `userId` + `email` |
| 2 | Edge runtime middleware không support `node:crypto` | iron-session có version edge-compatible — chọn đúng import |
| 3 | Client Component import `@/lib/db` (leak `pg` vào bundle) | Bao tất cả DB call trong file `'use server'` |
| 3 | Cache key collision | Giữ nguyên cache keys hiện tại |
| 4 | User upload non-image | Validate MIME + extension whitelist + magic byte check |
| 4 | Bypass auth `/api/upload` | Route Handler `requireAdmin()` đầu tiên |
| 5 | Còn import `@supabase/*` sau khi remove dep | Build sẽ fail → fix |

---

## 7. Tham khảo files quan trọng

**Schema gốc:** `sql/002_*.sql` đến `sql/008_*.sql`
**Types hiện tại (giữ nguyên):** `src/lib/types/database.ts`
**Cache pattern hiện tại:** xem `src/components/storefront/LatestProducts.tsx` (`unstable_cache` với tags)
**Deploy doc:** `DEPLOY.md` (cần update Phase 4-5)
