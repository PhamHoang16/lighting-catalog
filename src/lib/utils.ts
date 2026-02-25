import { type ClassValue, clsx } from "clsx";

/**
 * Utility to conditionally merge CSS class names.
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Chuyển chuỗi tiếng Việt thành slug URL-friendly.
 * Ví dụ: "Đèn LED Trang Trí" → "den-led-trang-tri"
 */
export function toSlug(str: string): string {
    // Map Vietnamese diacritics
    const from =
        "àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ";
    const to =
        "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

    let slug = str.toLowerCase().trim();

    for (let i = 0; i < from.length; i++) {
        slug = slug.replaceAll(from[i], to[i]);
    }

    return slug
        .replace(/[^a-z0-9\s-]/g, "")  // remove non-alphanumeric
        .replace(/[\s_]+/g, "-")        // spaces/underscores → hyphens
        .replace(/-+/g, "-")            // collapse multiple hyphens
        .replace(/^-|-$/g, "");          // trim leading/trailing hyphens
}

/**
 * Format ngày tháng sang định dạng Việt Nam.
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
