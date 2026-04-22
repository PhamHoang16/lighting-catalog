"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, PackageOpen, ImageOff, Flame, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PaginationControls from "@/components/ui/PaginationControls";
import type { ProductWithCategory } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

interface ProductTableProps {
    products: ProductWithCategory[];
    onEdit: (product: ProductWithCategory) => void;
    onDelete: (id: string) => Promise<void>;
    onToggleBestSeller?: (id: string, current: boolean) => Promise<void>;
    onUpdateSortOrder?: (id: string, value: number) => Promise<void>;
    pagination?: {
        currentPage: number;
        totalCount: number;
        pageSize: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (size: number) => void;
    };
}

export default function ProductTable({
    products,
    onEdit,
    onDelete,
    onToggleBestSeller,
    onUpdateSortOrder,
    pagination,
}: ProductTableProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] =
        useState<ProductWithCategory | null>(null);
    const [deleting, setDeleting] = useState(false);

    function openDeleteConfirm(product: ProductWithCategory) {
        setDeletingProduct(product);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!deletingProduct) return;
        setDeleting(true);
        await onDelete(deletingProduct.id);
        setDeleting(false);
        setConfirmOpen(false);
        setDeletingProduct(null);
    }

    // ── Empty state ─────────────────────────────────────────────
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <PackageOpen className="h-7 w-7 text-gray-400" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                        Chưa có sản phẩm nào
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Bấm &quot;Thêm sản phẩm&quot; để bắt đầu.
                    </p>
                </div>
            </div>
        );
    }

    // ── Table ───────────────────────────────────────────────────
    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-gray-600">
                                    Ảnh
                                </th>
                                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                    Sản phẩm
                                </th>
                                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                    Giá
                                </th>
                                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                    Danh mục
                                </th>
                                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                    Ngày tạo
                                </th>
                                <th
                                    className="whitespace-nowrap px-4 py-3.5 text-center font-semibold text-gray-600 cursor-help"
                                    title="Thứ tự hiển thị trên storefront. Số nhỏ hơn = hiển thị trước. Mặc định 0 = sắp xếp theo ngày tạo."
                                >
                                    Thứ tự ↕
                                </th>
                                <th className="whitespace-nowrap px-4 py-3.5 text-center font-semibold text-gray-600">
                                    Bán chạy
                                </th>
                                <th className="whitespace-nowrap px-6 py-3.5 text-right font-semibold text-gray-600">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="transition-colors hover:bg-gray-50/50"
                                >
                                    {/* Thumbnail */}
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <ProductThumbnail
                                            src={product.image_url}
                                            alt={product.name}
                                        />
                                    </td>

                                    {/* Tên + Slug */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {product.name}
                                            </p>
                                            <code className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                                                {product.slug}
                                            </code>
                                        </div>
                                    </td>

                                    {/* Giá */}
                                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-emerald-700">
                                        {vndFormat.format(product.price)}
                                    </td>

                                    {/* Danh mục */}
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {product.categories?.name ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                {product.categories.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs italic text-gray-400">
                                                Chưa phân loại
                                            </span>
                                        )}
                                    </td>

                                    {/* Ngày tạo */}
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                        {product.created_at
                                            ? formatDate(product.created_at)
                                            : "—"}
                                    </td>

                                    {/* Thứ tự hiển thị */}
                                    <td className="whitespace-nowrap px-4 py-3 text-center">
                                        <SortOrderCell
                                            productId={product.id}
                                            sortOrder={(product as any).sort_order ?? 0}
                                            onSave={onUpdateSortOrder}
                                        />
                                    </td>

                                    {/* Best seller toggle */}
                                    <td className="whitespace-nowrap px-4 py-4 text-center">
                                        <button
                                            onClick={() => onToggleBestSeller?.(product.id, (product as any).is_best_seller ?? false)}
                                            className={`rounded-lg p-2 transition-colors ${
                                                (product as any).is_best_seller
                                                    ? "bg-orange-50 text-orange-500 hover:bg-orange-100"
                                                    : "text-gray-300 hover:bg-gray-50 hover:text-gray-400"
                                            }`}
                                            title={(product as any).is_best_seller ? "Bỏ bán chạy" : "Đánh dấu bán chạy"}
                                        >
                                            <Flame className={`h-4 w-4 ${(product as any).is_best_seller ? 'fill-current' : ''}`} />
                                        </button>
                                    </td>

                                    {/* Thao tác */}
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                title="Chỉnh sửa"
                                                aria-label={`Sửa ${product.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirm(product)}
                                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Xóa"
                                                aria-label={`Xóa ${product.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalCount > 0 && (
                    <PaginationControls
                        currentPage={pagination.currentPage}
                        totalCount={pagination.totalCount}
                        pageSize={pagination.pageSize}
                        onPageChange={pagination.onPageChange}
                        onPageSizeChange={pagination.onPageSizeChange}
                    />
                )}
            </div>

            {/* Confirm Delete */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingProduct(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.name ?? ""}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa sản phẩm"
                loading={deleting}
            />
        </>
    );
}

// ── Sort order inline-edit cell ─────────────────────────────────
function SortOrderCell({
    productId,
    sortOrder,
    onSave,
}: {
    productId: string;
    sortOrder: number;
    onSave?: (id: string, value: number) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(String(sortOrder));
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(String(sortOrder));
    }, [sortOrder]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    async function handleSave() {
        const num = parseInt(value, 10);
        if (isNaN(num) || num === sortOrder) {
            setEditing(false);
            setValue(String(sortOrder));
            return;
        }
        setSaving(true);
        try {
            await onSave?.(productId, num);
        } catch {
            setValue(String(sortOrder));
        }
        setSaving(false);
        setEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") { e.preventDefault(); handleSave(); }
        else if (e.key === "Escape") { setEditing(false); setValue(String(sortOrder)); }
    }

    if (saving) {
        return (
            <div className="flex h-8 w-14 items-center justify-center mx-auto">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
        );
    }

    if (editing) {
        return (
            <input
                ref={inputRef}
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="mx-auto block w-16 rounded-lg border border-blue-400 bg-white px-2 py-1 text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                autoFocus
            />
        );
    }

    return (
        <button
            onClick={() => setEditing(true)}
            title="Nhấn để chỉnh thứ tự. Số nhỏ hơn = hiển thị trước. 0 = mặc định theo ngày tạo."
            className={`mx-auto flex h-8 w-14 items-center justify-center rounded-lg text-sm font-semibold transition-all hover:ring-2 hover:ring-blue-400/40 ${
                sortOrder === 0
                    ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100"
            }`}
        >
            {sortOrder === 0 ? "—" : sortOrder}
        </button>
    );
}

// ── Thumbnail sub-component with fallback ───────────────────────
function ProductThumbnail({
    src,
    alt,
}: {
    src: string | null;
    alt: string;
}) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <ImageOff className="h-5 w-5 text-gray-300" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
            onError={() => setHasError(true)}
        />
    );
}
