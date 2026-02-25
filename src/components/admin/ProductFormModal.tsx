"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/utils";
import ImageUploader from "./product-form/ImageUploader";
import type { PendingImage } from "./product-form/ImageUploader";
import SpecsEditor from "./product-form/SpecsEditor";
import RichTextEditor from "./product-form/RichTextEditor";
import type { Product, Category, SpecItem } from "@/lib/types/database";

// ── Product payload ─────────────────────────────────────────────
export interface ProductPayload {
    name: string;
    slug: string;
    price: number;
    category_id: string;
    image_url?: string | null;
    gallery?: string[] | null;
    description?: string | null;
    specs?: SpecItem[] | null;
}

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProductPayload) => Promise<void>;
    editingProduct?: Product | null;
}

export default function ProductFormModal({
    open,
    onClose,
    onSubmit,
    editingProduct,
}: ProductFormModalProps) {
    const supabase = createClient();
    const { toast } = useToast();

    // ── Basic fields ────────────────────────────────────────────
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(false);

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // ── Thumbnail image ─────────────────────────────────────────
    const [thumbExisting, setThumbExisting] = useState<string[]>([]);
    const [thumbPending, setThumbPending] = useState<PendingImage[]>([]);

    // ── Gallery images ──────────────────────────────────────────
    const [galleryExisting, setGalleryExisting] = useState<string[]>([]);
    const [galleryPending, setGalleryPending] = useState<PendingImage[]>([]);

    // ── Rich text description ───────────────────────────────────
    const [description, setDescription] = useState("");

    // ── Specs ───────────────────────────────────────────────────
    const [specs, setSpecs] = useState<SpecItem[]>([]);

    const isEdit = !!editingProduct;

    // ── Fetch categories ────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        async function fetchCategories() {
            setLoadingCategories(true);
            const { data } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });
            setCategories((data as Category[]) ?? []);
            setLoadingCategories(false);
        }
        fetchCategories();
    }, [open, supabase]);

    // ── Populate khi edit ───────────────────────────────────────
    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setSlug(editingProduct.slug);
            setPrice(String(editingProduct.price));
            setCategoryId(editingProduct.category_id);
            setDescription(editingProduct.description ?? "");
            setSpecs(editingProduct.specs ?? []);
            // Image
            setThumbExisting(editingProduct.image_url ? [editingProduct.image_url] : []);
            setThumbPending([]);
            setGalleryExisting(editingProduct.gallery ?? []);
            setGalleryPending([]);
        } else {
            resetForm();
        }
    }, [editingProduct, open]);

    // ── Auto slug ───────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit) {
            // Create mode: always generate from name
            setSlug(name ? toSlug(name) : "");
        } else if (name && name !== editingProduct?.name) {
            // Edit mode: only re-generate when name actually changed to a non-empty value
            setSlug(toSlug(name));
        }
    }, [name, isEdit, editingProduct?.name]);

    function resetForm() {
        setName("");
        setSlug("");
        setPrice("");
        setCategoryId("");
        setDescription("");
        setSpecs([]);
        setThumbExisting([]);
        setThumbPending([]);
        setGalleryExisting([]);
        setGalleryPending([]);
    }

    // ── Upload a single file → return public URL ────────────────
    async function uploadFile(file: File): Promise<string> {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const fileName = `${slug || "product"}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

        const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const {
            data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        return publicUrl;
    }

    // ── Resolve pending images → URLs ───────────────────────────
    async function resolvePendingImages(
        pending: PendingImage[]
    ): Promise<string[]> {
        const urls: string[] = [];
        for (const img of pending) {
            if (img.type === "url") {
                urls.push(img.url);
            } else if (img.file) {
                const url = await uploadFile(img.file);
                urls.push(url);
            }
        }
        return urls;
    }

    // ── Submit ──────────────────────────────────────────────────
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !price || !categoryId) return;

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice < 0) return;

        // Safety: ensure slug is never empty
        const finalSlug = slug || toSlug(name.trim()) || editingProduct?.slug || `product-${Date.now()}`;

        setLoading(true);
        try {
            // 1. Upload images
            const newThumbUrls = await resolvePendingImages(thumbPending);
            const newGalleryUrls = await resolvePendingImages(galleryPending);

            // Final image_url = new thumb or keep existing
            const finalThumbUrl =
                newThumbUrls[0] ?? thumbExisting[0] ?? null;

            // Final gallery = existing (those not removed) + new
            const finalGallery = [...galleryExisting, ...newGalleryUrls];

            // 2. Clean specs (remove empty rows)
            const cleanSpecs = specs.filter(
                (s) => s.name.trim() && s.value.trim()
            );

            // 3. Build payload
            const payload: ProductPayload = {
                name: name.trim(),
                slug: finalSlug,
                price: numericPrice,
                category_id: categoryId,
                image_url: finalThumbUrl,
                gallery: finalGallery.length > 0 ? finalGallery : null,
                description: description.trim() || null,
                specs: cleanSpecs.length > 0 ? cleanSpecs : null,
            };

            await onSubmit(payload);
            resetForm();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi";
            toast(msg, "error");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            resetForm();
            onClose();
        }
    }

    function formatPricePreview(val: string): string {
        const num = parseFloat(val);
        if (isNaN(num)) return "—";
        return num.toLocaleString("vi-VN") + " ₫";
    }

    const isSubmitDisabled =
        loading || !name.trim() || !price || !categoryId;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ════════════════════════════════════════════════════ */}
                {/* SECTION 1: Thông tin cơ bản                        */}
                {/* ════════════════════════════════════════════════════ */}
                <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
                    <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Thông tin cơ bản
                    </legend>

                    {/* Tên */}
                    <div>
                        <label
                            htmlFor="product-name"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="product-name"
                            type="text"
                            required
                            autoFocus
                            placeholder="Ví dụ: Đèn LED Panel 600x600"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-500">
                            Slug (tự động)
                        </label>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                            {slug || "—"}
                        </div>
                    </div>

                    {/* Giá + Danh mục */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="product-price"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Giá (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="product-price"
                                type="number"
                                required
                                min="0"
                                step="1000"
                                placeholder="350000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                            />
                            {price && (
                                <p className="mt-1.5 text-xs text-blue-600">
                                    {formatPricePreview(price)}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="product-category"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            {loadingCategories ? (
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tải...
                                </div>
                            ) : (
                                <select
                                    id="product-category"
                                    required
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                >
                                    <option value="">— Chọn danh mục —</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </fieldset>

                {/* ════════════════════════════════════════════════════ */}
                {/* SECTION 2: Hình ảnh                                */}
                {/* ════════════════════════════════════════════════════ */}
                <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
                    <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Hình ảnh
                    </legend>

                    <ImageUploader
                        label="Ảnh đại diện (Thumbnail)"
                        multiple={false}
                        existingUrls={thumbExisting}
                        pendingImages={thumbPending}
                        onPendingChange={setThumbPending}
                        onExistingRemove={() => setThumbExisting([])}
                        disabled={loading}
                    />

                    <ImageUploader
                        label="Ảnh Gallery (nhiều ảnh)"
                        multiple={true}
                        existingUrls={galleryExisting}
                        pendingImages={galleryPending}
                        onPendingChange={setGalleryPending}
                        onExistingRemove={(url) =>
                            setGalleryExisting((prev) => prev.filter((u) => u !== url))
                        }
                        disabled={loading}
                    />
                </fieldset>

                {/* ════════════════════════════════════════════════════ */}
                {/* SECTION 3: Mô tả chi tiết                          */}
                {/* ════════════════════════════════════════════════════ */}
                <fieldset className="rounded-lg border border-gray-200 p-4">
                    <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Mô tả
                    </legend>
                    <RichTextEditor
                        value={description}
                        onChange={setDescription}
                        disabled={loading}
                    />
                </fieldset>

                {/* ════════════════════════════════════════════════════ */}
                {/* SECTION 4: Thông số kỹ thuật                       */}
                {/* ════════════════════════════════════════════════════ */}
                <fieldset className="rounded-lg border border-gray-200 p-4">
                    <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Thông số kỹ thuật
                    </legend>
                    <SpecsEditor
                        specs={specs}
                        onChange={setSpecs}
                        disabled={loading}
                    />
                </fieldset>

                {/* ════════════════════════════════════════════════════ */}
                {/* Upload indicator + Actions                         */}
                {/* ════════════════════════════════════════════════════ */}
                {loading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xử lý (upload ảnh + lưu dữ liệu)...
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEdit ? "Đang lưu..." : "Đang tạo..."}
                            </>
                        ) : isEdit ? (
                            "Lưu thay đổi"
                        ) : (
                            "Thêm sản phẩm"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
