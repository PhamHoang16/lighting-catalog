# Handoff Prompt — Tiếp tục Supabase Migration

> Copy block dưới vào agent mới (Claude/GPT/etc) để tiếp tục từ Phase 1.

---

```
Tôi đang migrate dự án lighting-catalog (Next.js 16 e-commerce) ra khỏi Supabase
sang stack self-hosted: PostgreSQL (Docker) + Drizzle ORM + iron-session +
Local FS storage + Server Actions.

Phase 0 (setup + schema + migration scripts) đã DONE — files đã viết, nhưng
chưa run npm install / docker / migrate data thật.

Đọc kỹ file `MIGRATION_PLAN.md` ở root project trước. File này chứa:
- Stack quyết định + lý do (Plan Alpha)
- Schema mapping Supabase → Drizzle (đã làm)
- Roadmap chi tiết Phase 0 → 5 với danh sách files cần tạo/sửa/xóa
- Risk register
- Smoke test plan

Sau khi đọc xong, hãy:

1. Chạy thực sự Phase 0 (commands ở section "Còn phải chạy thực sự"):
   - npm install
   - docker compose up -d
   - npx drizzle-kit push
   - npm run db:seed-admin
   - npm run db:migrate-data
   - mkdir /var/lighting-uploads/{products,categories,brands,banners,posts}
   - npm run db:migrate-storage
   - npm run db:rewrite-urls
   Verify: `npx drizzle-kit studio` thấy đủ data, `ls /var/lighting-uploads/`
   thấy ảnh.

2. Implement lần lượt Phase 1 → 2 → 3 → 4 → 5 theo MIGRATION_PLAN.md.
   Sau mỗi Phase, in checklist verify rồi sang Phase tiếp.

Quy tắc:
- KHÔNG sửa `src/lib/types/database.ts` (component dựa vào types này)
- KHÔNG để TODO/placeholder trong code
- Pattern `unstable_cache(..., { tags, revalidate })` ở Server Components phải
  giữ nguyên — chỉ thay nội dung fetcher
- Server Actions phải `requireAdmin()` đầu tiên + `revalidateTag(...)` sau khi
  mutation
- Client Component KHÔNG được import `@/lib/db` (sẽ leak `pg` vào bundle) —
  mọi DB call phải qua file `'use server'`
- Trước khi sửa symbol nào, chạy gitnexus_impact (CLAUDE.md có hướng dẫn) —
  bắt buộc với HIGH/CRITICAL risk

Project info:
- Stack: Next.js 16 / React 19 / Tailwind 4 / TypeScript 5
- Deploy: 1 VPS Ubuntu 24.04 (6 vCPU/6GB), PM2 + Nginx, port 3000
- 6 bảng business + admin_users mới (xem schema.ts)
- 1 admin duy nhất (auth qua iron-session, không OAuth)
- .env.local đã có DATABASE_URL, SESSION_SECRET, ADMIN_INIT_*, UPLOAD_DIR

Bắt đầu bằng: đọc MIGRATION_PLAN.md → confirm hiểu plan → hỏi tôi có muốn
chạy Phase 0 commands ngay không, hay đi thẳng vào code Phase 1.
```

---

## Files đã được tạo ở Phase 0 (next agent kế thừa)

```
docker-compose.yml
drizzle.config.ts
.env.local                       # secrets random, có cả Supabase legacy
.env.example
scripts/migrate-from-supabase.ts
scripts/migrate-storage.ts
scripts/rewrite-image-urls.ts
scripts/seed-admin.ts
src/lib/db/schema.ts             # 7 bảng + relations
src/lib/db/index.ts              # Pool singleton
src/lib/db/types.ts              # Inferred types
package.json                     # +drizzle, +pg, +iron-session, +bcryptjs, +tsx
```

Files chưa tạo (Phase 1+):
```
src/lib/db/queries/{products,categories,brands,banners,posts,orders}.ts
src/lib/auth/{session,login,logout,require-admin}.ts
src/lib/storage/{local,delete}.ts
src/app/api/upload/route.ts
src/app/actions/admin.ts
```
