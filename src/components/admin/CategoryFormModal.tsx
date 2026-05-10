"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toSlug } from "@/lib/utils";
import type { Category } from "@/lib/types/database";
import ImageUploader from "./product-form/ImageUploader";
import type { PendingImage } from "./product-form/ImageUploader";

export interface CategoryFormData {
    name: string;
    slug: string;
    parent_id: string | null;
    image_url: string | null;
    description: string | null;
}

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => Promise<void>;
    editingCategory?: Category | null;
    allCategories: Category[]; // for parent dropdown
}

export default function CategoryFormModal({
    open,
    onClose,
    onSubmit,
    editingCategory,
    allCategories,
}: CategoryFormModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [parentId, setParentId] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const [thumbExisting, setThumbExisting] = useState<string[]>([]);
    const [thumbPending, setThumbPending] = useState<PendingImage[]>([]);

    const isEdit = !!editingCategory;

    // Exclude self and own children from parent options (prevent circular)
    const parentOptions = allCategories.filter(
        (c) => !editingCategory || (c.id !== editingCategory.id && c.parent_id !== editingCategory.id)
    );

    // Only show top-level categories as potential parents
    const topLevelParents = parentOptions.filter((c) => !c.parent_id);

    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name);
            setSlug(editingCategory.slug);
            setParentId(editingCategory.parent_id ?? "");
            setDescription(editingCategory.description ?? "");
            setThumbExisting(editingCategory.image_url ? [editingCategory.image_url] : []);
            setThumbPending([]);
        } else {
            setName("");
            setSlug("");
            setParentId("");
            setDescription("");
            setThumbExisting([]);
            setThumbPending([]);
        }
    }, [editingCategory, open]);

    useEffect(() => {
        if (!isEdit) {
            setSlug(name ? toSlug(name) : "");
        } else if (name && name !== editingCategory?.name) {
            setSlug(toSlug(name));
        }
    }, [name, isEdit, editingCategory?.name]);

    // ── Upload a single file → return public URL ─────────────────────
    async function uploadFile(file: File): Promise<string> {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "categories");

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok || json.error) {
            throw new Error(json.error ?? "Upload thất bại");
        }

        return json.url as string;
    }

    async function resolvePendingImages(pending: PendingImage[]): Promise<string[]> {
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

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        const finalSlug = slug || toSlug(name.trim());

        setLoading(true);
        try {
            const newThumbUrls = await resolvePendingImages(thumbPending);
            const finalThumbUrl = newThumbUrls[0] ?? thumbExisting[0] ?? null;

            await onSubmit({
                name: name.trim(),
                slug: finalSlug,
                parent_id: parentId || null,
                image_url: finalThumbUrl,
                description: description.trim() || null,
            });
            setName("");
            setSlug("");
            setParentId("");
            setDescription("");
            setThumbExisting([]);
            setThumbPending([]);
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setName("");
            setSlug("");
            setParentId("");
            setDescription("");
            setThumbExisting([]);
            setThumbPending([]);
            onClose();
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            closeOnClickOutside={false}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label htmlFor="cat-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="cat-name"
                        type="text"
                        required
                        autoFocus
                        placeholder="Ví dụ: Đèn LED Panel"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-500">
                        Slug (tự động tạo)
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                        {slug || "—"}
                    </div>
                </div>

                {/* Parent category */}
                <div>
                    <label htmlFor="cat-parent" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Danh mục cha
                    </label>
                    <select
                        id="cat-parent"
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="">— Không (danh mục gốc) —</option>
                        {topLevelParents.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                        Để trống nếu đây là danh mục cấp cao nhất
                    </p>
                </div>

                {/* Image Upload */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <ImageUploader
                        label="Ảnh danh mục"
                        multiple={false}
                        existingUrls={thumbExisting}
                        pendingImages={thumbPending}
                        onPendingChange={setThumbPending}
                        onExistingRemove={() => setThumbExisting([])}
                        disabled={loading}
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="cat-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
                        Mô tả ngắn
                    </label>
                    <textarea
                        id="cat-desc"
                        rows={2}
                        placeholder="Mô tả ngắn gọn về danh mục..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
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
                        disabled={loading || !name.trim()}
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
                            "Thêm danh mục"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
