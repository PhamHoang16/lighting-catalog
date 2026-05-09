"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import * as bannerQ from "@/lib/db/queries/banners";
import * as categoryQ from "@/lib/db/queries/categories";
import * as brandQ from "@/lib/db/queries/brands";
import * as productQ from "@/lib/db/queries/products";
import * as postQ from "@/lib/db/queries/posts";
import * as orderQ from "@/lib/db/queries/orders";
import { db } from "@/lib/db";
import { categories, orders } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import type {
    BannerInsert, BannerUpdate,
    CategoryInsert, CategoryUpdate,
    BrandInsert, BrandUpdate,
    ProductInsert, ProductUpdate,
    PostInsert, PostUpdate,
    OrderInsert, OrderStatus,
    OrderItem,
} from "@/lib/types/database";

// ── Helpers ───────────────────────────────────────────────────────
function errMsg(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}

function isUniqueViolation(e: unknown): boolean {
    return (e as { code?: string })?.code === "23505";
}

function isFKViolation(e: unknown): boolean {
    return (e as { code?: string })?.code === "23503";
}

// ── Banners ───────────────────────────────────────────────────────

export async function getBannersAction() {
    await requireAdmin();
    return bannerQ.getAllBannersForAdmin();
}

export async function saveBannerAction(
    id: string | null,
    data: BannerInsert | BannerUpdate
): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        if (id) {
            await bannerQ.updateBanner(id, data as BannerUpdate);
        } else {
            await bannerQ.createBanner(data as BannerInsert);
        }
        revalidateTag("banners", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function deleteBannerAction(id: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await bannerQ.deleteBanner(id);
        revalidateTag("banners", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

// ── Categories ────────────────────────────────────────────────────

export async function getCategoriesAction() {
    await requireAdmin();
    return categoryQ.getAllCategories();
}

export async function getCategoryByIdAction(id: string) {
    await requireAdmin();
    return categoryQ.getCategoryById(id);
}

export async function saveCategoryAction(
    id: string | null,
    data: CategoryInsert | CategoryUpdate
): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        if (id) {
            await categoryQ.updateCategory(id, data as CategoryUpdate);
        } else {
            // Auto sort_order: max + 1 among siblings
            const all = await categoryQ.getAllCategories();
            const siblings = all.filter(c => c.parent_id === ((data as CategoryInsert).parent_id ?? null));
            const maxSort = siblings.reduce((m, c) => Math.max(m, c.sort_order), -1);
            await categoryQ.createCategory({ ...(data as CategoryInsert), sort_order: maxSort + 1 });
        }
        revalidateTag("categories", "server");
        return {};
    } catch (e) {
        if (isUniqueViolation(e)) return { error: "Slug đã tồn tại. Vui lòng đổi tên khác." };
        return { error: errMsg(e) };
    }
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await categoryQ.deleteCategory(id);
        revalidateTag("categories", "server");
        return {};
    } catch (e) {
        if (isFKViolation(e)) return { error: "Không thể xóa danh mục này vì đang có sản phẩm liên kết." };
        return { error: errMsg(e) };
    }
}

export async function saveCategorySortOrderAction(
    updates: { id: string; sort_order: number }[]
): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await Promise.all(
            updates.map(({ id, sort_order }) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                db.update(categories).set({ sort_order } as any).where(eq(categories.id, id))
            )
        );
        revalidateTag("categories", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

// ── Brands ────────────────────────────────────────────────────────

export async function getBrandsAction() {
    await requireAdmin();
    return brandQ.getAllBrands();
}

export async function saveBrandAction(
    id: string | null,
    data: BrandInsert | BrandUpdate
): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        if (id) {
            await brandQ.updateBrand(id, data as BrandUpdate);
        } else {
            await brandQ.createBrand(data as BrandInsert);
        }
        revalidateTag("brands", "server");
        return {};
    } catch (e) {
        if (isUniqueViolation(e)) return { error: "Slug đã tồn tại. Vui lòng đổi tên khác." };
        return { error: errMsg(e) };
    }
}

export async function deleteBrandAction(id: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await brandQ.deleteBrand(id);
        revalidateTag("brands", "server");
        return {};
    } catch (e) {
        if (isFKViolation(e)) return { error: "Không thể xóa thương hiệu này vì đang có sản phẩm liên kết." };
        return { error: errMsg(e) };
    }
}

// ── Products ──────────────────────────────────────────────────────

export async function getProductsForAdminAction(params: Parameters<typeof productQ.getProductsForAdmin>[0] = {}) {
    await requireAdmin();
    return productQ.getProductsForAdmin(params);
}

export async function getProductByIdAction(id: string) {
    await requireAdmin();
    return productQ.getProductById(id);
}

export async function getAdminFormDataAction() {
    await requireAdmin();
    const [cats, brands] = await Promise.all([
        categoryQ.getAllCategories(),
        brandQ.getAllBrands(),
    ]);
    return {
        categories: cats.map(c => ({ id: c.id, name: c.name })),
        brands: brands.map(b => ({ id: b.id, name: b.name })),
    };
}

export async function saveProductAction(
    id: string | null,
    data: ProductInsert | ProductUpdate
): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        let slug: string | undefined;
        if (id) {
            await productQ.updateProduct(id, data as ProductUpdate);
            slug = (data as ProductUpdate).slug;
        } else {
            const created = await productQ.createProduct(data as ProductInsert);
            slug = created.slug;
        }
        revalidateTag("products", "server");
        if (slug) revalidateTag(`product-${slug}`, "server");
        return {};
    } catch (e) {
        if (isUniqueViolation(e)) return { error: "Slug đã tồn tại. Vui lòng đổi tên khác." };
        return { error: errMsg(e) };
    }
}

export async function deleteProductAction(id: string, slug?: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        const product = slug ? null : await productQ.getProductById(id);
        await productQ.deleteProduct(id);
        revalidateTag("products", "server");
        const productSlug = slug ?? product?.slug;
        if (productSlug) revalidateTag(`product-${productSlug}`, "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function toggleBestSellerAction(id: string, value: boolean): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await productQ.toggleBestSeller(id, value);
        revalidateTag("products", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function updateProductSortOrderAction(id: string, sortOrder: number): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await productQ.updateSortOrder(id, sortOrder);
        revalidateTag("products", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function bulkImportProductsAction(rows: ProductInsert[]): Promise<{ error?: string; count?: number }> {
    await requireAdmin();
    try {
        await productQ.bulkInsertProducts(rows);
        revalidateTag("products", "server");
        return { count: rows.length };
    } catch (e) {
        return { error: errMsg(e) };
    }
}

// ── Posts ─────────────────────────────────────────────────────────

export async function getPostsAction() {
    await requireAdmin();
    return postQ.getAllPostsForAdmin();
}

export async function savePostAction(
    id: string | null,
    data: PostInsert | PostUpdate
): Promise<{ error?: string; slug?: string }> {
    await requireAdmin();
    try {
        let slug: string | undefined;
        if (id) {
            await postQ.updatePost(id, data as PostUpdate);
            slug = (data as PostUpdate).slug;
        } else {
            const created = await postQ.createPost(data as PostInsert);
            slug = created.slug;
        }
        revalidateTag("posts", "server");
        if (slug) revalidateTag(`post-${slug}`, "server");
        return { slug };
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function deletePostAction(id: string, slug?: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await postQ.deletePost(id);
        revalidateTag("posts", "server");
        if (slug) revalidateTag(`post-${slug}`, "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

// ── Orders ────────────────────────────────────────────────────────

export async function getOrdersAction(params: Parameters<typeof orderQ.getOrders>[0] = {}) {
    await requireAdmin();
    return orderQ.getOrders(params);
}

export async function getOrderByIdAction(id: string) {
    await requireAdmin();
    return orderQ.getOrderById(id);
}

export async function updateOrderStatusAction(id: string, status: OrderStatus): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await orderQ.updateOrderStatus(id, status);
        revalidateTag("orders", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

export async function deleteOrderAction(id: string): Promise<{ error?: string }> {
    await requireAdmin();
    try {
        await db.delete(orders).where(eq(orders.id, id));
        revalidateTag("orders", "server");
        return {};
    } catch (e) {
        return { error: errMsg(e) };
    }
}

// ── Storefront order creation (no auth required) ───────────────────

export async function createOrderAction(data: {
    customer_name: string;
    phone: string;
    title?: string;
    message?: string | null;
    delivery_method?: string;
    address?: string | null;
    card_at_home?: boolean;
    invoice_company?: boolean;
    total_amount: number;
    items: OrderItem[];
}): Promise<{ error?: string }> {
    try {
        await orderQ.createOrder(data as OrderInsert);
        return {};
    } catch (e) {
        return { error: e instanceof Error ? e.message : "Lỗi khi đặt hàng." };
    }
}

// ── Dashboard stats ────────────────────────────────────────────────

export async function getDashboardStatsAction() {
    await requireAdmin();
    const [categoryCount, productCount, orderCount, pendingCount, recentRes] =
        await Promise.all([
            db.select({ count: count() }).from(categories).then(r => Number(r[0]?.count ?? 0)),
            db.select({ count: count() }).from(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (await import("@/lib/db/schema")).products as any
            ).then(r => Number((r as any[])[0]?.count ?? 0)),
            db.select({ count: count() }).from(orders).then(r => Number(r[0]?.count ?? 0)),
            db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")).then(r => Number(r[0]?.count ?? 0)),
            db.select({
                id: orders.id,
                customer_name: orders.customer_name,
                total_amount: orders.total_amount,
                status: orders.status,
                created_at: orders.created_at,
            }).from(orders).orderBy(desc(orders.created_at)).limit(5),
        ]);

    return {
        categoryCount,
        productCount,
        orderCount,
        pendingOrderCount: pendingCount,
        recentOrders: recentRes.map(r => ({
            ...r,
            total_amount: Number(r.total_amount),
            created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
        })),
    };
}
