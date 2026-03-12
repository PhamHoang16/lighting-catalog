"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart/CartContext";

interface AddToCartButtonProps {
    product: Omit<CartItem, "quantity">;
    /** "sm" cho ProductCard, "lg" cho ProductDetail */
    size?: "sm" | "lg";
    className?: string;
}

export default function AddToCartButton({
    product,
    size = "sm",
    className = "",
}: AddToCartButtonProps) {
    const { addItem, isInCart } = useCart();
    const [justAdded, setJustAdded] = useState(false);
    const alreadyInCart = isInCart(product.id);

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault(); // prevent Link navigation when inside ProductCard
        e.stopPropagation();
        addItem(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
    }

    if (size === "lg") {
        return (
            <button
                onClick={handleAdd}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-sm font-bold transition-all ${justAdded
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : alreadyInCart
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    } ${className}`}
            >
                {justAdded ? (
                    <>
                        <Check className="h-5 w-5" />
                        Đã thêm vào giỏ!
                    </>
                ) : alreadyInCart ? (
                    <>
                        <ShoppingCart className="h-5 w-5" />
                        Thêm lần nữa
                    </>
                ) : (
                    <>
                        <ShoppingCart className="h-5 w-5" />
                        Thêm vào giỏ hàng
                    </>
                )}
            </button>
        );
    }

    // ── Small variant (for ProductCard) ───────────────────────
    return (
        <button
            onClick={handleAdd}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${justAdded
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                } ${className}`}
            aria-label={`Thêm ${product.name} vào giỏ`}
        >
            {justAdded ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
            )}
            {justAdded ? "Đã thêm" : "Thêm"}
        </button>
    );
}
