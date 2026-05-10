"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toSlug } from "@/lib/utils";
import type { Brand } from "@/lib/types/database";
import ImageUploader from "./product-form/ImageUploader";
import type { PendingImage } from "./product-form/ImageUploader";

export interface BrandFormData {
    name: string;
    slug: string;
    logo_url: string | null;
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
    const [loading, setLoading] = useState(false);

    const [thumbExisting, setThumbExisting] = useState<string[]>([]);
    const [thumbPending, setThumbPending] = useState<PendingImage[]>([]);

    const isEdit = !!editingBrand;

    useEffect(() => {
        if (editingBrand) {
            setName(editingBrand.name);
            setSlug(editingBrand.slug);
            setThumbExisting(editingBrand.logo_url ? [editingBrand.logo_url] : []);
            setThumbPending([]);
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
        setThumbExisting([]);
        setThumbPending([]);
    }

    // ── Upload a single file → return public URL ─────────────────────
    async function uploadFile(file: File): Promise<string> {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "brands");

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
        if (!name.trim() || !slug.trim()) return;

        setLoading(true);
        try {
            const newThumbUrls = await resolvePendingImages(thumbPending);
            const finalThumbUrl = newThumbUrls[0] ?? thumbExisting[0] ?? null;

            await onSubmit({
                name: name.trim(),
                slug: slug.trim(),
                logo_url: finalThumbUrl,
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
            closeOnClickOutside={false}
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

                {/* Image Upload */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <ImageUploader
                        label="Logo thương hiệu"
                        multiple={false}
                        existingUrls={thumbExisting}
                        pendingImages={thumbPending}
                        onPendingChange={setThumbPending}
                        onExistingRemove={() => setThumbExisting([])}
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
