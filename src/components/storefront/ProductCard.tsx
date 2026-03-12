import Link from "next/link";
import { ArrowRight, ImageOff, Layers } from "lucide-react";
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
    const hasVariants = !!(product.variants && product.variants.options.length > 0);
    const variantCount = hasVariants ? product.variants!.variants.length : 0;

    let priceDisplay: string;
    if (hasVariants) {
        const prices = product.variants!.variants
            .map((v) => v.price)
            .filter((p) => p > 0);
        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            priceDisplay = min === max
                ? vndFormat.format(min)
                : `Từ ${vndFormat.format(min)}`;
        } else {
            priceDisplay = product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";
        }
    } else {
        priceDisplay = product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";
    }

    return (
        <Link
            href={`/san-pham/${product.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
        >
            {/* ── Image ────────────────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                {hasImage ? (
                    <img
                        src={product.image_url!}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
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
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-md">
                        {categoryName}
                    </span>
                )}

                {/* Add to cart / Quick action */}
                <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
            </div>

            {/* ── Content ──────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Meta info row */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5 min-h-[22px]">
                    {product.specs && product.specs.length > 0 ? (
                        product.specs.slice(0, 2).map((spec, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 truncate max-w-[120px]"
                                title={`${spec.name}: ${spec.value}`}
                            >
                                <span className="text-gray-400 mr-1 truncate">{spec.name}:</span>
                                <span className="text-gray-700 truncate">{spec.value}</span>
                            </span>
                        ))
                    ) : (
                        hasVariants && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                <Layers className="h-2.5 w-2.5" />
                                {variantCount} tuỳ chọn
                            </span>
                        )
                    )}
                </div>

                {/* Title (Forced Min-Height for exactly 2 lines) */}
                <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-relaxed text-gray-900 transition-colors group-hover:text-amber-700 sm:min-h-[3rem] sm:text-base">
                    {product.name}
                </h3>

                {/* Bottom Row */}
                <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-3">
                    <span
                        className={`text-base font-bold sm:text-lg ${product.price > 0 ? "text-amber-600" : "text-gray-500"
                            }`}
                    >
                        {priceDisplay}
                    </span>
                    <span className="flex shrink-0 items-center justify-center rounded-full bg-gray-50 p-2 text-gray-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
