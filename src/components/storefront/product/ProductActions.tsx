"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import QuantitySelector from "@/components/storefront/QuantitySelector";
import { siteConfig } from "@/lib/config/site";
import type { VariantsData, VariantItem } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        price: number;
        variants: VariantsData | null;
    };
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addItem, isInCart } = useCart();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const hasVariants = !!(product.variants && product.variants.options.length > 0);
    const options = useMemo(() => product.variants?.options ?? [], [product.variants]);

    // ── Track selected option per group ─────────────────────────
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

    function selectOption(groupName: string, value: string) {
        setSelectedOptions((prev) => ({ ...prev, [groupName]: value }));
    }

    // ── Find active variant based on selections ─────────────────
    const allSelected = hasVariants
        ? options.every((opt) => !!selectedOptions[opt.name])
        : true;

    const activeVariant: VariantItem | null = useMemo(() => {
        if (!hasVariants || !allSelected) return null;
        const combo = options.map((opt) => selectedOptions[opt.name]);
        return (
            product.variants!.variants.find(
                (v) => JSON.stringify(v.combination) === JSON.stringify(combo)
            ) ?? null
        );
    }, [hasVariants, allSelected, options, selectedOptions, product.variants]);

    // ── Current price ───────────────────────────────────────────
    const currentPrice = activeVariant ? activeVariant.price : product.price;
    const variantLabel = hasVariants && allSelected
        ? options.map((opt) => selectedOptions[opt.name]).join(" / ")
        : undefined;

    const canBuy = hasVariants ? allSelected : true;

    const alreadyInCart = isInCart(product.id, variantLabel);

    function handleAddToCart() {
        if (!canBuy) return;
        addItem(
            {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image_url: product.image_url,
                price: currentPrice,
                variant_label: variantLabel,
                selected_options: hasVariants ? selectedOptions : undefined,
            },
            quantity
        );
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    }

    function handleBuyNow() {
        if (!canBuy) return;
        setIsBuying(true);
        addItem(
            {
                id: product.id,
                name: product.name,
                slug: product.slug,
                image_url: product.image_url,
                price: currentPrice,
                variant_label: variantLabel,
                selected_options: hasVariants ? selectedOptions : undefined,
            },
            quantity
        );
        router.push("/gio-hang");
    }

    return (
        <div id="product-actions" className="space-y-5">
            {/* ── Variant selectors (Shopee-style) ──────────────── */}
            {hasVariants && options.map((opt) => (
                <div key={opt.name}>
                    <p className="mb-2 text-sm font-semibold text-gray-700">{opt.name}</p>
                    <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                            const isSelected = selectedOptions[opt.name] === val;
                            return (
                                <button
                                    key={val}
                                    onClick={() => selectOption(opt.name, val)}
                                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${isSelected
                                        ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50/50"
                                        }`}
                                >
                                    {val}
                                    {isSelected && <Check className="ml-1.5 inline h-3.5 w-3.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* ── Price display (updates with variant) ──────────── */}
            {hasVariants && (
                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 px-5 py-4">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold tracking-tight ${canBuy ? "text-amber-600" : "text-gray-400"}`}>
                            {canBuy ? vndFormat.format(currentPrice) : "Chọn phân loại"}
                        </span>
                        {canBuy && currentPrice > 0}
                    </div>
                    {canBuy && variantLabel && (
                        <p className="mt-1 text-xs text-amber-600/70">
                            Phân loại: {variantLabel}
                        </p>
                    )}
                </div>
            )}

            {/* ── Quantity selector ────────────────────────────── */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Số lượng:</span>
                <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            {/* ── CTA Buttons ──────────────────────────────────── */}
            <div className="flex flex-col gap-2.5">
                {/* Primary CTA — MUA NGAY */}
                <button
                    onClick={handleBuyNow}
                    disabled={!canBuy || isBuying}
                    className={`group flex w-full items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold shadow-xl transition-all active:scale-[0.98] ${canBuy
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700 hover:shadow-2xl hover:shadow-amber-500/30 cursor-pointer"
                        : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                        }`}
                >
                    {isBuying ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            ĐANG CHUYỂN HƯỚNG...
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-5 w-5" />
                            {canBuy ? "MUA NGAY" : "Vui lòng chọn phân loại"}
                        </>
                    )}
                </button>

                {/* Secondary CTA — Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    disabled={!canBuy}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${justAdded
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : alreadyInCart
                            ? "border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-50"
                            : "border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-700"
                        }`}
                >
                    {justAdded ? (
                        <>
                            <Check className="h-5 w-5" />
                            Đã thêm {quantity} sản phẩm vào giỏ!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-5 w-5" />
                            Thêm vào giỏ hàng
                        </>
                    )}
                </button>
            </div>

            {/* Hotline */}
            <p className="text-center text-xs text-gray-400">
                Hoặc gọi trực tiếp:{" "}
                <a
                    href={siteConfig.contact.hotlineHref}
                    className="font-semibold text-amber-600 hover:underline"
                >
                    {siteConfig.contact.hotline}
                </a>
            </p>
        </div>
    );
}
