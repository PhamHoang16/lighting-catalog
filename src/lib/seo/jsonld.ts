import { siteConfig } from "@/lib/config/site";

export function buildOrganizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteConfig.name,
        "url": siteConfig.url,
        "logo": `${siteConfig.url}/logo.png`,
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": siteConfig.contact.hotline,
            "contactType": "customer service",
            "availableLanguage": "Vietnamese",
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": siteConfig.contact.address,
            "addressCountry": "VN",
        },
        "sameAs": [siteConfig.contact.facebook],
    };
}

export function buildWebSiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteConfig.name,
        "url": siteConfig.url,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteConfig.url}/danh-muc?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": siteConfig.url },
            ...items.map((item, i) => ({
                "@type": "ListItem",
                "position": i + 2,
                "name": item.label,
                ...(item.href ? { "item": `${siteConfig.url}${item.href}` } : {}),
            })),
        ],
    };
}

interface ProductJsonLdInput {
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    gallery?: string[] | null;
    price?: number | null;
    id: string | number;
    brandName?: string | null;
}

export function buildProductJsonLd(product: ProductJsonLdInput) {
    const url = `${siteConfig.url}/san-pham/${product.slug}`;
    const images = [
        ...(product.image_url ? [product.image_url] : []),
        ...(product.gallery ?? []),
    ];

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        ...(images.length > 0 && { "image": images }),
        ...(product.description && {
            "description": product.description.replace(/<[^>]*>?/gm, ""),
        }),
        "sku": String(product.id),
        ...(product.brandName && {
            "brand": { "@type": "Brand", "name": product.brandName },
        }),
        // Only include Offer when price is known and non-zero
        ...(product.price && product.price > 0
            ? {
                  "offers": {
                      "@type": "Offer",
                      "url": url,
                      "priceCurrency": "VND",
                      "price": product.price,
                      "availability": "https://schema.org/InStock",
                      "itemCondition": "https://schema.org/NewCondition",
                  },
              }
            : {}),
    };
}

interface ArticleJsonLdInput {
    title: string;
    slug: string;
    summary?: string | null;
    thumbnail_url?: string | null;
    created_at: Date | string;
}

export function buildArticleJsonLd(post: ArticleJsonLdInput) {
    const url = `${siteConfig.url}/tin-tuc/${post.slug}`;
    const datePublished =
        post.created_at instanceof Date
            ? post.created_at.toISOString()
            : post.created_at;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "url": url,
        ...(post.summary && { "description": post.summary }),
        ...(post.thumbnail_url && { "image": post.thumbnail_url }),
        "datePublished": datePublished,
        "publisher": {
            "@type": "Organization",
            "name": siteConfig.name,
            "logo": { "@type": "ImageObject", "url": `${siteConfig.url}/logo.png` },
        },
    };
}

interface ItemListEntry {
    name: string;
    slug: string;
    image_url?: string | null;
    position: number;
}

export function buildItemListJsonLd(items: ItemListEntry[], listName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": listName,
        "itemListElement": items.map((item) => ({
            "@type": "ListItem",
            "position": item.position,
            "url": `${siteConfig.url}/san-pham/${item.slug}`,
            "name": item.name,
            ...(item.image_url && { "image": item.image_url }),
        })),
    };
}
