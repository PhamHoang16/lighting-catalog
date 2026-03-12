import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { buildCategoryTree } from "@/lib/utils";
import CategorySidebarAdvanced from "@/components/storefront/category/CategorySidebarAdvanced";
import ProductGrid from "@/components/storefront/category/ProductGrid";
import type { Category, CategoryWithChildren, Brand, Product } from "@/lib/types/database";

export const metadata: Metadata = {
    title: "Danh mục sản phẩm",
    description: `Khám phá các danh mục sản phẩm chiếu sáng tại ${siteConfig.name}. Nhận báo giá và tư vấn miễn phí.`,
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getData(
    brandSlugs?: string[],
    minPrice?: number,
    maxPrice?: number,
    searchQuery?: string,
    page: number = 1,
    limit: number = 20,
    sort: string = "newest"
) {
    const supabase = await createClient();

    // Get all categories
    const { data: allCategories } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    const categories = (allCategories as Category[]) ?? [];

    // Get all brands
    const { data: allBrands } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

    const brands = (allBrands as Brand[]) ?? [];

    // Get products with count
    let productsQuery = supabase
        .from("products")
        .select("*", { count: "exact" });

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

    // Apply text search
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

    return {
        categories,
        brands,
        products: (products as Product[]) ?? [],
        totalCount: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 1
    };
}

export default async function AllCategoriesPage({ searchParams }: PageProps) {
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

    // Parse test search query
    const qParam = search.q;
    const searchQuery = typeof qParam === "string" ? qParam : undefined;

    const { categories, brands, products, totalCount, totalPages } = await getData(brandSlugs, minPrice, maxPrice, searchQuery, currentPage, 20, currentSort);
    const hasFilters = (brandSlugs && brandSlugs.length > 0) || !isNaN(minPrice ?? NaN) || !isNaN(maxPrice ?? NaN) || !!searchQuery;

    return (
        <div className="bg-slate-100 min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : "Tất cả sản phẩm"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {hasFilters
                            ? `Tìm thấy ${totalCount} sản phẩm / Kết quả`
                            : `Hiển thị toàn bộ ${totalCount} sản phẩm`
                        }
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    <div className="lg:w-64 lg:shrink-0">
                        <CategorySidebarAdvanced
                            categories={categories}
                            brands={brands}
                            activeSlug={null}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm border border-gray-100">
                            <ProductGrid
                                products={products}
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


