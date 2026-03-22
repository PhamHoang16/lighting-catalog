"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

interface CartHeaderIconProps {
    showLabel?: boolean;
}

export default function CartHeaderIcon({ showLabel }: CartHeaderIconProps) {
    const { totalItems } = useCart();

    if (showLabel) {
        return (
            <Link
                href="/gio-hang"
                className="group flex items-center gap-3 transition-colors"
                aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
            >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition-transform group-hover:scale-110">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold text-white shadow-md shadow-red-500/30">
                            {totalItems > 99 ? "99+" : totalItems}
                        </span>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-colors group-hover:text-red-500">
                        Giỏ hàng
                    </span>
                    <span className="text-sm font-black leading-tight text-gray-900">
                        {totalItems} sản phẩm
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href="/gio-hang"
            className="relative flex items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
            aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
        >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-md shadow-red-500/30">
                    {totalItems > 99 ? "99+" : totalItems}
                </span>
            )}
        </Link>
    );
}
