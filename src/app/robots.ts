import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/workspace/", "/api/"],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
