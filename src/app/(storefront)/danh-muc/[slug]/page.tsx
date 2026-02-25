import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import CategorySidebar from "@/components/storefront/category/CategorySidebar";
import ProductGrid from "@/components/storefront/category/ProductGrid";
import type { Category, Product } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ slug: string }>;
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
async function getData(slug: string) {
    const supabase = await createClient();

    // 1. Get the target category
    const { data: activeCategory } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!activeCategory) return null;

    // 2. Get all categories (sidebar) + products of this category — in parallel
    const [categoriesRes, productsRes] = await Promise.all([
        supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true }),
        supabase
            .from("products")
            .select("*")
            .eq("category_id", activeCategory.id)
            .order("created_at", { ascending: false }),
    ]);

    return {
        activeCategory: activeCategory as Category,
        categories: (categoriesRes.data as Category[]) ?? [],
        products: (productsRes.data as Product[]) ?? [],
    };
}

// ── Page ────────────────────────────────────────────────────────
export default async function CategoryDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const data = await getData(slug);

    if (!data) notFound();

    const { activeCategory, categories, products } = data;

    return (
        <div className="bg-white">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <Breadcrumbs
                        items={[
                            { label: "Sản phẩm", href: "/danh-muc" },
                            { label: activeCategory.name },
                        ]}
                    />
                </div>
            </div>

            {/* Header */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                            <span className="text-lg">💡</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                {activeCategory.name}
                            </h1>
                            <p className="mt-0.5 text-sm text-gray-400">
                                {products.length} sản phẩm
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 lg:shrink-0">
                        <CategorySidebar
                            categories={categories}
                            activeSlug={activeCategory.slug}
                        />
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        <ProductGrid
                            products={products}
                            categoryName={activeCategory.name}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
