import { createStaticClient } from "@/lib/supabase/static";
import HeroBanners from "@/components/storefront/home/HeroBanners";
import TopCategoriesGrid from "@/components/storefront/home/TopCategoriesGrid";
import HotProducts from "@/components/storefront/home/HotProducts";
import CategoryShowcaseBlock, { type CategoryShowcaseData } from "@/components/storefront/home/CategoryShowcases";
import type { Category } from "@/lib/types/database";

export const revalidate = 60; // Revalidate every minute for home page

export default async function HomePage() {
    const supabase = createStaticClient();

    // 1. Fetch all categories first to build a lookup for diversification
    const { data: allCategories = [] } = await supabase
        .from("categories")
        .select("*");
    
    const categoryMap = new Map((allCategories ?? []).map(c => [c.id, c]));

    // 2. Fetch Banners, Parent Categories, and "Seed" Products for diversification
    const [bannersRes, parentCategoriesRes, seedProductsRes] = await Promise.all([
        supabase
            .from("banners")
            .select("*")
            .order("sort_order", { ascending: true })
            .then((res) => res, () => ({ data: [], error: true })),
        supabase
            .from("categories")
            .select("*")
            .is("parent_id", null)
            .order("name", { ascending: true }),
        supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(30) // Seed pool for diversification (balanced for cache efficiency)
    ]);

    const banners = !bannersRes.error && bannersRes.data ? bannersRes.data : [];
    const seedProducts = seedProductsRes.data ?? [];
    const parentCategories = parentCategoriesRes.data ?? [];

    // ─────────────────────────────────────────────────────────────
    // DIVERSIFICATION LOGIC: Pick 20 products with variety
    // ─────────────────────────────────────────────────────────────
    const groupedByParent = new Map<string, typeof seedProducts>();
    
    seedProducts.forEach(p => {
        const cat = categoryMap.get(p.category_id);
        const parentId = cat?.parent_id || p.category_id;
        if (!groupedByParent.has(parentId)) groupedByParent.set(parentId, []);
        groupedByParent.get(parentId)!.push(p);
    });

    const hotProducts: typeof seedProducts = [];
    const parentIds = Array.from(groupedByParent.keys());
    let iteration = 0;

    // Round-robin selection
    while (hotProducts.length < 20 && parentIds.length > 0) {
        let pickedInThisRound = false;
        for (const pId of parentIds) {
            const list = groupedByParent.get(pId)!;
            if (iteration < list.length) {
                hotProducts.push(list[iteration]);
                pickedInThisRound = true;
            }
            if (hotProducts.length >= 20) break;
        }
        if (!pickedInThisRound) break;
        iteration++;
    }

    // 3. Fetch subcategories & products for each parent category (showcase items)
    const categoryShowcaseData: CategoryShowcaseData[] = await Promise.all(
        parentCategories.map(async (parent: Category) => {
            const subcategories = (allCategories ?? []).filter(c => c.parent_id === parent.id);
            const subIds = subcategories.map((s) => s.id);
            const allCatIds = [parent.id, ...subIds];

            // Fetch products that belong to this category or its subcategories
            const productsRes = await supabase
                .from("products")
                .select("*")
                .in("category_id", allCatIds)
                .order("created_at", { ascending: false })
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
                <HotProducts 
                    products={hotProducts.map(p => ({
                        ...p,
                        categoryName: categoryMap.get(p.category_id)?.name
                    })) as any} 
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
