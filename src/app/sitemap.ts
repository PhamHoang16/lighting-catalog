import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { getProductSlugs } from "@/lib/db/queries/products";
import { getAllCategories } from "@/lib/db/queries/categories";

// Revalidate sitemap every hour — avoids DB query on every crawler request
export const revalidate = 3600;

const SITE_BUILT_AT = new Date("2025-01-01").toISOString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url;

    const staticRoutes = [
        "",
        "/gioi-thieu",
        "/lien-he",
        "/danh-muc",
        "/tat-ca-danh-muc",
        "/tin-tuc",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: SITE_BUILT_AT,
        changeFrequency: "daily" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    try {
        const [productSlugs, categories] = await Promise.all([
            getProductSlugs(1000),
            getAllCategories(),
        ]);

        const productRoutes = productSlugs.map((p) => ({
            url: `${baseUrl}/san-pham/${p.slug}`,
            lastModified: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
            changeFrequency: "weekly" as const,
            priority: 0.9,
        }));

        const categoryRoutes = categories.map((c) => ({
            url: `${baseUrl}/danh-muc/${c.slug}`,
            lastModified: c.created_at,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        return [...staticRoutes, ...categoryRoutes, ...productRoutes];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        return staticRoutes;
    }
}
