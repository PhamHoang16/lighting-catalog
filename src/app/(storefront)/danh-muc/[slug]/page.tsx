import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { X, SlidersHorizontal } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { getDescendantIds } from "@/lib/utils";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import CategorySidebarAdvanced from "@/components/storefront/category/CategorySidebarAdvanced";
import ProductGrid from "@/components/storefront/category/ProductGrid";
import ProductGridLoading from "@/components/storefront/category/ProductGridLoading";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getAllCategories, getCategoryBySlug } from "@/lib/db/queries/categories";
import { getAllBrands } from "@/lib/db/queries/brands";
import { getProductsByCategory } from "@/lib/db/queries/products";
import type { Category, Brand } from "@/lib/types/database";

export const revalidate = 86400;

export async function generateStaticParams() {
    const categories = await getAllCategories();
    return categories.slice(0, 20).map((cat) => ({ slug: cat.slug }));
}

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ── SEO ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) return { title: "Danh mục không tồn tại" };

    const description = `Sản phẩm ${category.name} tại ${siteConfig.name}. Nhận báo giá và tư vấn miễn phí.`;
    const url = `${siteConfig.url}/danh-muc/${slug}`;
    const imageUrl = category.image_url || `${siteConfig.url}/icon.jpg`;

    return {
        title: category.name,
        description: description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: category.name,
            description: description,
            url: url,
            siteName: siteConfig.name,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 600,
                    alt: category.name,
                },
            ],
            locale: "vi_VN",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: category.name,
            description: description,
            images: [imageUrl],
        },
    };
}

// ── Cached Metadata ──────────────────────────────────────────────
const getMetadata = unstable_cache(
    async (slug: string) => {
        const [activeCategory, allCategories, brands] = await Promise.all([
            getCategoryBySlug(slug),
            getAllCategories(),
            getAllBrands(),
        ]);

        if (!activeCategory) return null;

        const parentCategory = activeCategory.parent_id
            ? allCategories.find((c) => c.id === activeCategory.parent_id) ?? null
            : null;

        return { activeCategory, parentCategory, categories: allCategories, brands };
    },
    ["category-detail-metadata"],
    { revalidate: 3600, tags: ["categories", "brands"] }
);

// ── Cached Products ──────────────────────────────────────────────
const getProducts = unstable_cache(
    async (
        activeCategoryId: string,
        categoriesSerialized: string,
        brandsSerialized: string,
        brandSlugsSerialized: string = "",
        minPrice?: number,
        maxPrice?: number,
        searchQuery?: string,
        page: number = 1,
        limit: number = 20,
        sort: string = "featured"
    ) => {
        const allCategories: Category[] = JSON.parse(categoriesSerialized);
        const brands: Brand[] = JSON.parse(brandsSerialized);
        const brandSlugs = brandSlugsSerialized ? brandSlugsSerialized.split(",") : undefined;
        const brandIds = brandSlugs && brandSlugs.length > 0
            ? brands.filter(b => brandSlugs.includes(b.slug)).map(b => b.id)
            : undefined;

        const categoryIds = getDescendantIds(activeCategoryId, allCategories);

        return getProductsByCategory({
            categoryIds,
            brandIds,
            minPrice: minPrice && !isNaN(minPrice) ? minPrice : undefined,
            maxPrice: maxPrice && !isNaN(maxPrice) ? maxPrice : undefined,
            searchQuery,
            page,
            limit,
            sort: sort as any,
        });
    },
    ["category-detail-products"],
    { revalidate: 3600, tags: ["products"] }
);

// ── Intermediate Server Components for Suspense ────────────────
async function ProductsCountInHeaderDetail({ activeCategoryId, categories, brands, brandSlugs, minPrice, maxPrice, searchQuery, currentPage, currentSort }: any) {
    const { totalCount } = await getProducts(activeCategoryId, JSON.stringify(categories), JSON.stringify(brands), brandSlugs?.join(','), minPrice, maxPrice, searchQuery, currentPage, 20, currentSort);
    return (
        <span className="text-sm font-bold text-gray-700 animate-in fade-in duration-300">
            <span className="text-amber-600 text-lg mr-1">{totalCount}</span> sản phẩm
        </span>
    );
}

async function ProductGridLoaderDetail({ activeCategoryId, categories, brands, brandSlugs, minPrice, maxPrice, searchQuery, currentPage, currentSort, hasFilters, activeCategoryName }: any) {
    const { products, totalCount, totalPages } = await getProducts(activeCategoryId, JSON.stringify(categories), JSON.stringify(brands), brandSlugs?.join(','), minPrice, maxPrice, searchQuery, currentPage, 20, currentSort);
    return (
        <div className="animate-in fade-in duration-500">
            <ProductGrid
                products={products}
                categoryName={activeCategoryName}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                hasFilters={hasFilters}
            />
        </div>
    );
}

// ── Page ────────────────────────────────────────────────────────
export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const search = await searchParams;

    const brandParam = search.brands;
    const brandSlugs = typeof brandParam === "string"
        ? brandParam.split(",").filter(Boolean)
        : undefined;

    const minPriceParam = search.minPrice;
    const minPrice = typeof minPriceParam === "string" ? parseInt(minPriceParam, 10) : undefined;

    const maxPriceParam = search.maxPrice;
    const maxPrice = typeof maxPriceParam === "string" ? parseInt(maxPriceParam, 10) : undefined;

    const pageParam = search.page;
    const currentPage = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;
    const sortParam = search.sort;
    const currentSort = typeof sortParam === "string" ? sortParam : "featured";

    const qParam = search.q;
    const searchQuery = typeof qParam === "string" ? qParam : undefined;

    const data = await getMetadata(slug);
    if (!data) notFound();

    const { activeCategory, parentCategory, categories, brands } = data;
    const hasFilters = (brandSlugs && brandSlugs.length > 0) || !isNaN(minPrice ?? NaN) || !isNaN(maxPrice ?? NaN) || !!searchQuery;

    const buildQueryString = (keyToUpdate: string, newValue: string | null) => {
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
            {/* ── Dynamic Hero Header ── */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

                <div className="relative mx-auto max-w-[1440px] px-4 py-3 sm:py-6 sm:px-6">
                    <div className="mb-2 sm:mb-6">
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

                    <div className="flex flex-row items-center justify-between gap-3 pb-3 sm:flex-col sm:items-start sm:flex-row sm:items-end sm:gap-6 sm:pb-4">
                        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                            {activeCategory.image_url && (
                                <div className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-gray-100 bg-white shadow-sm p-0.5 sm:p-1">
                                    <img
                                        src={activeCategory.image_url}
                                        alt={activeCategory.name}
                                        className="h-full w-full object-cover rounded-lg sm:rounded-xl"
                                    />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-xl font-black text-gray-900 tracking-tight sm:text-4xl truncate">
                                    {searchQuery ? `Tìm kiếm: "${searchQuery}"` : activeCategory.name}
                                </h1>
                                <p className="hidden sm:block mt-1.5 text-sm sm:text-base text-gray-500 max-w-2xl font-medium">
                                    {(activeCategory as any).description
                                        ? (activeCategory as any).description
                                        : `Khám phá các sản phẩm ${activeCategory.name.toLowerCase()} chất lượng cao, đa dạng mẫu mã và bảo hành dài hạn.`}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 bg-gray-50/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200/60 inline-flex items-center justify-center">
                            <Suspense fallback={<div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />}>
                                <ProductsCountInHeaderDetail
                                    activeCategoryId={activeCategory.id}
                                    categories={categories}
                                    brands={brands}
                                    brandSlugs={brandSlugs}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    searchQuery={searchQuery}
                                    currentPage={currentPage}
                                    currentSort={currentSort}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-[1440px] px-4 py-4 sm:py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">

                    <div className="lg:w-[280px] lg:shrink-0">
                        <CategorySidebarAdvanced
                            categories={categories}
                            brands={brands}
                            activeSlug={activeCategory.slug}
                        />
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">

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
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                                        >
                                            Thương hiệu: {b.name} <X className="h-3 w-3" />
                                        </Link>
                                    );
                                })}

                                {minPrice !== undefined && (
                                    <Link href={buildQueryString('minPrice', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                        Từ: {minPrice.toLocaleString()}đ <X className="h-3 w-3" />
                                    </Link>
                                )}

                                {maxPrice !== undefined && (
                                    <Link href={buildQueryString('maxPrice', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                        Đến: {maxPrice.toLocaleString()}đ <X className="h-3 w-3" />
                                    </Link>
                                )}

                                {searchQuery && (
                                    <Link href={buildQueryString('q', null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                        Từ khóa: "{searchQuery}" <X className="h-3 w-3" />
                                    </Link>
                                )}

                                <Link href="?" className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700 underline underline-offset-2 shrink-0">
                                    Xóa tất cả
                                </Link>
                            </div>
                        )}

                        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100 flex-1">
                            <Suspense key={JSON.stringify(search)} fallback={<ProductGridLoading />}>
                                <ProductGridLoaderDetail
                                    activeCategoryId={activeCategory.id}
                                    categories={categories}
                                    brands={brands}
                                    brandSlugs={brandSlugs}
                                    minPrice={minPrice}
                                    maxPrice={maxPrice}
                                    searchQuery={searchQuery}
                                    currentPage={currentPage}
                                    currentSort={currentSort}
                                    hasFilters={hasFilters}
                                    activeCategoryName={activeCategory.name}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
