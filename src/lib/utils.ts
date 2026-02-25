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

/**
 * Format thời gian tương đối (relative time) theo tiếng Việt.
 * Ví dụ: "Vừa xong", "5 phút trước", "2 giờ trước"
 */
export function timeAgo(dateString: string): string {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return "Vừa xong";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} tháng trước`;
    return `${Math.floor(diffMonth / 12)} năm trước`;
}
