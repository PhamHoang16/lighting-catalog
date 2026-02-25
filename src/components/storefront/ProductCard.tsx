import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import type { Product } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

interface ProductCardProps {
    product: Product;
    categoryName?: string;
}

export default function ProductCard({
    product,
    categoryName,
}: ProductCardProps) {
    const hasImage = !!product.image_url;
    const priceDisplay =
        product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";

    return (
        <Link
            href={`/san-pham/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10"
        >
            {/* ── Image ────────────────────────────────────────────── */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                {hasImage ? (
                    <img
                        src={product.image_url!}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                            <ImageOff className="h-7 w-7 text-amber-300" />
                        </div>
                    </div>
                )}

                {/* Category badge */}
                {categoryName && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
                        {categoryName}
                    </span>
                )}

                {/* Add to cart — top right */}
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            image_url: product.image_url,
                            price: product.price,
                        }}
                        size="sm"
                    />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* ── Content ──────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-amber-700">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center justify-between pt-2">
                    <span
                        className={`text-base font-bold ${product.price > 0 ? "text-amber-600" : "text-gray-500"
                            }`}
                    >
                        {priceDisplay}
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
