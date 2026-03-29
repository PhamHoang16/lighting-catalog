import { createStaticClient } from "@/lib/supabase/static";
import { siteConfig } from "@/lib/config/site";
import HeroBanners from "@/components/storefront/home/HeroBanners";
import TopCategoriesGrid from "@/components/storefront/home/TopCategoriesGrid";
import HotProducts from "@/components/storefront/home/HotProducts";
import CategoryShowcaseBlock, { type CategoryShowcaseData } from "@/components/storefront/home/CategoryShowcases";
import type { Category } from "@/lib/types/database";

export const revalidate = 3600; // Literal for build stability

export default async function HomePage() {
    const supabase = createStaticClient();

    // 1. Fetch only essential category fields
    const { data: allCategories = [] } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, image_url");
    
    const categoryMap = new Map((allCategories ?? []).map(c => [c.id, c]));

    // 2. Fetch Banners, Parent Categories, and "Seed" Products for diversification
    const [bannersRes, parentCategoriesRes, seedProductsRes] = await Promise.all([
        supabase
            .from("banners")
            .select("id, title, image_url, link_url, sort_order, is_active, created_at")
            .order("sort_order", { ascending: true })
            .then((res) => res, () => ({ data: [], error: true })),
        supabase
            .from("categories")
            .select("id, name, slug, parent_id, image_url, created_at")
            .is("parent_id", null)
            .order("name", { ascending: true }),
        supabase
            .from("products")
            .select("id, name, slug, price, image_url, category_id, brand_id, created_at")
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

    // 3. Optimized: Fetch all products for showcases in ONE query instead of a loop
    const allParentIds = parentCategories.map(p => p.id);
    const subcategoryMap = new Map<string, string[]>();
    parentCategories.forEach(p => {
        const subs = (allCategories ?? []).filter(c => c.parent_id === p.id).map(s => s.id);
        subcategoryMap.set(p.id, [p.id, ...subs]);
    });

    const allShowcaseIds = Array.from(subcategoryMap.values()).flat();
    const { data: allShowcaseProductsRes } = await supabase
        .from("products")
        .select("id, name, slug, price, image_url, category_id, brand_id, created_at")
        .in("category_id", allShowcaseIds);

    const allShowcaseProducts = allShowcaseProductsRes ?? [];

    const categoryShowcaseData: CategoryShowcaseData[] = parentCategories.map((parent) => {
        const targetIds = subcategoryMap.get(parent.id) || [];
        const products = allShowcaseProducts
            .filter(p => targetIds.includes(p.category_id))
            .slice(0, 10);

        return {
            category: parent as any,
            subcategories: (allCategories ?? []).filter(c => c.parent_id === parent.id) as any,
            products: products as any,
        };
    });

    return (
        <div className="flex flex-col gap-8 pb-8 bg-slate-100 min-h-screen">
            <HeroBanners banners={banners} />

            <TopCategoriesGrid categories={parentCategories as any} />

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
