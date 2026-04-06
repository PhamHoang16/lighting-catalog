// ── Database types cho Supabase ─────────────────────────────────
// Tạo tương ứng với schema đã định nghĩa trên Supabase

export interface Database {
    public: {
        Tables: {
            banners: {
                Row: {
                    id: string;
                    title: string | null;
                    image_url: string;
                    link_url: string | null;
                    is_active: boolean;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title?: string | null;
                    image_url: string;
                    link_url?: string | null;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string | null;
                    image_url?: string;
                    link_url?: string | null;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    parent_id: string | null;
                    image_url: string | null;
                    description: string | null;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    parent_id?: string | null;
                    image_url?: string | null;
                    description?: string | null;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    parent_id?: string | null;
                    image_url?: string | null;
                    description?: string | null;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            brands: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    logo_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    logo_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    logo_url?: string | null;
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
                    variants: VariantsData | null;
                    category_id: string;
                    brand_id: string | null;
                    is_best_seller: boolean;
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
                    variants?: VariantsData | null;
                    category_id: string;
                    brand_id?: string | null;
                    is_best_seller?: boolean;
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
                    variants?: VariantsData | null;
                    category_id?: string;
                    brand_id?: string | null;
                    is_best_seller?: boolean;
                    created_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    customer_name: string;
                    phone: string;
                    title: string | null;
                    message: string | null;
                    delivery_method: string;
                    address: string | null;
                    card_at_home: boolean;
                    invoice_company: boolean;
                    total_amount: number;
                    status: string;
                    items: OrderItem[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    customer_name: string;
                    phone: string;
                    title?: string | null;
                    message?: string | null;
                    delivery_method?: string;
                    address?: string | null;
                    card_at_home?: boolean;
                    invoice_company?: boolean;
                    total_amount?: number;
                    status?: string;
                    items: OrderItem[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    customer_name?: string;
                    phone?: string;
                    title?: string | null;
                    message?: string | null;
                    delivery_method?: string;
                    address?: string | null;
                    card_at_home?: boolean;
                    invoice_company?: boolean;
                    total_amount?: number;
                    status?: string;
                    items?: OrderItem[];
                    created_at?: string;
                };
            };
            posts: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    thumbnail_url: string | null;
                    summary: string | null;
                    content: string | null;
                    is_published: boolean;
                    is_featured: boolean;
                    is_popular: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    thumbnail_url?: string | null;
                    summary?: string | null;
                    content?: string | null;
                    is_published?: boolean;
                    is_featured?: boolean;
                    is_popular?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    thumbnail_url?: string | null;
                    summary?: string | null;
                    content?: string | null;
                    is_published?: boolean;
                    is_featured?: boolean;
                    is_popular?: boolean;
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
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type BrandInsert = Database["public"]["Tables"]["brands"]["Insert"];
export type BrandUpdate = Database["public"]["Tables"]["brands"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

// Category kèm danh mục con (dùng cho tree view)
export type CategoryWithChildren = Category & {
    children: CategoryWithChildren[];
};

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

// Product kèm thông tin category (dùng cho query join)
export type ProductWithCategory = Product & {
    categories: { name: string; slug: string } | null;
};

export type ProductWithRelations = Product & {
    categories: { name: string; slug: string } | null;
    brands: { name: string; slug: string; logo_url: string | null } | null;
};

// ── Spec Item (lưu trong JSONB `specs`) ─────────────────────────
export interface SpecItem {
    name: string;
    value: string;
}

// ── Variant Data (lưu trong JSONB `variants`) ───────────────────
export interface VariantOption {
    name: string;
    values: string[];
}

export interface VariantItem {
    combination: string[];
    price: number;
    stock: number;
    sku?: string;
}

export interface VariantsData {
    options: VariantOption[];
    variants: VariantItem[];
}

// ── Order Item (lưu trong JSONB `items`) ────────────────────────
export interface OrderItem {
    product_id: string;
    product_name: string;
    product_image?: string | null;
    variant_label?: string | null;
    unit_price: number;
    quantity: number;
}

// ── Order Status ────────────────────────────────────────────────
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export const ORDER_STATUS_MAP: Record<
    OrderStatus,
    { label: string; bg: string; text: string }
> = {
    pending: {
        label: "Chờ xác nhận",
        bg: "bg-blue-50",
        text: "text-blue-700",
    },
    processing: {
        label: "Đang xử lý",
        bg: "bg-amber-50",
        text: "text-amber-700",
    },
    completed: {
        label: "Hoàn thành",
        bg: "bg-green-50",
        text: "text-green-700",
    },
    cancelled: {
        label: "Đã hủy",
        bg: "bg-red-50",
        text: "text-red-700",
    },
};

// ── Banners ─────────────────────────────────────────────────────
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type BannerInsert = Database["public"]["Tables"]["banners"]["Insert"];
export type BannerUpdate = Database["public"]["Tables"]["banners"]["Update"];

// ── Posts (Tin tức) ─────────────────────────────────────────────
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
