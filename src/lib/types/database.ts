// ── Database types cho Supabase ─────────────────────────────────
// Tạo tương ứng với schema đã định nghĩa trên Supabase

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    price: number;
                    image_url: string | null;
                    gallery: string[] | null;
                    description: string | null;
                    specs: SpecItem[] | null;
                    category_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    price: number;
                    image_url?: string | null;
                    gallery?: string[] | null;
                    description?: string | null;
                    specs?: SpecItem[] | null;
                    category_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    price?: number;
                    image_url?: string | null;
                    gallery?: string[] | null;
                    description?: string | null;
                    specs?: SpecItem[] | null;
                    category_id?: string;
                    created_at?: string;
                };
            };
            quote_requests: {
                Row: {
                    id: string;
                    customer_name: string;
                    phone: string;
                    message: string | null;
                    status: string;
                    items: QuoteItem[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    customer_name: string;
                    phone: string;
                    message?: string | null;
                    status?: string;
                    items: QuoteItem[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    customer_name?: string;
                    phone?: string;
                    message?: string | null;
                    status?: string;
                    items?: QuoteItem[];
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// ── Convenience types ───────────────────────────────────────────
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];
export type QuoteRequestInsert = Database["public"]["Tables"]["quote_requests"]["Insert"];
export type QuoteRequestUpdate = Database["public"]["Tables"]["quote_requests"]["Update"];

// Product kèm thông tin category (dùng cho query join)
export type ProductWithCategory = Product & {
    categories: { name: string } | null;
};

// ── Spec Item (lưu trong JSONB `specs`) ─────────────────────────
export interface SpecItem {
    name: string;
    value: string;
}

// ── Quote Item (lưu trong JSONB `items`) ────────────────────────
export interface QuoteItem {
    product_id: string;
    product_name: string;
    quantity: number;
}

// ── Quote Status ────────────────────────────────────────────────
export type QuoteStatus = "new" | "processing" | "completed" | "cancelled";

export const QUOTE_STATUS_MAP: Record<
    QuoteStatus,
    { label: string; bg: string; text: string }
> = {
    new: {
        label: "Mới",
        bg: "bg-blue-50",
        text: "text-blue-700",
    },
    processing: {
        label: "Đang xử lý",
        bg: "bg-amber-50",
        text: "text-amber-700",
    },
    completed: {
        label: "Đã xong",
        bg: "bg-green-50",
        text: "text-green-700",
    },
    cancelled: {
        label: "Đã hủy",
        bg: "bg-red-50",
        text: "text-red-700",
    },
};
