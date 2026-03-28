import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { X, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { getDescendantIds } from "@/lib/utils";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import CategorySidebarAdvanced from "@/components/storefront/category/CategorySidebarAdvanced";
import ProductGrid from "@/components/storefront/category/ProductGrid";
import type { Category, Product, Brand } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ── SEO ─────────────────────────────────────────────────────────
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: category } = await supabase
        .from("categories")
        .select("name")
        .eq("slug", slug)
        .single();

    if (!category) {
        return { title: "Danh mục không tồn tại" };
    }

    return {
        title: category.name,
        description: `Sản phẩm ${category.name} tại ${siteConfig.name}. Nhận báo giá và tư vấn miễn phí.`,
    };
}

// ── Data ────────────────────────────────────────────────────────
async function getData(
    slug: string,
    brandSlugs?: string[],
    minPrice?: number,
    maxPrice?: number,
    searchQuery?: string,
    page: number = 1,
    limit: number = 20,
    sort: string = "newest"
) {
    const supabase = await createClient();

    // 1. Get the target category
    const { data: activeCategory } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!activeCategory) return null;

    // 2. Get all categories (for sidebar + descendant calculation)
    const { data: allCategories } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    const categories = (allCategories as Category[]) ?? [];

    // 3. Get all brands for filter
    const { data: allBrands } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

    const brands = (allBrands as Brand[]) ?? [];

    // 4. Get descendant category IDs (includes self)
    const categoryIds = getDescendantIds(activeCategory.id, categories);

    // 5. Fetch products matching category IDs with exact count
    let productsQuery = supabase
        .from("products")
        .select("*", { count: "exact" })
        .in("category_id", categoryIds);

    // 6. Apply brand filter if specified
    if (brandSlugs && brandSlugs.length > 0) {
        const brandIds = brands
            .filter((b) => brandSlugs.includes(b.slug))
            .map((b) => b.id);

        if (brandIds.length > 0) {
            productsQuery = productsQuery.in("brand_id", brandIds);
        }
    }

    // Apply price filter
    if (minPrice !== undefined && !isNaN(minPrice)) {
        productsQuery = productsQuery.gte("price", minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
        productsQuery = productsQuery.lte("price", maxPrice);
    }

    // Apply text search filter
    if (searchQuery) {
        productsQuery = productsQuery.ilike("name", `%${searchQuery}%`);
    }

    // Sorting
    switch (sort) {
        case "oldest": productsQuery = productsQuery.order("created_at", { ascending: true }); break;
        case "price-asc": productsQuery = productsQuery.order("price", { ascending: true }); break;
        case "price-desc": productsQuery = productsQuery.order("price", { ascending: false }); break;
        case "newest":
        default: productsQuery = productsQuery.order("created_at", { ascending: false }); break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    productsQuery = productsQuery.range(from, to);

    const { data: products, count } = await productsQuery;

    // 7. Build breadcrumbs
    const parentCategory = activeCategory.parent_id
        ? categories.find((c) => c.id === activeCategory.parent_id) ?? null
        : null;

    return {
        activeCategory: activeCategory as Category,
        parentCategory,
        categories,
        brands,
        products: (products as Product[]) ?? [],
        totalCount: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 1
    };
}

// ── Page ────────────────────────────────────────────────────────
export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const search = await searchParams;

    // Parse brand filters from query params
    const brandParam = search.brands;
    const brandSlugs = typeof brandParam === "string"
        ? brandParam.split(",").filter(Boolean)
        : undefined;

    // Parse price filters
    const minPriceParam = search.minPrice;
    const minPrice = typeof minPriceParam === "string" ? parseInt(minPriceParam, 10) : undefined;

    const maxPriceParam = search.maxPrice;
    const maxPrice = typeof maxPriceParam === "string" ? parseInt(maxPriceParam, 10) : undefined;

    // Parse pagination and sorting
    const pageParam = search.page;
    const currentPage = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
    const sortParam = search.sort;
    const currentSort = typeof sortParam === "string" ? sortParam : "newest";

    const qParam = search.q;
    const searchQuery = typeof qParam === "string" ? qParam : undefined;

    const data = await getData(slug, brandSlugs, minPrice, maxPrice, searchQuery, currentPage, 20, currentSort);

    if (!data) notFound();

    const { activeCategory, parentCategory, categories, brands, products, totalCount, totalPages } = data;
    const hasFilters = (brandSlugs && brandSlugs.length > 0) || !isNaN(minPrice ?? NaN) || !isNaN(maxPrice ?? NaN) || !!searchQuery;

    const buildQueryString = (keyToUpdate: string, newValue: string | null) => {
        // Safe cast since we know our URL structure uses simple strings
        const params = new URLSearchParams(search as Record<string, string>);
        if (newValue === null || newValue === "") {
            params.delete(keyToUpdate);
        } else {
            params.set(keyToUpdate, newValue);
        }
        return `?${params.toString()}`;
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* ── Dynamic Hero Header ────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                {/* Decorative Pattern / Glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                <div className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
                    {/* Breadcrumbs integraded inside Hero */}
                    <div className="mb-6">
                        <Breadcrumbs
                            items={[
                                { label: "Danh mục", href: "/danh-muc" },
                                ...(parentCategory
                                    ? [{ label: parentCategory.name, href: `/danh-muc/${parentCategory.slug}` }]
                                    : []),
                                { label: activeCategory.name },
                            ]}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4">
                        <div className="flex items-center gap-4">
                            {activeCategory.image_url && (
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm p-1">
                                    <img
                                        src={activeCategory.image_url}
                                        alt={activeCategory.name}
                                        className="h-full w-full object-cover rounded-xl"
                                    />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
                                    {searchQuery ? `Tìm kiếm: "${searchQuery}"` : activeCategory.name}
                                </h1>
                                <p className="mt-1.5 text-sm sm:text-base text-gray-500 max-w-2xl font-medium">
                                    {activeCategory.description 
                                        ? activeCategory.description 
                                        : `Khám phá các sản phẩm ${activeCategory.name.toLowerCase()} chất lượng cao, đa dạng mẫu mã và bảo hành dài hạn.`}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-200/60 inline-flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">
                                <span className="text-amber-600 text-lg mr-1">{totalCount}</span> sản phẩm
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content (Filters & Grid) ────────────────────────────── */}
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    
                    {/* Sidebar Filter */}
                    <div className="lg:w-[280px] lg:shrink-0">
                        <CategorySidebarAdvanced
                            categories={categories}
                            brands={brands}
                            activeSlug={activeCategory.slug}
                        />
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        
                        {/* Active Filters Display Toolbar (if any) */}
                        {hasFilters && (
                            <div className="mb-6 flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <span className="text-xs font-semibold uppercase text-gray-400 mr-2 flex items-center gap-1.5 shrink-0">
                                    <SlidersHorizontal className="w-3.5 h-3.5" /> Bộ lọc đang chọn:
                                </span>
                                
                                {brandSlugs?.map(slug => {
                                    const b = brands.find(br => br.slug === slug);
                                    if (!b) return null;
                                    const newBrands = brandSlugs.filter(s => s !== slug).join(',');
                                    return (
                                        <Link 
                                            key={slug} 
                                            href={buildQueryString('brands', newBrands)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                                        >
                                            Thương hiệu: {b.name} <X className="h-3 w-3" />
                                        </Link>
                                    );
                                })}

                                {minPrice !== undefined && (
                                    <Link 
                                        href={buildQueryString('minPrice', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                                    >
                                        Từ: {(minPrice).toLocaleString()}đ <X className="h-3 w-3" />
                                    </Link>
                                )}

                                {maxPrice !== undefined && (
                                    <Link 
                                        href={buildQueryString('maxPrice', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                                    >
                                        Đến: {(maxPrice).toLocaleString()}đ <X className="h-3 w-3" />
                                    </Link>
                                )}
                                
                                {searchQuery && (
                                    <Link 
                                        href={buildQueryString('q', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                                    >
                                        Từ khóa: "{searchQuery}" <X className="h-3 w-3" />
                                    </Link>
                                )}

                                <Link href="?" className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2 shrink-0">
                                    Xóa tất cả
                                </Link>
                            </div>
                        )}

                        {/* Grid */}
                        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100 flex-1">
                            <ProductGrid
                                products={products}
                                categoryName={activeCategory.name}
                                totalCount={totalCount}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                hasFilters={hasFilters}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
