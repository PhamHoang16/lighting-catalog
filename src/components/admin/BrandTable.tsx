"use client";

import { Pencil, Trash2, Package } from "lucide-react";
import type { Brand } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

interface BrandTableProps {
    brands: Brand[];
    onEdit: (brand: Brand) => void;
    onDelete: (brand: Brand) => void;
}

export default function BrandTable({ brands, onEdit, onDelete }: BrandTableProps) {
    if (brands.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                <Package className="h-12 w-12 text-gray-300" />
                <div>
                    <p className="font-medium text-gray-600">Chưa có thương hiệu nào</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Nhấn nút &quot;Thêm thương hiệu&quot; để bắt đầu
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Logo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tên thương hiệu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Slug
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {brands.map((brand) => (
                            <tr
                                key={brand.id}
                                className="transition-colors hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        {brand.logo_url ? (
                                            <img
                                                src={brand.logo_url}
                                                alt={brand.name}
                                                className="h-full w-full object-contain p-1"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {brand.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        {brand.slug}
                                    </code>
                                </td>

                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(brand.created_at)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(brand)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => onDelete(brand)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
