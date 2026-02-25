"use client";

import { Pencil, Trash2, FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/lib/types/database";

interface CategoryTableProps {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export default function CategoryTable({
    categories,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white py-16 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <FolderOpen className="h-7 w-7 text-gray-400" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                        Chưa có danh mục nào
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        Bấm &quot;Thêm danh mục&quot; để bắt đầu.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                Tên danh mục
                            </th>
                            <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                Slug
                            </th>
                            <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                Ngày tạo
                            </th>
                            <th className="whitespace-nowrap px-6 py-3.5 text-right font-semibold text-gray-600">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.map((cat) => (
                            <tr
                                key={cat.id}
                                className="transition-colors hover:bg-gray-50/50"
                            >
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                    {cat.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">
                                        {cat.slug}
                                    </code>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                    {cat.created_at ? formatDate(cat.created_at) : "—"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => onEdit(cat)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                            title="Chỉnh sửa"
                                            aria-label={`Sửa ${cat.name}`}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(cat)}
                                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            title="Xóa"
                                            aria-label={`Xóa ${cat.name}`}
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

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3">
                <p className="text-xs text-gray-500">
                    Tổng cộng{" "}
                    <span className="font-semibold text-gray-700">
                        {categories.length}
                    </span>{" "}
                    danh mục
                </p>
            </div>
        </div>
    );
}
