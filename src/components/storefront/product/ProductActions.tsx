"use client";

import { useState } from "react";
import { Phone, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import QuantitySelector from "@/components/storefront/QuantitySelector";
import QuoteRequestModal from "@/components/storefront/product/QuoteRequestModal";
import { siteConfig } from "@/lib/config/site";

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        price: number;
    };
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addItem, isInCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const alreadyInCart = isInCart(product.id);

    function handleAddToCart() {
        addItem(product, quantity);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    }

    return (
        <div className="space-y-4">
            {/* ── Quantity selector ────────────────────────────── */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Số lượng:</span>
                <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            {/* ── CTA Buttons ──────────────────────────────────── */}
            <div className="flex flex-col gap-2.5">
                {/* Primary CTA — Báo giá */}
                <QuoteRequestModal
                    productId={product.id}
                    productName={product.name}
                    trigger={
                        <button className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-2xl hover:shadow-amber-500/30 active:scale-[0.98]">
                            <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" />
                            NHẬN BÁO GIÁ NGAY
                        </button>
                    }
                />

                {/* Secondary CTA — Add to Cart */}
                <button
                    onClick={handleAddToCart}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${justAdded
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
                            Thêm {quantity > 1 ? `${quantity} SP` : ""} vào giỏ báo giá
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
