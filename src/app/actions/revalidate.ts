"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Server Action to trigger cache revalidation on-demand.
 * Called from the Admin dashboard after mutations.
 *
 * Note: This version of Next.js requires revalidateTag(tag, profile).
 * Using "max" profile to bust using the standard cache profile.
 */
export async function revalidateStorefront(path?: string, type?: "page" | "layout") {
    // Bust unstable_cache entries tagged "categories" (used by sidebar + category detail pages)
    revalidateTag("categories", "max");

    if (path) {
        revalidatePath(path, type);
    } else {
        // Default: revalidate main storefront layout + category directory
        revalidatePath("/", "layout");
        revalidatePath("/danh-muc", "layout");
    }
}

export async function revalidateProduct(slug: string) {
    revalidatePath(`/san-pham/${slug}`);
    revalidatePath("/", "layout");
}

export async function revalidateCategory(slug: string) {
    // Bust unstable_cache tagged "categories" — covers category sidebar + all [slug] pages
    revalidateTag("categories", "max");
    revalidatePath(`/danh-muc/${slug}`);
    revalidatePath("/", "layout");
    revalidatePath("/danh-muc", "layout");
}
