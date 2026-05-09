import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Brand, BrandInsert, BrandUpdate } from "@/lib/types/database";
import type { DBBrand } from "@/lib/db/types";

function normalizeBrand(row: DBBrand): Brand {
    return {
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

export async function getAllBrands(): Promise<Brand[]> {
    const rows = await db
        .select()
        .from(brands)
        .orderBy(asc(brands.name));
    return rows.map(normalizeBrand);
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
    const row = await db.query.brands.findFirst({
        where: eq(brands.slug, slug),
    });
    if (!row) return null;
    return normalizeBrand(row);
}

// ── Write ─────────────────────────────────────────────────────────

export async function createBrand(data: BrandInsert): Promise<Brand> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.insert(brands).values(rest as any).returning();
    return normalizeBrand(rows[0]!);
}

export async function updateBrand(id: string, data: BrandUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(brands).set(rest as any).where(eq(brands.id, id));
}

export async function deleteBrand(id: string): Promise<void> {
    await db.delete(brands).where(eq(brands.id, id));
}
