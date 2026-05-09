import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Banner, BannerInsert, BannerUpdate } from "@/lib/types/database";
import type { DBBanner } from "@/lib/db/types";

function normalizeBanner(row: DBBanner): Banner {
    return {
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

export async function getActiveBanners(): Promise<Banner[]> {
    const rows = await db
        .select()
        .from(banners)
        .where(eq(banners.is_active, true))
        .orderBy(asc(banners.sort_order));
    return rows.map(normalizeBanner);
}

export async function getAllBannersForAdmin(): Promise<Banner[]> {
    const rows = await db
        .select()
        .from(banners)
        .orderBy(asc(banners.sort_order));
    return rows.map(normalizeBanner);
}

// ── Write ─────────────────────────────────────────────────────────

export async function createBanner(data: BannerInsert): Promise<Banner> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.insert(banners).values(rest as any).returning();
    return normalizeBanner(rows[0]!);
}

export async function updateBanner(id: string, data: BannerUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(banners).set(rest as any).where(eq(banners.id, id));
}

export async function deleteBanner(id: string): Promise<void> {
    await db.delete(banners).where(eq(banners.id, id));
}
