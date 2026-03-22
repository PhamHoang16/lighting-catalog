import Link from "next/link";
import { ImageOff, Star, ShieldCheck, ShoppingCart } from "lucide-react";
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

    // Fake data for display purposes
    const randomSold = (product.name.length * 12) + 125;
    // 1. Định nghĩa sẵn các mốc % chiết khấu "đẹp" mà bạn muốn hiển thị
    const allowedDiscounts = [10, 15, 20, 25, 30, 35];
    // 2. Dùng phép chia lấy dư (%) theo độ dài của mảng để lấy index (đảm bảo index luôn từ 0 đến 5)
    const randomIndex = (product.name.length * 7) % allowedDiscounts.length;
    // 3. Bốc % tương ứng từ mảng ra
    const randomDiscount = allowedDiscounts[randomIndex];
    const originalPrice = product.price > 0 ? Math.round(product.price / (1 - randomDiscount / 100)) : 0;

    return (
        <Link
            href={`/san-pham/${product.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
            {/* ── Image ────────────────────────────────────────────── */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {hasImage ? (
                    <img
                        src={product.image_url!}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                            <ImageOff className="h-7 w-7 text-gray-400" />
                        </div>
                    </div>
                )}

                {/* E-commerce Badges */}
                <div className="absolute left-0 top-0 z-10">
                    <div className="rounded-br-xl bg-gradient-to-r from-red-600 to-red-500 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                        CHÍNH HÃNG
                    </div>
                </div>

                {categoryName && (
                    <span className="absolute bottom-2 left-2 rounded-sm bg-white/95 px-2 py-0.5 text-[10px] font-bold text-gray-700 shadow-sm backdrop-blur-md">
                        {categoryName}
                    </span>
                )}

                {/* Extra absolute discount badge if price > 0 */}
                {product.price > 0 && (
                    <div className="absolute right-0 top-0 bg-[#fceea7] px-1.5 py-1 text-center shadow-sm">
                        <span className="block text-[10px] font-extrabold text-red-600 leading-none">
                            {randomDiscount}%
                        </span>
                        <span className="block text-[8px] font-bold uppercase text-red-600 leading-tight">
                            GIẢM
                        </span>
                        {/* CSS Triangle for the ribbon tail */}
                        <div className="absolute -bottom-1.5 left-0 w-full h-0 border-l-[12px] border-r-[12px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#fceea7]" />
                    </div>
                )}

                {/* Add to cart / Quick action */}
                <div className="absolute right-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
            <div className="flex flex-1 flex-col p-3 sm:p-4">
                {/* Title */}
                <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-xs font-medium leading-relaxed text-gray-800 transition-colors group-hover:text-red-600 sm:min-h-[2.75rem] sm:text-sm">
                    {product.name}
                </h3>

                {/* Specs or Variants (Tóm tắt nhanh) */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5 min-h-[20px]">
                    {product.specs && product.specs.length > 0 && (
                        <span className="inline-flex items-center rounded-sm bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 border border-gray-200 truncate max-w-[120px]">
                            {product.specs[0].name}: {product.specs[0].value}
                        </span>
                    )}
                </div>

                {/* Ratings & Sold */}
                <div className="mb-3 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 sm:text-xs">
                        <div className="flex items-center text-[#ffc107]">
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                            <Star className="h-3 w-3 fill-current" />
                        </div>
                        <span className="w-px h-2.5 bg-gray-300"></span>
                        <span className="tracking-tight">Đã bán {randomSold}</span>
                    </div>
                </div>

                {/* Bottom Row - Price & CTA */}
                <div className="flex items-end justify-between border-t border-gray-100/50 pt-2.5">
                    <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through mb-0.5 min-h-[16px]">
                            {originalPrice > 0 ? vndFormat.format(originalPrice) : ""}
                        </span>
                        <span className={`text-sm sm:text-base md:text-lg font-bold tracking-tight ${product.price > 0 ? "text-red-600" : "text-gray-600"}`}>
                            {priceDisplay}
                        </span>
                    </div>
                    <div className="flex shrink-0 items-center justify-center rounded-full bg-red-50 p-2 text-red-600 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white shadow-sm hover:scale-110">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
