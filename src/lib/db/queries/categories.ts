import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, asc, isNull } from "drizzle-orm";
import type { Category, CategoryWithChildren, CategoryInsert, CategoryUpdate } from "@/lib/types/database";
import type { DBCategory } from "@/lib/db/types";

function normalizeCategory(row: DBCategory): Category {
    return {
        ...row,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

// ── Read ─────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
    const rows = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.sort_order));
    return rows.map(normalizeCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const row = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
    });
    if (!row) return null;
    return normalizeCategory(row);
}

export async function getCategoryById(id: string): Promise<Category | null> {
    const row = await db.query.categories.findFirst({
        where: eq(categories.id, id),
    });
    if (!row) return null;
    return normalizeCategory(row);
}

export async function getRootCategories(): Promise<Category[]> {
    const rows = await db
        .select()
        .from(categories)
        .where(isNull(categories.parent_id))
        .orderBy(asc(categories.sort_order));
    return rows.map(normalizeCategory);
}

export function buildCategoryTree(flat: Category[]): CategoryWithChildren[] {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    for (const cat of flat) {
        map.set(cat.id, { ...cat, children: [] });
    }

    for (const node of map.values()) {
        if (node.parent_id) {
            const parent = map.get(node.parent_id);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    return roots.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
    const all = await getAllCategories();
    return buildCategoryTree(all);
}

// ── Write ─────────────────────────────────────────────────────────

export async function createCategory(data: CategoryInsert): Promise<Category> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.insert(categories).values(rest as any).returning();
    return normalizeCategory(rows[0]!);
}

export async function updateCategory(id: string, data: CategoryUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(categories).set(rest as any).where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
}
