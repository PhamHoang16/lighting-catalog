"use client";

import { Pencil, Trash2, FolderOpen, ChevronRight, ImageOff } from "lucide-react";
import { formatDate, buildCategoryTree } from "@/lib/utils";
import type { Category, CategoryWithChildren } from "@/lib/types/database";

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

    const tree = buildCategoryTree(categories);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                Danh mục
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
                        {tree.map((cat) => (
                            <CategoryRows
                                key={cat.id}
                                category={cat}
                                depth={0}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

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

// ── Recursive row renderer ──────────────────────────────────────
function CategoryRows({
    category,
    depth,
    onEdit,
    onDelete,
}: {
    category: CategoryWithChildren;
    depth: number;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
}) {
    return (
        <>
            <tr className="transition-colors hover:bg-gray-50/50">
                <td className="whitespace-nowrap px-6 py-3">
                    <div
                        className="flex items-center gap-3"
                        style={{ paddingLeft: `${depth * 24}px` }}
                    >
                        {/* Indent indicator */}
                        {depth > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        )}

                        {/* Thumbnail */}
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {category.image_url ? (
                                <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <FolderOpen className="h-4 w-4 text-gray-300" />
                                </div>
                            )}
                        </div>

                        <div>
                            <span className="font-medium text-gray-900">
                                {category.name}
                            </span>
                            {category.children.length > 0 && (
                                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                    {category.children.length} con
                                </span>
                            )}
                        </div>
                    </div>
                </td>
                <td className="whitespace-nowrap px-6 py-3">
                    <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">
                        {category.slug}
                    </code>
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-gray-500">
                    {category.created_at ? formatDate(category.created_at) : "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={() => onEdit(category)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            title="Chỉnh sửa"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(category)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Xóa"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Children */}
            {category.children.map((child) => (
                <CategoryRows
                    key={child.id}
                    category={child}
                    depth={depth + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </>
    );
}
