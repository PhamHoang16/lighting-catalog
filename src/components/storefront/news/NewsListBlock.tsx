"use client";

import Link from "next/link";
import { Calendar, Newspaper, Library } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types/database";

export default function NewsListBlock({ posts }: { posts: Post[] }) {
    if (posts.length === 0) return null;

    return (
        <div className="w-full">
            <div className="mb-8 flex items-center gap-3 border-b border-orange-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                    <Library className="h-5 w-5 fill-current" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl">
                    <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        Tất cả bài viết
                    </span>
                </h2>
            </div>

            {/* Dạng List đổ dọc */}
            <div className="flex flex-col gap-8 divide-y divide-gray-100">
                {posts.map((post, i) => (
                    <article
                        key={post.id}
                        className={`group flex flex-col md:flex-row gap-5 lg:gap-8 ${i > 0 && "pt-8"}`}
                    >
                        {/* Box ảnh (Trái) */}
                        <Link
                            href={`/tin-tuc/${post.slug}`}
                            className="block shrink-0 overflow-hidden rounded-2xl w-full md:w-72 lg:w-80 relative"
                        >
                            <div className="aspect-[16/9] w-full bg-gray-50 border border-gray-100/60 overflow-hidden">
                                {post.thumbnail_url ? (
                                    <img
                                        src={post.thumbnail_url}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
                                        <Newspaper className="h-10 w-10 text-amber-300" />
                                    </div>
                                )}
                            </div>
                        </Link>

                        {/* Box nội dung (Phải) */}
                        <div className="flex flex-1 flex-col py-1 md:py-2">
                            {/* Meta date */}
                            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-amber-600">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.created_at)}
                            </div>

                            {/* Tiêu đề */}
                            <Link href={`/tin-tuc/${post.slug}`}>
                                <h3 className="mb-3 text-xl font-bold leading-snug text-gray-900 group-hover:text-amber-700 transition-colors md:text-2xl line-clamp-2">
                                    {post.title}
                                </h3>
                            </Link>

                            {/* Tóm tắt */}
                            {post.summary && (
                                <p className="mb-4 text-base leading-relaxed text-gray-600 line-clamp-3">
                                    {post.summary}
                                </p>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {/* Nút Xem thêm (Mock Pagination) */}
            <div className="mt-12 flex justify-center">
                <button
                    className="rounded-xl border border-gray-300 bg-white px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-amber-300"
                    onClick={() => alert("Chức năng tải thêm bài chưa nối API")}
                >
                    Tải thêm tin khác
                </button>
            </div>
        </div>
    );
}
