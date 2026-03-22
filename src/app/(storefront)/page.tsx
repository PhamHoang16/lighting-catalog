import { createClient } from "@/lib/supabase/server";
import HeroBanners from "@/components/storefront/home/HeroBanners";
import TopCategoriesGrid from "@/components/storefront/home/TopCategoriesGrid";
import HotProducts from "@/components/storefront/home/HotProducts";
import CategoryShowcaseBlock, { type CategoryShowcaseData } from "@/components/storefront/home/CategoryShowcases";
import type { Category } from "@/lib/types/database";

export const revalidate = 60; // Revalidate every minute for home page

export default async function HomePage() {
    const supabase = await createClient();

    // 1. Fetch Banners, Hot Products, and Parent Categories
    const [bannersRes, hotProductsRes, parentCategoriesRes] = await Promise.all([
        supabase
            .from("banners")
            .select("*")
            .order("sort_order", { ascending: true })
            .then((res) => res, () => ({ data: [], error: true })), // fallback for missing banners table
        supabase
            .from("products")
            .select("*")
            // Fetch hot products (mô phỏng bằng mới tạo)
            .order("created_at", { ascending: false })
            .limit(10),
        supabase
            .from("categories")
            .select("*")
            .is("parent_id", null)
            .order("name", { ascending: true })
    ]);

    // Handle Banners gracefully
    const banners = !bannersRes.error && bannersRes.data ? bannersRes.data : [];
    const hotProducts = hotProductsRes.data ?? [];
    const parentCategories = parentCategoriesRes.data ?? [];
    const showcaseParentCategories = parentCategories;

    // 2. Fetch subcategories & products for each parent category (limit to showcase items)
    const categoryShowcaseData: CategoryShowcaseData[] = await Promise.all(
        showcaseParentCategories.map(async (parent: Category) => {
            const subsRes = await supabase
                .from("categories")
                .select("*")
                .eq("parent_id", parent.id)
                .order("name", { ascending: true });

            const subcategories = subsRes.data ?? [];
            const subIds = subcategories.map((s) => s.id);
            const allCatIds = [parent.id, ...subIds];

            // Fetch products that belong to this category or its subcategories
            const productsRes = await supabase
                .from("products")
                .select("*")
                .in("category_id", allCatIds)
                .limit(10);

            return {
                category: parent,
                subcategories,
                products: productsRes.data ?? [],
            };
        })
    );

    return (
        <div className="flex flex-col gap-8 pb-8 bg-slate-100 min-h-screen">
            <HeroBanners banners={banners} />

            <TopCategoriesGrid categories={parentCategories} />

            {hotProducts.length > 0 && (
                <HotProducts products={hotProducts} />
            )}

            <div className="flex flex-col gap-0">
                {categoryShowcaseData.map((data) => (
                    <CategoryShowcaseBlock key={data.category.id} data={data} />
                ))}
            </div>
        </div>
    );
}
