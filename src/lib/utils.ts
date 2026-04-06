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

// ── Build category tree from flat array ─────────────────────────
import type { Category, CategoryWithChildren } from "@/lib/types/database";

export function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // 1. Create map with empty children
    for (const cat of categories) {
        map.set(cat.id, { ...cat, children: [] });
    }

    // 2. Attach children to parents
    for (const cat of categories) {
        const node = map.get(cat.id)!;
        if (cat.parent_id && map.has(cat.parent_id)) {
            map.get(cat.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    // 3. Sort roots and children by sort_order ascending
    const sortBySortOrder = (a: CategoryWithChildren, b: CategoryWithChildren) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0);
    roots.sort(sortBySortOrder);
    for (const node of map.values()) {
        if (node.children.length > 1) {
            node.children.sort(sortBySortOrder);
        }
    }

    return roots;
}

// Get all descendant IDs of a category (inclusive)
export function getDescendantIds(
    categoryId: string,
    allCategories: Category[]
): string[] {
    const ids = [categoryId];
    const children = allCategories.filter((c) => c.parent_id === categoryId);
    for (const child of children) {
        ids.push(...getDescendantIds(child.id, allCategories));
    }
    return ids;
}
