import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";
import {
    eq, desc, asc, ilike, inArray, ne, and, gte, lte,
    count as sqlCount, sql,
} from "drizzle-orm";
import type {
    Product, ProductWithCategory, ProductWithRelations,
    ProductInsert, ProductUpdate,
} from "@/lib/types/database";
import type { DBProduct } from "@/lib/db/types";

// Drizzle numeric → string, timestamp → Date. Normalize to match database.ts types.
function normalizeProduct(row: DBProduct): Product {
    return {
        ...row,
        price: Number(row.price),
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    };
}

type DBProductWithRel = DBProduct & {
    categories: { id: string; name: string; slug: string; parent_id: string | null; image_url: string | null; description: string | null; sort_order: number; created_at: Date } | null;
    brands: { id: string; name: string; slug: string; logo_url: string | null; created_at: Date } | null;
};

function normalizeWithRelations(row: DBProductWithRel): ProductWithRelations {
    return {
        ...normalizeProduct(row),
        categories: row.categories
            ? { name: row.categories.name, slug: row.categories.slug }
            : null,
        brands: row.brands
            ? { name: row.brands.name, slug: row.brands.slug, logo_url: row.brands.logo_url }
            : null,
    };
}

function normalizeWithCategory(row: DBProductWithRel): ProductWithCategory {
    return {
        ...normalizeProduct(row),
        categories: row.categories
            ? { name: row.categories.name, slug: row.categories.slug }
            : null,
    };
}

// ── Read ─────────────────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    const row = await db.query.products.findFirst({
        where: eq(products.slug, slug),
        with: { categories: true, brands: true },
    });
    if (!row) return null;
    return normalizeWithRelations(row as DBProductWithRel);
}

export async function getProductById(id: string): Promise<Product | null> {
    const row = await db.query.products.findFirst({
        where: eq(products.id, id),
    });
    if (!row) return null;
    return normalizeProduct(row);
}

export async function getProductSlugs(limit = 20): Promise<{ slug: string }[]> {
    return db
        .select({ slug: products.slug })
        .from(products)
        .orderBy(desc(products.created_at))
        .limit(limit);
}

export async function getLatestProducts(limit = 8): Promise<ProductWithCategory[]> {
    const rows = await db.query.products.findMany({
        orderBy: [desc(products.created_at)],
        limit,
        with: { categories: true },
    });
    return rows.map(r => normalizeWithCategory(r as DBProductWithRel));
}

export async function getBestSellers(limit = 20): Promise<Product[]> {
    const rows = await db
        .select()
        .from(products)
        .where(eq(products.is_best_seller, true))
        .orderBy(desc(products.created_at))
        .limit(limit);
    return rows.map(normalizeProduct);
}

export async function getAllProductsForShowcase(categoryIds: string[]): Promise<Product[]> {
    if (categoryIds.length === 0) return [];
    const rows = await db
        .select()
        .from(products)
        .where(inArray(products.category_id, categoryIds));
    return rows.map(normalizeProduct);
}

export async function getRelatedProducts(currentId: string, categoryId: string, limit = 5): Promise<Product[]> {
    const rows = await db
        .select()
        .from(products)
        .where(and(eq(products.category_id, categoryId), ne(products.id, currentId)))
        .orderBy(desc(products.created_at))
        .limit(limit);
    return rows.map(normalizeProduct);
}

interface ProductsForCategoryParams {
    categoryIds: string[];
    brandIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "price-asc" | "price-desc" | "featured";
}

export async function getProductsByCategory(params: ProductsForCategoryParams): Promise<{
    products: Product[];
    totalCount: number;
    totalPages: number;
}> {
    const { categoryIds, brandIds, minPrice, maxPrice, searchQuery, page = 1, limit = 20, sort = "featured" } = params;

    if (categoryIds.length === 0) return { products: [], totalCount: 0, totalPages: 1 };

    const conditions = [inArray(products.category_id, categoryIds)];
    if (brandIds && brandIds.length > 0) conditions.push(inArray(products.brand_id, brandIds));
    if (minPrice !== undefined) conditions.push(gte(products.price, String(minPrice)));
    if (maxPrice !== undefined) conditions.push(lte(products.price, String(maxPrice)));
    if (searchQuery) conditions.push(ilike(products.name, `%${searchQuery}%`));

    const where = and(...conditions);

    const orderBy = (() => {
        switch (sort) {
            case "newest": return [desc(products.created_at)];
            case "oldest": return [asc(products.created_at)];
            case "price-asc": return [asc(products.price)];
            case "price-desc": return [desc(products.price)];
            default: return [asc(products.sort_order), desc(products.created_at)];
        }
    })();

    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
        db.select().from(products).where(where).orderBy(...orderBy).limit(limit).offset(offset),
        db.select({ count: sqlCount() }).from(products).where(where),
    ]);

    const totalCount = Number(countResult[0]?.count ?? 0);
    return {
        products: rows.map(normalizeProduct),
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
    };
}

interface AdminProductsParams {
    searchTerm?: string;
    categoryId?: string;
    bestSellerOnly?: boolean;
    sortColumn?: string;
    sortAscending?: boolean;
    page?: number;
    pageSize?: number;
}

export async function getProductsForAdmin(params: AdminProductsParams = {}): Promise<{
    data: ProductWithCategory[];
    count: number;
}> {
    const { searchTerm, categoryId, bestSellerOnly, sortColumn = "created_at", sortAscending = false, page = 0, pageSize = 10 } = params;

    const conditions = [];
    if (searchTerm) conditions.push(ilike(products.name, `%${searchTerm}%`));
    if (categoryId) conditions.push(eq(products.category_id, categoryId));
    if (bestSellerOnly) conditions.push(eq(products.is_best_seller, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const colMap: Record<string, typeof products.created_at | typeof products.sort_order | typeof products.price | typeof products.name> = {
        created_at: products.created_at,
        sort_order: products.sort_order,
        price: products.price,
        name: products.name,
    };
    const col = colMap[sortColumn] ?? products.created_at;
    const orderFn = sortAscending ? asc : desc;

    const offset = page * pageSize;

    const [rows, countResult] = await Promise.all([
        db.query.products.findMany({
            where,
            with: { categories: true },
            orderBy: orderFn(col),
            limit: pageSize,
            offset,
        }),
        db.select({ count: sqlCount() }).from(products).where(where),
    ]);

    return {
        data: rows.map((r) => normalizeWithCategory(r as DBProductWithRel)),
        count: Number(countResult[0]?.count ?? 0),
    };
}

// ── Write ─────────────────────────────────────────────────────────

export async function createProduct(data: ProductInsert): Promise<Product> {
    const { created_at: _, ...rest } = data;
    const rows = await db
        .insert(products)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values({ ...(rest as any), price: String(data.price) })
        .returning();
    return normalizeProduct(rows[0]!);
}

export async function updateProduct(id: string, data: ProductUpdate): Promise<void> {
    const { created_at: _, ...rest } = data;
    const values: Record<string, unknown> = { ...rest };
    if (data.price !== undefined) values.price = String(data.price);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(products).set(values as any).where(eq(products.id, id));
}

export async function deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
}

export async function toggleBestSeller(id: string, value: boolean): Promise<void> {
    await db.update(products).set({ is_best_seller: value }).where(eq(products.id, id));
}

export async function updateSortOrder(id: string, sortOrder: number): Promise<void> {
    await db.update(products).set({ sort_order: sortOrder }).where(eq(products.id, id));
}

export async function bulkInsertProducts(rows: ProductInsert[]): Promise<void> {
    if (rows.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const values = rows.map(({ created_at: _, ...r }) => ({ ...(r as any), price: String(r.price) }));
    await db.insert(products).values(values).onConflictDoNothing();
}
