// ── Suy luận type từ Drizzle schema ─────────────────────────────
// Re-export với cùng tên ở `@/lib/types/database` để giữ API
// các component không phải sửa.

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
    banners,
    categories,
    brands,
    products,
    orders,
    posts,
    admin_users,
} from "./schema";

export type DBBanner = InferSelectModel<typeof banners>;
export type DBBannerInsert = InferInsertModel<typeof banners>;

export type DBCategory = InferSelectModel<typeof categories>;
export type DBCategoryInsert = InferInsertModel<typeof categories>;

export type DBBrand = InferSelectModel<typeof brands>;
export type DBBrandInsert = InferInsertModel<typeof brands>;

export type DBProduct = InferSelectModel<typeof products>;
export type DBProductInsert = InferInsertModel<typeof products>;

export type DBOrder = InferSelectModel<typeof orders>;
export type DBOrderInsert = InferInsertModel<typeof orders>;

export type DBPost = InferSelectModel<typeof posts>;
export type DBPostInsert = InferInsertModel<typeof posts>;

export type DBAdminUser = InferSelectModel<typeof admin_users>;
export type DBAdminUserInsert = InferInsertModel<typeof admin_users>;
