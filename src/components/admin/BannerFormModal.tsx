"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, ImageIcon, Link as LinkIcon, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Banner } from "@/lib/types/database";

export interface BannerFormData {
    title: string | null;
    image_url: string;
    link_url: string | null;
    is_active: boolean;
    sort_order: number;
}

interface BannerFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: BannerFormData) => Promise<void>;
    editingBanner?: Banner | null;
}

export default function BannerFormModal({
    open,
    onClose,
    onSubmit,
    editingBanner,
}: BannerFormModalProps) {
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const isEdit = !!editingBanner;

    useEffect(() => {
        if (editingBanner) {
            setTitle(editingBanner.title ?? "");
            setImageUrl(editingBanner.image_url);
            setLinkUrl(editingBanner.link_url ?? "");
            setIsActive(editingBanner.is_active);
            setSortOrder(editingBanner.sort_order);
        } else {
            reset();
        }
    }, [editingBanner, open]);

    function reset() {
        setTitle("");
        setImageUrl("");
        setLinkUrl("");
        setIsActive(true);
        setSortOrder(0);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!imageUrl.trim()) return;

        setLoading(true);
        try {
            await onSubmit({
                title: title.trim() || null,
                image_url: imageUrl.trim(),
                link_url: linkUrl.trim() || null,
                is_active: isActive,
                sort_order: sortOrder,
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
            title={isEdit ? "Cập nhật Banner" : "Thêm Banner Mới"}
            closeOnClickOutside={false}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Image URL */}
                <div>
                    <label
                        htmlFor="banner-image"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        URL Ảnh (Image URL) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            id="banner-image"
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required
                            disabled={loading}
                        />
                        <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    {imageUrl && imageUrl.startsWith("http") && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            <img
                                src={imageUrl}
                                alt="Banner preview"
                                className="w-full object-cover max-h-[160px]"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x400/eeeeee/999999?text=Image+Not+Found";
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label
                        htmlFor="banner-title"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Tiêu đề (Không bắt buộc)
                    </label>
                    <input
                        id="banner-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Khuyến mãi Tết 2026..."
                        className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        disabled={loading}
                    />
                </div>

                {/* Link URL */}
                <div>
                    <label
                        htmlFor="banner-link"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Đường dẫn (URL điều hướng khi click)
                    </label>
                    <div className="relative">
                        <input
                            id="banner-link"
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://... hoặc /danh-muc/den-led"
                            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            disabled={loading}
                        />
                        <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Status and Sort Order */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="banner-sort"
                            className="mb-1.5 block text-sm font-medium text-gray-700"
                        >
                            Thứ tự ưu tiên
                        </label>
                        <input
                            id="banner-sort"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(Number(e.target.value))}
                            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Số nhỏ xếp trước
                        </p>
                    </div>

                    <div className="flex flex-col justify-center">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 opacity-0 mb-1">Trạng thái</label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                disabled={loading}
                            />
                            <span className="text-sm font-medium text-gray-900">
                                Hiển thị banner này
                            </span>
                        </label>
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
                        disabled={loading || !imageUrl.trim()}
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
