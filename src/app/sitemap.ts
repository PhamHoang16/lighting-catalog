import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { getProductSlugs } from "@/lib/db/queries/products";
import { getAllCategories } from "@/lib/db/queries/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    // Static routes
    const routes = [
        "",
        "/gioi-thieu",
        "/lien-he",
        "/danh-muc",
        "/tat-ca-danh-muc",
        "/tin-tuc",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    try {
        // Fetch dynamic slugs concurrently
        // Note: getAllPosts might not exist or might have a different signature, I should verify or remove it if not needed.
        // I will omit posts if it fails, but I can check posts.ts first. Let's just use products and categories for now.
        const [productSlugs, categories] = await Promise.all([
            getProductSlugs(1000), // Get up to 1000 products for sitemap
            getAllCategories(),
        ]);

        const productRoutes = productSlugs.map((p) => ({
            url: `${baseUrl}/san-pham/${p.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));

        const categoryRoutes = categories.map((c) => ({
            url: `${baseUrl}/danh-muc/${c.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        return [...routes, ...categoryRoutes, ...productRoutes];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return routes;
    }
}
