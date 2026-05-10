"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, ImageIcon, Type } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Post } from "@/lib/types/database";
import { toSlug } from "@/lib/utils";
import RichTextEditor from "./product-form/RichTextEditor";
import ImageUploader from "./product-form/ImageUploader";
import type { PendingImage } from "./product-form/ImageUploader";

export interface PostFormData {
    title: string;
    slug: string;
    thumbnail_url: string | null;
    summary: string | null;
    content: string | null;
    is_published: boolean;
    is_featured: boolean;
    is_popular: boolean;
}

interface PostFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PostFormData) => Promise<void>;
    editingPost?: Post | null;
}

export default function PostFormModal({
    open,
    onClose,
    onSubmit,
    editingPost,
}: PostFormModalProps) {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");

    const [thumbExisting, setThumbExisting] = useState<string[]>([]);
    const [thumbPending, setThumbPending] = useState<PendingImage[]>([]);
    const [isPublished, setIsPublished] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isPopular, setIsPopular] = useState(false);
    const [loading, setLoading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const isEdit = !!editingPost;

    useEffect(() => {
        if (editingPost) {
            setTitle(editingPost.title);
            setSlug(editingPost.slug);
            setThumbExisting(editingPost.thumbnail_url ? [editingPost.thumbnail_url] : []);
            setThumbPending([]);
            setSummary(editingPost.summary ?? "");
            setContent(editingPost.content ?? "");
            setIsPublished(editingPost.is_published);
            setIsFeatured(editingPost.is_featured);
            setIsPopular(editingPost.is_popular);
            setSlugManuallyEdited(true);
        } else {
            reset();
        }
    }, [editingPost, open]);

    function reset() {
        setTitle("");
        setSlug("");
        setThumbExisting([]);
        setThumbPending([]);
        setSummary("");
        setContent("");
        setIsPublished(false);
        setIsFeatured(false);
        setIsPopular(false);
        setSlugManuallyEdited(false);
    }

    // Auto-generate slug from title
    function handleTitleChange(value: string) {
        setTitle(value);
        if (!slugManuallyEdited) {
            setSlug(toSlug(value));
        }
    }

    function handleSlugChange(value: string) {
        setSlugManuallyEdited(true);
        setSlug(toSlug(value));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!title.trim() || !slug.trim()) return;

        setLoading(true);
        try {
            const newThumbUrls = await resolvePendingImages(thumbPending);
            const finalThumbUrl = newThumbUrls[0] ?? thumbExisting[0] ?? null;

            await onSubmit({
                title: title.trim(),
                slug: slug.trim(),
                thumbnail_url: finalThumbUrl,
                summary: summary.trim() || null,
                content: content.trim() || null,
                is_published: isPublished,
                is_featured: isFeatured,
                is_popular: isPopular,
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

    // ── Upload a single file → return public URL ─────────────────────
    async function uploadFile(file: File): Promise<string> {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "posts");

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

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Cập nhật Bài viết" : "Thêm Bài viết Mới"}
            maxWidth="max-w-4xl"
            closeOnClickOutside={false}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label
                        htmlFor="post-title"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="post-title"
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="VD: Cách chọn đèn LED cho phòng khách..."
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label
                        htmlFor="post-slug"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Slug (URL) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="post-slug"
                            type="text"
                            value={slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            placeholder="cach-chon-den-led-cho-phong-khach"
                            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pl-10 text-sm text-gray-900 font-mono placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                            disabled={loading}
                        />
                        <Type className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Đường dẫn: /tin-tuc/<span className="font-medium text-indigo-600">{slug || "..."}</span>
                    </p>
                </div>

                {/* Image Upload */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <ImageUploader
                        label="Ảnh bìa (Thumbnail)"
                        multiple={false}
                        existingUrls={thumbExisting}
                        pendingImages={thumbPending}
                        onPendingChange={setThumbPending}
                        onExistingRemove={() => setThumbExisting([])}
                        disabled={loading}
                    />
                </div>

                {/* Summary */}
                <div>
                    <label
                        htmlFor="post-summary"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Mô tả ngắn (SEO Description)
                    </label>
                    <textarea
                        id="post-summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Tóm tắt nội dung bài viết trong 1-2 câu..."
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                        disabled={loading}
                    />
                </div>

                {/* Content - Rich Text Editor */}
                <div>
                    <RichTextEditor 
                        value={content}
                        onChange={setContent}
                        disabled={loading}
                    />
                </div>

                {/* Settings toggles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Publish toggle */}
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <label className="relative inline-flex cursor-pointer items-center mt-1">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="peer sr-only"
                                disabled={loading}
                            />
                            <div className="peer h-6 w-11 shrink-0 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-emerald-300" />
                        </label>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Xuất bản
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Hiển thị công khai trên website.
                            </p>
                        </div>
                    </div>

                    {/* Featured toggle */}
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <label className="relative inline-flex cursor-pointer items-center mt-1">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="peer sr-only"
                                disabled={loading}
                            />
                            <div className="peer h-6 w-11 shrink-0 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-amber-300" />
                        </label>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Nổi bật
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Hiển thị to ở phần đầu trang (Khối 1).
                            </p>
                        </div>
                    </div>

                    {/* Popular toggle */}
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <label className="relative inline-flex cursor-pointer items-center mt-1">
                            <input
                                type="checkbox"
                                checked={isPopular}
                                onChange={(e) => setIsPopular(e.target.checked)}
                                className="peer sr-only"
                                disabled={loading}
                            />
                            <div className="peer h-6 w-11 shrink-0 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-orange-300" />
                        </label>
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Xem nhiều
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Đưa vào slide trượt ngang (Khối 2).
                            </p>
                        </div>
                    </div>
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
                        disabled={loading || !title.trim() || !slug.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
