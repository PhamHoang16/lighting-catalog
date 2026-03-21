import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/types/database";

/**
 * Hero Block — hiển thị 3 bài viết nổi bật nhất.
 * Desktop: CSS Grid 3 cột, bài top 1 chiếm 2 cột, top 2 & 3 xếp chồng cột 3.
 * Mobile:  Stack dọc đơn giản.
 */
export default function NewsHeroBlock({ posts }: { posts: Post[] }) {
    if (posts.length === 0) return null;

    const [hero, second, third] = posts;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* ── Top 1: Bài nổi bật nhất — chiếm 2 cột ─────────── */}
            <Link
                href={`/tin-tuc/${hero.slug}`}
                className="group relative col-span-1 md:col-span-2 overflow-hidden rounded-2xl bg-gray-900"
            >
                {/* Thumbnail */}
                <div className="aspect-[16/9] md:aspect-[2/1] w-full overflow-hidden">
                    {hero.thumbnail_url ? (
                        <img
                            src={hero.thumbnail_url}
                            alt={hero.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-600 to-orange-700" />
                    )}
                </div>

                {/* Gradient overlay + text nằm đè lên ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        Nổi bật
                    </span>
                    <h2 className="mt-2 text-xl font-extrabold leading-snug text-white sm:text-2xl md:text-3xl line-clamp-3 drop-shadow-sm">
                        {hero.title}
                    </h2>
                    {hero.summary && (
                        <p className="mt-2 text-sm leading-relaxed text-gray-200 line-clamp-2 max-w-2xl hidden sm:block">
                            {hero.summary}
                        </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-300">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(hero.created_at)}
                    </div>
                </div>
            </Link>

            {/* ── Top 2 & 3: Cột phải xếp chồng ─────────────────── */}
            <div className="col-span-1 flex flex-col gap-4">
                {second && <HeroSecondaryCard post={second} />}
                {third && <HeroSecondaryCard post={third} />}
            </div>
        </div>
    );
}

function HeroSecondaryCard({ post }: { post: Post }) {
    return (
        <Link
            href={`/tin-tuc/${post.slug}`}
            className="group relative flex-1 overflow-hidden rounded-2xl bg-gray-900"
        >
            <div className="aspect-[16/9] md:aspect-auto md:h-full w-full overflow-hidden">
                {post.thumbnail_url ? (
                    <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-orange-500 to-amber-600" />
                )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="text-sm font-bold leading-snug text-white sm:text-base line-clamp-2 drop-shadow-sm">
                    {post.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-300">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.created_at)}
                </div>
            </div>
        </Link>
    );
}
