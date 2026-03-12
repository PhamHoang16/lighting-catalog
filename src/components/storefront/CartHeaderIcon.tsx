"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export default function CartHeaderIcon() {
    const { totalItems } = useCart();

    return (
        <Link
            href="/gio-hang"
            className="relative flex items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
            aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
        >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-md shadow-amber-500/30">
                    {totalItems > 99 ? "99+" : totalItems}
                </span>
            )}
        </Link>
    );
}
