"use client";

import { Pencil, Trash2, Newspaper, ExternalLink, Eye, EyeOff } from "lucide-react";
import type { Post } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

interface PostTableProps {
    posts: Post[];
    onEdit: (post: Post) => void;
    onDelete: (post: Post) => void;
}

export default function PostTable({ posts, onEdit, onDelete }: PostTableProps) {
    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
                <Newspaper className="h-12 w-12 text-gray-300" />
                <div>
                    <p className="font-medium text-gray-600">Chưa có bài viết nào</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Nhấn nút &quot;Thêm bài viết&quot; để bắt đầu
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
                                Ảnh bìa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Tiêu đề & Tóm tắt
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
                        {posts.map((post) => (
                            <tr
                                key={post.id}
                                className="transition-colors hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <div className="h-14 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        {post.thumbnail_url ? (
                                            <img
                                                src={post.thumbnail_url}
                                                alt={post.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                <Newspaper className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="font-medium text-gray-900 line-clamp-1">
                                        {post.title}
                                    </div>
                                    {post.summary && (
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                            {post.summary}
                                        </p>
                                    )}
                                    <p className="mt-1 text-xs text-indigo-500 font-mono">
                                        /tin-tuc/{post.slug}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        {post.is_published ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                <Eye className="h-3 w-3" />
                                                Đã xuất bản
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                <EyeOff className="h-3 w-3" />
                                                Bản nháp
                                            </span>
                                        )}
                                        {/* Status badges for new flags */}
                                        <div className="flex items-center gap-1">
                                            {post.is_featured && (
                                                <span className="inline-flex items-center rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                                                    Nổi bật
                                                </span>
                                            )}
                                            {post.is_popular && (
                                                <span className="inline-flex items-center rounded-sm bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800 uppercase">
                                                    Xem nhiều
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {formatDate(post.created_at)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {post.is_published && (
                                            <a
                                                href={`/tin-tuc/${post.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Xem
                                            </a>
                                        )}
                                        <button
                                            onClick={() => onEdit(post)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => onDelete(post)}
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
