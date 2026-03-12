"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toSlug } from "@/lib/utils";
import type { Brand } from "@/lib/types/database";

export interface BrandFormData {
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
}

interface BrandFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: BrandFormData) => Promise<void>;
    editingBrand?: Brand | null;
}

export default function BrandFormModal({
    open,
    onClose,
    onSubmit,
    editingBrand,
}: BrandFormModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const isEdit = !!editingBrand;

    useEffect(() => {
        if (editingBrand) {
            setName(editingBrand.name);
            setSlug(editingBrand.slug);
            setLogoUrl(editingBrand.logo_url ?? "");
            setDescription(editingBrand.description ?? "");
        }
    }, [editingBrand]);

    useEffect(() => {
        if (!isEdit && name && !slug) {
            setSlug(toSlug(name));
        }
    }, [name, slug, isEdit]);

    function reset() {
        setName("");
        setSlug("");
        setLogoUrl("");
        setDescription("");
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) return;

        setLoading(true);
        try {
            await onSubmit({
                name: name.trim(),
                slug: slug.trim(),
                logo_url: logoUrl.trim() || null,
                description: description.trim() || null,
            });
            reset();
        } catch {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        reset();
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu Mới"}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                    <label
                        htmlFor="brand-name"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Tên thương hiệu <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="brand-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Philips, Rang Dong, Dien Quang..."
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label
                        htmlFor="brand-slug"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="brand-slug"
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="philips"
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                        disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        URL-friendly identifier (auto-filled từ tên)
                    </p>
                </div>

                {/* Logo URL */}
                <div>
                    <label
                        htmlFor="brand-logo"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        URL logo
                    </label>
                    <div className="relative">
                        <input
                            id="brand-logo"
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            disabled={loading}
                        />
                        <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    {logoUrl && (
                        <div className="mt-2 h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
                            <img
                                src={logoUrl}
                                alt="Logo preview"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label
                        htmlFor="brand-description"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Mô tả ngắn
                    </label>
                    <textarea
                        id="brand-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Thông tin về thương hiệu..."
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        disabled={loading}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !name.trim() || !slug.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
