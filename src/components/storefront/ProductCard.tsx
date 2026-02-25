import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

interface ProductCardProps {
    product: Product;
    /** Tên danh mục hiển thị badge (optional) */
    categoryName?: string;
}

export default function ProductCard({
    product,
    categoryName,
}: ProductCardProps) {
    return (
        <Link
            href={`/san-pham/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10"
        >
            {/* ── Image placeholder ──────────────────────────────── */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                {/* Gradient placeholder — sẽ thay bằng next/image khi có ảnh thật */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                        <svg
                            className="h-8 w-8 text-amber-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                            />
                        </svg>
                    </div>
                </div>

                {/* Category badge */}
                {categoryName && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
                        {categoryName}
                    </span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* ── Content ────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-amber-700">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-amber-600">
                        {vndFormat.format(product.price)}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors group-hover:text-amber-600">
                        Chi tiết
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
