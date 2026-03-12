"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, ChevronLeft, Package } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import QuantitySelector from "@/components/storefront/QuantitySelector";

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

export default function CartPage() {
    const { items, totalItems, totalAmount, removeItem, updateQuantity, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="bg-white">
                <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng trống</h1>
                    <p className="mt-2 text-sm text-gray-500">Thêm sản phẩm vào giỏ để bắt đầu mua hàng</p>
                    <Link
                        href="/danh-muc"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
                    >
                        <Package className="h-4 w-4" />
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <h1 className="text-2xl font-bold text-white">Giỏ hàng ({totalItems} sản phẩm)</h1>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Items */}
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={`${item.id}::${item.variant_label ?? "default"}`}
                            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            {/* Image */}
                            <Link href={`/san-pham/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-300" />
                                    </div>
                                )}
                            </Link>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <Link href={`/san-pham/${item.slug}`} className="text-sm font-semibold text-gray-900 hover:text-amber-700">
                                    {item.name}
                                </Link>
                                {item.variant_label && (
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Phân loại: {item.variant_label}
                                    </p>
                                )}
                                <p className="mt-1 text-sm font-bold text-amber-600">
                                    {vndFormat.format(item.price)}
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    <QuantitySelector
                                        value={item.quantity}
                                        onChange={(q) => updateQuantity(item.id, q, item.variant_label)}
                                    />
                                    <button
                                        onClick={() => removeItem(item.id, item.variant_label)}
                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Line total */}
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                    {vndFormat.format(item.price * item.quantity)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tổng cộng ({totalItems} sản phẩm)</span>
                        <span className="text-2xl font-extrabold text-amber-600">{vndFormat.format(totalAmount)}</span>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/danh-muc"
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Tiếp tục mua sắm
                        </Link>

                        <Link
                            href="/dat-hang"
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl"
                        >
                            Tiến hành đặt hàng
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
