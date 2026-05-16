# SEO & Performance Improvement — lighting-catalog

**Created:** 2026-05-16
**Status:** Draft — pending implementation
**Owner:** @hoangp47
**Scope:** Storefront-only (admin routes excluded)

---

## 1. Mục tiêu (Goals)

1. Nâng điểm SEO của storefront từ **6.5/10 → 9/10**: sitemap chuẩn, robots chính xác, JSON-LD schema markup đầy đủ (Product, BreadcrumbList, Organization, WebSite, Article, ItemList).
2. Nâng điểm Performance từ **5/10 → 8/10**: migrate toàn bộ `<img>` sang `next/image`, tối ưu LCP HeroBanners, siết `next.config` image patterns, format AVIF/WebP.
3. **Fix security debt**: sanitize `dangerouslySetInnerHTML` cho product description + news content (đang là XSS risk).
4. **Cleanup migration debt**: xóa Supabase libs + 4 file dead code, gỡ dual-auth.

## 2. Non-goals (Out of scope)

- ❌ Refactor data layer, Drizzle queries, schema DB
- ❌ Admin pages — không động vào `(admin)/*`
- ❌ Bundle analyzer setup, lighthouse-CI tích hợp
- ❌ E2E test setup
- ❌ i18n, multi-language
- ❌ Thay design / visual tweaks

## 3. Nguyên tắc thực thi

1. **Pixel-perfect visual** — không thay đổi UX. Mỗi `<img>` migrate sang `next/image` phải giữ nguyên `className`, aspect ratio, hover, animation.
2. **Phase-by-phase**, mỗi phase một commit riêng để dễ revert.
3. **Low-risk first** — config changes trước, code changes sau.
4. **No heavy new dependency** — chỉ thêm `isomorphic-dompurify` (~30KB) cho XSS fix.
5. **Verify after each phase** — manual smoke test 3 trang: home, `/san-pham/[slug]`, `/danh-muc/[slug]`.

## 4. Findings (baseline)

### 4.1 SEO — 6.5/10

| ID | Issue | File | Severity |
|---|---|---|---|
| SEO-1 | `sitemap.ts` dùng `new Date()` cho mọi `lastModified` → vô nghĩa với Google | `src/app/sitemap.ts` | 🔴 |
| SEO-2 | `sitemap.ts` không cache → mỗi crawler request = 1 query 1000 sản phẩm | `src/app/sitemap.ts` | 🔴 |
| SEO-3 | `robots.ts` disallow `/workspace/` thay vì `/(admin)/`, `/login`, `/api/` | `src/app/robots.ts` | 🔴 |
| SEO-4 | Product JSON-LD emit `price: 0` cho sản phẩm "Liên hệ" → Google flag invalid | `src/app/(storefront)/san-pham/[slug]/page.tsx:91-145` | 🔴 |
| SEO-5 | Thiếu BreadcrumbList JSON-LD trên product, category, news detail | 3 file `[slug]/page.tsx` | 🔴 |
| SEO-6 | Thiếu Organization + WebSite JSON-LD (sitelinks search box) | `src/app/layout.tsx` | 🔴 |
| SEO-7 | Thiếu Article JSON-LD cho news | `src/app/(storefront)/tin-tuc/[slug]/page.tsx` | 🔴 |
| SEO-8 | Thiếu ItemList JSON-LD cho category | `src/app/(storefront)/danh-muc/[slug]/page.tsx` | 🟡 |
| SEO-9 | OG `type: "website"` trên product page (đúng là `"product"`) | `src/app/(storefront)/san-pham/[slug]/page.tsx` | 🟡 |
| SEO-10 | News page thiếu canonical URL | `src/app/(storefront)/tin-tuc/[slug]/page.tsx` | 🟡 |
| SEO-11 | `generateStaticParams` chỉ pre-render 20 sản phẩm, 20 category, 10 post | 3 file `[slug]/page.tsx` | 🟡 |

### 4.2 Performance — 5/10

| ID | Issue | File | Severity |
|---|---|---|---|
| PERF-1 | 31 chỗ dùng `<img>` thay vì `next/image` trên 24 file (gồm LCP) | 24 file storefront + admin | 🔴 |
| PERF-2 | `next.config.ts` cho phép `hostname: "**"` cho cả http + https | `next.config.ts` | 🔴 |
| PERF-3 | Thiếu `images.formats: ['avif','webp']` trong next.config | `next.config.ts` | 🔴 |
| PERF-4 | HeroBanners LCP image dùng `loading="eager"` nhưng không `priority`/`fetchpriority="high"` | `src/components/storefront/home/HeroBanners.tsx` | 🔴 |
| PERF-5 | Inter font load 2 subsets không khai báo weight → bundle full font | `src/app/layout.tsx:10-13` | 🟡 |
| PERF-6 | HomePage 3 round-trip DB sequential + parallel (có thể gom Promise.all lớn) | `src/app/(storefront)/page.tsx:21-46` | 🟡 |
| PERF-7 | Thiếu `compress: true`, `poweredByHeader: false` | `next.config.ts` | 🟡 |

### 4.3 Security

| ID | Issue | File | Severity |
|---|---|---|---|
| SEC-1 | `dangerouslySetInnerHTML` cho product description, không sanitize → stored XSS | `src/app/(storefront)/san-pham/[slug]/page.tsx:331` | 🚨 |
| SEC-2 | `dangerouslySetInnerHTML` cho news content, không sanitize → stored XSS | `src/app/(storefront)/tin-tuc/[slug]/page.tsx:132` | 🚨 |

### 4.4 Migration debt

| ID | Issue | Files | Severity |
|---|---|---|---|
| CLEAN-1 | `@supabase/ssr` + `@supabase/supabase-js` vẫn trong `package.json` (~85KB) | `package.json` | 🟡 |
| CLEAN-2 | 4 file `src/lib/supabase/*` (static.ts, client.ts, server.ts, middleware.ts) — dead code | `src/lib/supabase/` | 🟡 |
| CLEAN-3 | Dual auth: iron-session (mới) + Supabase auth client (cũ) cùng tồn tại | `src/lib/auth/*` + `src/lib/supabase/*` | 🟡 |

---

## 5. Implementation Phases

### 🎯 P0 — Quick wins SEO (config-level)

**Effort:** ~3-4 giờ
**Risk:** Rất thấp (config only, no UI change)
**Tackles:** SEO-1, SEO-2, SEO-3, SEO-9, SEO-10

| # | Task | File | DoD |
|---|---|---|---|
| P0.1 | Fix `robots.ts` disallow path | `src/app/robots.ts` | Disallow `/admin/`, `/login`, `/api/` thay vì `/workspace/` |
| P0.2 | Sửa `sitemap.ts` lastModified dùng `updated_at` từ DB cho product/category | `src/app/sitemap.ts` + `src/lib/db/queries/products.ts` | Mỗi URL có `lastModified` thực, không phải `new Date()` |
| P0.3 | Thêm cache cho sitemap (`unstable_cache` hoặc revalidate 3600) | `src/app/sitemap.ts` | Sitemap chỉ query DB mỗi giờ, không mỗi request |
| P0.4 | Đổi OG `type` của product page từ `"website"` → `"product"` (next.js OG: `book`/`profile`/`website`/`article`; product cần custom `<meta property="og:type" content="product" />`) | `src/app/(storefront)/san-pham/[slug]/page.tsx` | Inspect HTML thấy `og:type` đúng |
| P0.5 | Thêm canonical URL cho news detail page | `src/app/(storefront)/tin-tuc/[slug]/page.tsx` | `<link rel="canonical">` xuất hiện trong `<head>` |

**Verify P0:** `curl https://lighting-catalog.vn/robots.txt`, `curl https://lighting-catalog.vn/sitemap.xml` — kiểm tra lastmod khác nhau, đúng path disallow.

---

### 🛡️ P1 — Security: Sanitize XSS

**Effort:** ~2-3 giờ
**Risk:** Thấp (chỉ touch 2 file render)
**Tackles:** SEC-1, SEC-2

**Approach:** Sanitize ở **render time** trên server component (an toàn nhất). Thêm `isomorphic-dompurify` (~30KB, server+client). Tạo helper `sanitizeHtml()` để reuse.

| # | Task | File | DoD |
|---|---|---|---|
| P1.1 | Thêm `isomorphic-dompurify` vào dependencies | `package.json` | `npm install isomorphic-dompurify` |
| P1.2 | Tạo helper `src/lib/utils/sanitize.ts` với whitelist tag/attr cho rich text content | New file | Export `sanitizeHtml(dirty: string): string` |
| P1.3 | Apply sanitize ở product description render | `src/app/(storefront)/san-pham/[slug]/page.tsx:331` | `dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}` |
| P1.4 | Apply sanitize ở news content render | `src/app/(storefront)/tin-tuc/[slug]/page.tsx:132` | `dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}` |
| P1.5 | (KHÔNG sanitize JSON-LD `dangerouslySetInnerHTML` ở line 143 — đó là JSON.stringify, an toàn) | — | — |

**Whitelist suggest** (cho rich text từ react-quill):
- Tags: `p`, `br`, `strong`, `em`, `u`, `s`, `h1`-`h6`, `ul`, `ol`, `li`, `blockquote`, `a`, `img`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `code`, `pre`
- Attrs: `href`, `target`, `rel`, `src`, `alt`, `class`, `style` (style chỉ cho color, text-align, font-weight)

**Verify P1:** Tạo product có description chứa `<script>alert(1)</script><img src=x onerror=alert(2)>` → render không alert.

---

### 🚀 P2 — Performance: Migrate `<img>` → `next/image`

**Effort:** 1-2 ngày (lớn nhất, 24 file)
**Risk:** Trung bình (visual diff nếu không cẩn thận)
**Tackles:** PERF-1, PERF-2, PERF-3, PERF-4

**Approach:**
1. **Siết `next.config.ts` trước** (kết hợp với verify image source) — biết được hostname patterns thực tế đang dùng.
2. **Storefront LCP-critical components trước**: HeroBanners, ProductCard, Header logo, ProductGallery.
3. **Storefront non-critical sau**: FloatingContact, NewsHero, NewsList, NewsPopularScroll, CategorySidebar, CategoryShowcase, TopCategoriesGrid.
4. **Admin để cuối hoặc skip** — admin không ảnh hưởng SEO/UX user.

| # | Task | File | DoD |
|---|---|---|---|
| P2.1 | Audit hostname thực tế đang dùng (grep image URLs trong DB hoặc rewritten URLs) | — | Có list hostname cụ thể |
| P2.2 | Update `next.config.ts`: siết `remotePatterns` về whitelist, thêm `images.formats: ['image/avif', 'image/webp']`, `compress: true`, `poweredByHeader: false` | `next.config.ts` | Bỏ wildcard `**`, chỉ allow hostname cụ thể |
| P2.3 | Migrate `HeroBanners.tsx` → `next/image` với `priority`, `sizes`, fill layout giữ aspect ratio | `src/components/storefront/home/HeroBanners.tsx` | LCP element có `priority`, không layout shift |
| P2.4 | Migrate `ProductCard.tsx` → `next/image` với `sizes` (responsive grid) | `src/components/storefront/ProductCard.tsx` | Card grid render đúng kích thước |
| P2.5 | Migrate `Header.tsx` logo → `next/image` (static, priority) | `src/components/storefront/Header.tsx` | Logo crisp, không layout shift |
| P2.6 | Migrate `ProductGallery.tsx` → `next/image` (main + thumbnails) | `src/components/storefront/product/ProductGallery.tsx` | Click thumbnail vẫn đổi main, zoom vẫn work |
| P2.7 | Migrate `CategoryShowcases.tsx` → `next/image` | `src/components/storefront/home/CategoryShowcases.tsx` | — |
| P2.8 | Migrate `TopCategoriesGrid.tsx` → `next/image` | `src/components/storefront/home/TopCategoriesGrid.tsx` | — |
| P2.9 | Migrate `NewsHeroBlock.tsx`, `NewsListBlock.tsx`, `NewsPopularScroll.tsx` → `next/image` | 3 file `news/*` | — |
| P2.10 | Migrate `CategorySidebarAdvanced.tsx` → `next/image` | `src/components/storefront/category/CategorySidebarAdvanced.tsx` | — |
| P2.11 | Migrate `FloatingContact.tsx` → `next/image` (icon nhỏ, không priority) | `src/components/storefront/FloatingContact.tsx` | — |
| P2.12 | Migrate inline `<img>` trong `dat-hang/page.tsx`, `thanh-toan/page.tsx`, `gio-hang/page.tsx` (cart items) → `next/image` | 3 file checkout | — |
| P2.13 | Migrate inline `<img>` trong `(storefront)/san-pham/[slug]/page.tsx` nếu có | Product detail | — |
| P2.14 | (Admin skip hoặc làm cuối) Migrate admin tables: ProductTable, BrandTable, CategoryTable, BannerTable, PostTable, OrderDetailModal, ImageUploader | 7 admin files | Tùy chọn — không ảnh hưởng SEO public |

**Visual verify checklist** (manual, từng component):
- [ ] Aspect ratio giữ nguyên
- [ ] Hover state hoạt động
- [ ] Click handler hoạt động (gallery, carousel)
- [ ] Responsive trên mobile/desktop
- [ ] Loading placeholder không giật

---

### 📌 P3 — JSON-LD Schema Markup đầy đủ

**Effort:** ~1 ngày
**Risk:** Thấp (chỉ thêm `<script type="application/ld+json">`)
**Tackles:** SEO-4, SEO-5, SEO-6, SEO-7, SEO-8

**Approach:** Tạo helper module `src/lib/seo/jsonld.ts` với các builder function, mỗi page gọi 1-2 builder và emit thông qua `dangerouslySetInnerHTML` (an toàn vì là JSON.stringify).

| # | Task | File | DoD |
|---|---|---|---|
| P3.1 | Tạo `src/lib/seo/jsonld.ts` với builders: `buildOrganization()`, `buildWebSite()`, `buildProduct()`, `buildBreadcrumbList()`, `buildArticle()`, `buildItemList()` | New file | Export typed builders, validate với schema.org |
| P3.2 | Inject Organization + WebSite JSON-LD vào root layout (1 lần cho cả site) | `src/app/layout.tsx` | Schema.org Validator passes |
| P3.3 | Fix Product JSON-LD: bỏ `offers` khi `price === 0` (sản phẩm "Liên hệ"), thay bằng `availability: "InStock"` với `priceSpecification` hoặc chỉ Product không Offer | `src/app/(storefront)/san-pham/[slug]/page.tsx` | Google Rich Results Test passes |
| P3.4 | Thêm BreadcrumbList vào product detail page | `src/app/(storefront)/san-pham/[slug]/page.tsx` | Trang → Danh mục → Sản phẩm |
| P3.5 | Thêm BreadcrumbList vào category detail page | `src/app/(storefront)/danh-muc/[slug]/page.tsx` | Trang → Danh mục → Sub-category |
| P3.6 | Thêm BreadcrumbList vào news detail page | `src/app/(storefront)/tin-tuc/[slug]/page.tsx` | Trang → Tin tức → Bài viết |
| P3.7 | Thêm Article JSON-LD vào news detail | `src/app/(storefront)/tin-tuc/[slug]/page.tsx` | Headline, datePublished, author, image |
| P3.8 | Thêm ItemList JSON-LD vào category detail (list of Product) | `src/app/(storefront)/danh-muc/[slug]/page.tsx` | Max 30 products để tránh bloat |

**Verify P3:** Mỗi trang qua [Google Rich Results Test](https://search.google.com/test/rich-results) — báo "Eligible" cho schema tương ứng.

---

### 🧹 P4 — Cleanup Supabase dead code

**Effort:** ~2-3 giờ
**Risk:** Trung bình (cần verify không còn import)
**Tackles:** CLEAN-1, CLEAN-2, CLEAN-3

| # | Task | File | DoD |
|---|---|---|---|
| P4.1 | Audit toàn bộ import `@supabase/*` và `from "@/lib/supabase/*"` trong `src/` | — | List file còn dùng = 0 ngoài `src/lib/supabase/` |
| P4.2 | Xóa 4 file: `src/lib/supabase/static.ts`, `client.ts`, `server.ts`, `middleware.ts` | `src/lib/supabase/` | `rm -rf src/lib/supabase` |
| P4.3 | Gỡ `@supabase/ssr` và `@supabase/supabase-js` khỏi `package.json`, chạy `npm install` | `package.json` | `package-lock.json` không còn `@supabase/*` |
| P4.4 | Verify build: `npm run build` không fail | — | Build pass, không có "module not found" |
| P4.5 | Verify middleware (nếu có dùng supabase/middleware.ts cho session refresh) đã được iron-session thay thế hoàn toàn | `src/middleware.ts` | Login/logout flow vẫn work |

**Verify P4:** Smoke test full storefront + admin login/logout/CRUD. Bundle size giảm ~85KB (kiểm tra `.next/static/chunks` sau build).

---

### ✨ P5 — Polish

**Effort:** ~3-4 giờ
**Risk:** Thấp
**Tackles:** PERF-5, PERF-6, PERF-7, SEO-11

| # | Task | File | DoD |
|---|---|---|---|
| P5.1 | Khai báo `weight` cho Inter font (chỉ `400, 500, 600, 700`) | `src/app/layout.tsx` | Font bundle giảm size |
| P5.2 | Bỏ `subset: vietnamese` nếu site chỉ dùng latin extended (kiểm tra: nội dung tiếng Việt có dấu render OK với latin subset không) | `src/app/layout.tsx` | Test trang có nội dung tiếng Việt |
| P5.3 | Gộp DB queries của HomePage thành 1 Promise.all duy nhất (categories, banners, bestsellers, showcase products) | `src/app/(storefront)/page.tsx` | 3 round-trip → 1-2 round-trip |
| P5.4 | Tăng `generateStaticParams` limit: products 20 → 100, categories 20 → all, posts 10 → 50 | 3 file `[slug]/page.tsx` | Build time tăng nhẹ, ISR cache nóng hơn |
| P5.5 | Thêm `compress: true`, `poweredByHeader: false` vào `next.config.ts` (nếu chưa làm ở P2) | `next.config.ts` | Response header không có `X-Powered-By: Next.js` |

---

## 6. Verification & Acceptance

### Per-phase smoke test (manual)
Sau mỗi phase chạy:
```bash
npm run build
npm start
```
Mở browser, check 3 trang:
1. `/` (home) — HeroBanners render, không layout shift
2. `/san-pham/{slug}` (product detail) — gallery, description, JSON-LD trong source
3. `/danh-muc/{slug}` (category) — product grid, breadcrumb

### Final acceptance criteria
- ✅ [Google Rich Results Test](https://search.google.com/test/rich-results): Product page báo "Product" + "BreadcrumbList" eligible
- ✅ `curl /sitemap.xml` — mỗi URL có `<lastmod>` khác nhau
- ✅ `curl /robots.txt` — disallow đúng `/admin/`, `/login`, `/api/`
- ✅ View source homepage — Organization + WebSite JSON-LD present
- ✅ `grep -rn "<img " src/app src/components/storefront` = 0 results (storefront-only)
- ✅ `npm ls @supabase/ssr` không tìm thấy package
- ✅ Manual XSS test: tạo product description với `<script>alert(1)</script>` → không alert
- ✅ Lighthouse manual run trên home + product detail: Performance ≥ 80, SEO ≥ 95

## 7. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| `next/image` đổi visual layout vì server-side optim format | Test pixel-perfect từng component, dùng `unoptimized` prop nếu cần fallback |
| Sanitize làm mất formatting của react-quill output | Whitelist đủ tag/attr, test với content thật từ DB |
| Xóa Supabase libs break middleware | P4 làm sau khi P0-P3 đã merge, có rollback path qua git |
| `sitemap.ts` cache làm Google index chậm | TTL 1h là balance hợp lý, có thể giảm xuống 15 phút nếu cần |
| `generateStaticParams` tăng làm build time chậm | Monitor build time, nếu > 5 phút thì cắt lại |

## 8. Timeline & Sequencing

```
Day 1 (4-6h): P0 + P1                     ← config + security, low risk
Day 2 (1d):   P2 (storefront LCP-critical) ← HeroBanners, ProductCard, Header, ProductGallery
Day 3 (1d):   P2 (storefront non-critical) ← News, FloatingContact, Categories, Cart
Day 4 (1d):   P3                           ← All JSON-LD
Day 5 (0.5d): P4 + P5                      ← Cleanup + polish + final verify
```

**Total estimate:** 4-5 ngày làm việc full-time, có thể spread thành 1-2 tuần part-time.

## 9. Open questions

- [ ] Có cần thêm `og:type="product"` qua custom `<meta>` tag hay đợi Next.js support? (hiện next/metadata không có `product` type, phải dùng `<head>` raw)
- [ ] `react-quill-new` có output tag nào ngoài whitelist tiêu chuẩn không? Cần check content thực tế trong DB
- [ ] Admin pages có cần migrate `<img>` cùng đợt không? (mặc định: skip, có thể follow-up)

## 10. References

- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Schema.org Product](https://schema.org/Product)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Web.dev LCP](https://web.dev/lcp/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
