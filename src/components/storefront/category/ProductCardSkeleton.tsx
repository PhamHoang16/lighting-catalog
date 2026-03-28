import { ShoppingCart } from "lucide-react";

export default function ProductCardSkeleton() {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white animate-pulse">
            {/* ── Image Skeleton ─────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden bg-gray-200" />

            {/* ── Content Skeleton ───────────────────────────────── */}
            <div className="flex flex-1 flex-col p-3 sm:p-4">
                {/* Title Skeleton - 2 lines */}
                <div className="mb-2 space-y-2 min-h-[2.5rem] sm:min-h-[2.75rem]">
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>

                {/* Specs Skeleton */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5 min-h-[20px]">
                    <div className="h-4 w-20 rounded bg-gray-100 sm:w-24" />
                </div>

                {/* Ratings & Sold Skeleton */}
                <div className="mb-3 mt-auto h-4 w-1/2 rounded bg-gray-100" />

                {/* Bottom Row Skeleton */}
                <div className="flex items-end justify-between border-t border-gray-100/50 pt-2.5">
                    <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-16 rounded bg-gray-100" />
                        <div className="h-6 w-24 rounded bg-gray-200" />
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
