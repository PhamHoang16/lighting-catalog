"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Loader2, Upload, Link2, X, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/utils";
import type { Product, Category } from "@/lib/types/database";

// ── Allowed image types ─────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type ImageMode = "upload" | "url";

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        slug: string;
        price: number;
        category_id: string;
        image_url?: string | null;
    }) => Promise<void>;
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Form state ──────────────────────────────────────────────
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(false);

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // ── Image state ─────────────────────────────────────────────
    const [imageMode, setImageMode] = useState<ImageMode>("upload");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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

    // ── Populate fields khi edit ────────────────────────────────
    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name);
            setSlug(editingProduct.slug);
            setPrice(String(editingProduct.price));
            setCategoryId(editingProduct.category_id);
            // Image
            if (editingProduct.image_url) {
                setImageUrl(editingProduct.image_url);
                setPreviewUrl(editingProduct.image_url);
                setImageMode("url");
            }
        } else {
            resetForm();
        }
    }, [editingProduct, open]);

    // ── Auto slug ───────────────────────────────────────────────
    useEffect(() => {
        if (!isEdit || (isEdit && name !== editingProduct?.name)) {
            setSlug(name ? toSlug(name) : "");
        }
    }, [name, isEdit, editingProduct?.name]);

    // ── Preview từ file ─────────────────────────────────────────
    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    function resetForm() {
        setName("");
        setSlug("");
        setPrice("");
        setCategoryId("");
        setImageMode("upload");
        setImageFile(null);
        setImageUrl("");
        setPreviewUrl(null);
    }

    // ── Handle file selection ───────────────────────────────────
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast("Chỉ chấp nhận file JPG, PNG hoặc WebP.", "error");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast("File không được vượt quá 5MB.", "error");
            return;
        }

        setImageFile(file);
        setImageUrl(""); // clear URL mode
    }

    // ── Handle URL input ────────────────────────────────────────
    function handleUrlInput(url: string) {
        setImageUrl(url);
        setImageFile(null);
        if (url.trim()) {
            setPreviewUrl(url.trim());
        } else {
            setPreviewUrl(editingProduct?.image_url ?? null);
        }
    }

    // ── Upload image to Supabase Storage ────────────────────────
    async function uploadImage(file: File): Promise<string> {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const fileName = `${slug || "product"}-${Date.now()}.${ext}`;

        const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const {
            data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        return publicUrl;
    }

    // ── Remove current image ────────────────────────────────────
    function clearImage() {
        setImageFile(null);
        setImageUrl("");
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    // ── Submit ──────────────────────────────────────────────────
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !price || !categoryId) return;

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice < 0) return;

        setLoading(true);
        try {
            // Resolve image URL
            let finalImageUrl: string | null = editingProduct?.image_url ?? null;

            if (imageMode === "upload" && imageFile) {
                setUploading(true);
                try {
                    finalImageUrl = await uploadImage(imageFile);
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Lỗi upload ảnh";
                    toast("Lỗi upload ảnh: " + msg, "error");
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            } else if (imageMode === "url" && imageUrl.trim()) {
                finalImageUrl = imageUrl.trim();
            }

            await onSubmit({
                name: name.trim(),
                slug,
                price: numericPrice,
                category_id: categoryId,
                image_url: finalImageUrl,
            });
            resetForm();
        } finally {
            setLoading(false);
            setUploading(false);
        }
    }

    function handleClose() {
        if (!loading && !uploading) {
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
        loading || uploading || !name.trim() || !price || !categoryId;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ── Tên sản phẩm ──────────────────────────────────── */}
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
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                {/* ── Slug preview ──────────────────────────────────── */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-500">
                        Slug (tự động tạo)
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                        {slug || "—"}
                    </div>
                </div>

                {/* ── Giá ───────────────────────────────────────────── */}
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
                        placeholder="Ví dụ: 350000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    {price && (
                        <p className="mt-1.5 text-xs text-blue-600">
                            Hiển thị: {formatPricePreview(price)}
                        </p>
                    )}
                </div>

                {/* ── Danh mục ──────────────────────────────────────── */}
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
                            Đang tải danh mục...
                        </div>
                    ) : (
                        <select
                            id="product-category"
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">— Chọn danh mục —</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {categories.length === 0 && !loadingCategories && (
                        <p className="mt-1.5 text-xs text-amber-600">
                            Chưa có danh mục nào. Vui lòng tạo danh mục trước.
                        </p>
                    )}
                </div>

                {/* ── Hình ảnh sản phẩm ─────────────────────────────── */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Hình ảnh sản phẩm
                    </label>

                    {/* Mode tabs */}
                    <div className="mb-3 flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                        <button
                            type="button"
                            onClick={() => setImageMode("upload")}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${imageMode === "upload"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Upload className="h-3.5 w-3.5" />
                            Tải ảnh lên
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageMode("url")}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${imageMode === "url"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Link2 className="h-3.5 w-3.5" />
                            Dán URL
                        </button>
                    </div>

                    {/* Upload mode */}
                    {imageMode === "upload" && (
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                disabled={loading || uploading}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-60"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                JPG, PNG, WebP — Tối đa 5MB
                            </p>
                        </div>
                    )}

                    {/* URL mode */}
                    {imageMode === "url" && (
                        <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => handleUrlInput(e.target.value)}
                            disabled={loading}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                        />
                    )}

                    {/* Preview */}
                    {previewUrl && (
                        <div className="relative mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="mx-auto h-40 w-full object-contain"
                                onError={() => {
                                    if (imageMode === "url") {
                                        toast("Không thể tải ảnh từ URL này.", "error");
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute right-2 top-2 rounded-full bg-gray-900/60 p-1 text-white transition-colors hover:bg-gray-900/80"
                                aria-label="Xóa ảnh"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Upload progress indicator ─────────────────────── */}
                {uploading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải ảnh lên Supabase Storage...
                    </div>
                )}

                {/* ── Actions ───────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading || uploading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading || uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {uploading
                                    ? "Đang tải ảnh..."
                                    : isEdit
                                        ? "Đang lưu..."
                                        : "Đang tạo..."}
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
