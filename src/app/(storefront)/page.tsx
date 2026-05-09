import { siteConfig } from "@/lib/config/site";
import HeroBanners from "@/components/storefront/home/HeroBanners";
import TopCategoriesGrid from "@/components/storefront/home/TopCategoriesGrid";
import HotProducts from "@/components/storefront/home/HotProducts";
import CategoryShowcaseBlock, { type CategoryShowcaseData } from "@/components/storefront/home/CategoryShowcases";
import { getAllCategories, buildCategoryTree } from "@/lib/db/queries/categories";
import { getActiveBanners } from "@/lib/db/queries/banners";
import { getBestSellers, getAllProductsForShowcase } from "@/lib/db/queries/products";

export const revalidate = 3600;

export default async function HomePage() {
    // 1. Fetch all categories (flat list)
    const allCategories = await getAllCategories();
    const categoryMap = new Map(allCategories.map(c => [c.id, c]));

    // 2. Fetch Banners, Best Sellers in parallel
    const [banners, bestSellerProducts] = await Promise.all([
        getActiveBanners(),
        getBestSellers(20),
    ]);

    // Map best-seller products with category name
    const hotProducts = bestSellerProducts.map(p => ({
        ...p,
        categoryName: categoryMap.get(p.category_id ?? "")?.name,
    }));

    // 3. Build showcase data (parent categories + their subcategory products)
    const parentCategories = allCategories.filter(c => c.parent_id === null);
    const subcategoryMap = new Map<string, string[]>();
    parentCategories.forEach(p => {
        const subs = allCategories.filter(c => c.parent_id === p.id).map(s => s.id);
        subcategoryMap.set(p.id, [p.id, ...subs]);
    });

    const allShowcaseIds = Array.from(subcategoryMap.values()).flat();
    const allShowcaseProducts = await getAllProductsForShowcase(allShowcaseIds);

    const categoryShowcaseData: CategoryShowcaseData[] = parentCategories.map((parent) => {
        const targetIds = subcategoryMap.get(parent.id) || [];
        const products = allShowcaseProducts
            .filter(p => targetIds.includes(p.category_id ?? ""))
            .slice(0, 10);

        return {
            category: parent as any,
            subcategories: allCategories
                .filter(c => c.parent_id === parent.id)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) as any,
            products: products as any,
        };
    });

    return (
        <div className="flex flex-col gap-8 pb-8 bg-slate-100 min-h-screen">
            <HeroBanners banners={banners} />

            <TopCategoriesGrid categories={parentCategories as any} />

            {hotProducts.length > 0 && (
                <HotProducts
                    products={hotProducts as any}
                />
            )}

            <div className="flex flex-col gap-0">
                {categoryShowcaseData.map((data) => (
                    <CategoryShowcaseBlock key={data.category.id} data={data} />
                ))}
            </div>
        </div>
    );
}
