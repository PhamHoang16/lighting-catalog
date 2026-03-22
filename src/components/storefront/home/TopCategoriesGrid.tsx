import Link from "next/link";
import { Grid2X2, ImageOff, Layers } from "lucide-react";
import type { Category } from "@/lib/types/database";

interface TopCategoriesGridProps {
    categories: Category[];
}

export default function TopCategoriesGrid({ categories }: TopCategoriesGridProps) {
    if (!categories || categories.length === 0) return null;

    // Responsive limits for 2 rows
    // Mobile: 4 cols x 2 rows = 8 items
    // Tablet (md): 5 cols x 2 rows = 10 items
    // Desktop (lg): 6/8 cols x 2 rows = 12-16 items. Let's stick to max 12 (6 cols x 2 rows) for a clean look. Let's use CSS grid with responsive limits using code.
    // Instead of complex client-side JS resizing, let's limit universally to 11 top categories + 1 "Khác" (Others), total 12 slots. 
    // On mobile (cols-4), it will be 3 rows. On desktop (cols-6), it will be 2 rows.

    const maxItems = 12;
    const itemsToShow = categories.slice(0, maxItems - 1);
    const hasMore = categories.length > maxItems - 1;

    return (
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 relative">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 p-4 sm:p-6 shadow-sm border border-amber-500/10 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-orange-400/5 blur-3xl pointer-events-none" />

                <div className="mb-6 flex items-center justify-between border-b border-gray-100/50 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20">
                            <Layers className="h-5 w-5 fill-current" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 sm:text-2xl">
                            Danh Mục Nổi Bật
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:gap-4 relative z-10">
                    {itemsToShow.map((cat) => (
                        <CategoryGridItem key={cat.id} category={cat} />
                    ))}

                    {/* the 'Others' item if there are more categories or just as a 'View all' link */}
                    {(hasMore || true) && (
                        <Link
                            href="/danh-muc"
                            className="group flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm p-2 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg sm:p-4 border border-transparent hover:border-amber-200"
                        >
                            <div className="mb-3 flex aspect-square w-full max-w-[70px] sm:max-w-[90px] lg:max-w-[100px] items-center justify-center rounded-3xl bg-gray-50 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-gray-100 transition-colors group-hover:bg-amber-100 group-hover:ring-amber-200">
                                <Grid2X2 className="h-6 w-6 text-gray-400 transition-colors group-hover:text-amber-600 sm:h-8 sm:w-8" />
                            </div>
                            <span className="text-center text-xs sm:text-sm lg:text-base text-gray-600 transition-colors group-hover:text-amber-700">
                                Xem tất cả
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

function CategoryGridItem({ category }: { category: Category }) {
    const hasImage = !!category.image_url;

    return (
        <Link
            href={`/danh-muc/${category.slug}`}
            className="group flex flex-col items-center rounded-2xl bg-white/60 backdrop-blur-sm p-2 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-lg sm:p-4 border border-transparent hover:border-amber-200"
        >
            <div className="mb-3 relative flex aspect-square w-full max-w-[70px] sm:max-w-[90px] lg:max-w-[100px] items-center justify-center overflow-hidden rounded-3xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-gray-100/50 transition-all group-hover:ring-amber-300">
                {hasImage ? (
                    <img
                        src={category.image_url!}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <ImageOff className="h-6 w-6 text-gray-300 sm:h-8 sm:w-8" />
                )}
            </div>
            <span className="w-full text-center text-xs sm:text-sm lg:text-base font-bold text-gray-800 transition-colors group-hover:text-amber-700 line-clamp-2 leading-tight">
                {category.name}
            </span>
        </Link>
    );
}
