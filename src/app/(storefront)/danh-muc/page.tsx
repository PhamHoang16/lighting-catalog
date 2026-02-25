import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import CategorySidebar from "@/components/storefront/category/CategorySidebar";
import ProductGrid from "@/components/storefront/category/ProductGrid";
import type { Category, Product } from "@/lib/types/database";

export const metadata: Metadata = {
    title: "Tất cả sản phẩm",
    description: `Khám phá toàn bộ catalogue sản phẩm chiếu sáng tại ${siteConfig.name}. Nhận báo giá và tư vấn miễn phí.`,
};

async function getData() {
    const supabase = await createClient();

    const [categoriesRes, productsRes] = await Promise.all([
        supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true }),
        supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false }),
    ]);

    return {
        categories: (categoriesRes.data as Category[]) ?? [],
        products: (productsRes.data as Product[]) ?? [],
    };
}

export default async function AllProductsPage() {
    const { categories, products } = await getData();

    return (
        <div className="bg-white">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <Breadcrumbs items={[{ label: "Tất cả sản phẩm" }]} />
                </div>
            </div>

            {/* Header */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Tất cả sản phẩm
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Khám phá toàn bộ catalogue sản phẩm chiếu sáng chuyên nghiệp
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 lg:shrink-0">
                        <CategorySidebar categories={categories} activeSlug={null} />
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        <ProductGrid products={products} />
                    </div>
                </div>
            </div>
        </div>
    );
}
