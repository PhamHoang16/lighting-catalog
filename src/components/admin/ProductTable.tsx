"use client";

import { useState } from "react";
import { Pencil, Trash2, PackageOpen, ImageOff } from "lucide-react";
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
