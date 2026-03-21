import Link from "next/link";
import { Calendar, Newspaper, Flame } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types/database";

export default function NewsPopularScroll({ posts }: { posts: Post[] }) {
    if (posts.length === 0) return null;

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center gap-3 border-b border-orange-100 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                    <Flame className="h-5 w-5 fill-current animate-pulse" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl">
                    <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        Xem nhiều tuần qua
                    </span>
                </h2>
            </div>

            {/* Container trượt ngang */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/tin-tuc/${post.slug}`}
                        className="group flex flex-col w-60 sm:w-64 md:w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-orange-200"
                    >
                        {/* Ảnh trên */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                            {post.thumbnail_url ? (
                                <img
                                    src={post.thumbnail_url}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
                                    <Newspaper className="h-10 w-10 text-orange-300" />
                                </div>
                            )}
                        </div>

                        {/* Nội dung dưới */}
                        <div className="flex flex-1 flex-col p-4">
                            <h3 className="mb-2 text-sm md:text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {post.title}
                            </h3>
                            <div className="mt-auto flex items-center gap-1.5 text-xs text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(post.created_at)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
