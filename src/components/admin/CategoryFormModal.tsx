"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toSlug } from "@/lib/utils";
import type { Category } from "@/lib/types/database";

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; slug: string }) => Promise<void>;
    /** If provided, modal is in "Edit" mode */
    editingCategory?: Category | null;
}

export default function CategoryFormModal({
    open,
    onClose,
    onSubmit,
    editingCategory,
}: CategoryFormModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);

    const isEdit = !!editingCategory;

    // Populate fields when editing
    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name);
            setSlug(editingCategory.slug);
        } else {
            setName("");
            setSlug("");
        }
    }, [editingCategory, open]);

    // Auto-generate slug from name
    useEffect(() => {
        if (name) {
            setSlug(toSlug(name));
        } else {
            setSlug("");
        }
    }, [name]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onSubmit({ name: name.trim(), slug });
            setName("");
            setSlug("");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        if (!loading) {
            setName("");
            setSlug("");
            onClose();
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name input */}
                <div>
                    <label
                        htmlFor="category-name"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category-name"
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

                {/* Slug preview */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-500">
                        Slug (tự động tạo)
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                        {slug || "—"}
                    </div>
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
