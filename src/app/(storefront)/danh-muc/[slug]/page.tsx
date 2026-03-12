import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

    return (
        <div className="bg-slate-100 min-h-screen pb-12">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
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
            </div>

            {/* Header */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
                <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
                    <div className="flex items-center gap-3">
                        {activeCategory.image_url && (
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/20">
                                <img
                                    src={activeCategory.image_url}
                                    alt={activeCategory.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}" trong ${activeCategory.name}` : activeCategory.name}
                            </h1>
                            <p className="mt-0.5 text-sm text-gray-400">
                                {totalCount} sản phẩm
                                {activeCategory.description && (
                                    <span> — {activeCategory.description}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 lg:shrink-0">
                        <CategorySidebarAdvanced
                            categories={categories}
                            brands={brands}
                            activeSlug={activeCategory.slug}
                        />
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
                            <ProductGrid
                                products={products}
                                categoryName={activeCategory.name}
                                totalCount={totalCount}
                                currentPage={currentPage}
                                totalPages={totalPages}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
