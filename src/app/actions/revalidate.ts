"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Server Action to trigger cache revalidation on-demand.
 * This is meant to be called from the Admin dashboard after mutations.
 */
export async function revalidateStorefront(path?: string, type?: "page" | "layout") {
    if (path) {
        revalidatePath(path, type);
    } else {
        // Default: revalidate the main storefront parts
        revalidatePath("/", "layout");
    }
}

export async function revalidateProduct(slug: string) {
    revalidatePath(`/san-pham/${slug}`);
    revalidatePath("/", "layout"); // Update total counts, category links, etc.
}

export async function revalidateCategory(slug: string) {
    revalidatePath(`/danh-muc/${slug}`);
    revalidatePath("/", "layout"); 
}
