"use client";

import { Pencil, Trash2, ImageIcon, GripVertical, ExternalLink } from "lucide-react";
import type { Banner } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

interface BannerTableProps {
    banners: Banner[];
    onEdit: (banner: Banner) => void;
    onDelete: (banner: Banner) => void;
}

export default function BannerTable({ banners, onEdit, onDelete }: BannerTableProps) {
    if (banners.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                <ImageIcon className="h-12 w-12 text-gray-300" />
                <div>
                    <p className="font-medium text-gray-600">Chưa có banner nào</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Nhấn nút &quot;Thêm banner&quot; để bắt đầu
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
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 w-16">
                                Thứ tự
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Hình ảnh
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tiêu đề & Link
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Trạng thái
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
                        {banners.map((banner) => (
                            <tr
                                key={banner.id}
                                className="transition-colors hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                                        {banner.sort_order}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-16 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        {banner.image_url ? (
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title || "Banner"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {banner.title || <span className="text-gray-400 italic">Không có tiêu đề</span>}
                                    </div>
                                    {banner.link_url && (
                                        <a
                                            href={banner.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            <span className="truncate max-w-[200px]">{banner.link_url}</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {banner.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            Hiển thị
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                                            Đã ẩn
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(banner.created_at)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(banner)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => onDelete(banner)}
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
