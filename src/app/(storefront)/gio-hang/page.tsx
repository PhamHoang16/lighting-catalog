"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    Trash2,
    ArrowRight,
    ChevronLeft,
    Package,
    ShieldCheck,
    Truck,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    Tags
} from "lucide-react";
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
            <div className="bg-slate-50 min-h-screen">
                {/* ── Empty State Hero ────────────────────────────────────────── */}
                <div className="relative overflow-hidden bg-white border-b border-gray-100 flex items-center justify-center py-20">
                    {/* Decorative glow blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl" />

                    <div className="relative mx-auto max-w-xl px-4 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 shadow-sm border border-amber-100/50">
                            <ShoppingCart className="h-10 w-10 text-amber-500" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Giỏ hàng của bạn đang trống</h1>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                            Có vẻ như bạn chưa chọn được sản phẩm ưng ý. Hãy khám phá hàng ngàn mẫu đèn cao cấp của chúng tôi ngay nhé!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/danh-muc"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-gray-800 transition-all active:scale-95 group"
                            >
                                <Package className="h-4 w-4" />
                                Khám phá sản phẩm
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-8 py-4 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Feature highlights below empty state */}
                <div className="mx-auto max-w-4xl px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <ShieldCheck className="w-6 h-6" />, title: "Chính hãng 100%", desc: "Bảo hành 2-5 năm cho mọi mã sản phẩm" },
                            { icon: <Truck className="w-6 h-6" />, title: "Giao hàng toàn quốc", desc: "Đội ngũ chuyên nghiệp tận tâm nhất" },
                            { icon: <Clock className="w-6 h-6" />, title: "Hỗ trợ 24/7", desc: "Tư vấn thiết kế chiếu sáng miễn phí" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="mb-4 text-amber-500 bg-amber-50 p-3 rounded-xl">{item.icon}</div>
                                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* ── Cinematic Header (Brand Consistency) ─────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 to-gray-800 py-12 lg:py-16">
                {/* Decorative Pattern & Glow */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />

                <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Link href="/" className="text-xs font-bold text-gray-400 hover:text-white transition-colors">TRANG CHỦ</Link>
                                <span className="text-gray-600">/</span>
                                <span className="text-xs font-bold text-amber-500 uppercase">GIỎ HÀNG CỦA BẠN</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                                GIỎ HÀNG <span className="text-amber-500 NOT-italic">({totalItems})</span>
                            </h1>
                            <p className="mt-2 text-gray-400 font-medium max-w-xl">
                                Hoàn thiện không gian sống sang trọng của bạn với những lựa chọn tinh tế nhất.
                            </p>
                        </div>

                        {/* Checkout progress or badges */}
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <div className="flex -space-x-3 overflow-hidden">
                                {items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="inline-block h-10 w-10 rounded-full border-2 border-gray-900 bg-gray-100 overflow-hidden shadow-md">
                                        <img src={item.image_url || "/placeholder.jpg"} alt="" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                                {totalItems > 3 && (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 bg-amber-500 text-[10px] font-bold text-white shadow-md">
                                        +{totalItems - 3}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tạm tính</p>
                                <p className="text-lg font-black text-amber-500">{vndFormat.format(totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Layout (Breakthrough & Balanced) ───────────────────────── */}
            <div className="relative -mt-8 mx-auto max-w-[1440px] px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Side: Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {/* Service Commitment Card (New & Professional) */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-orange-100 group relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-orange-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5 relative z-10">
                                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shadow-sm border border-orange-100/50">
                                        <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                            DỊCH VỤ DỰ ÁN & HỖ TRỢ KỸ THUẬT
                                        </p>
                                        <p className="text-[11px] text-gray-500 font-bold mt-0.5 leading-tight">
                                            Tư vấn thiết kế chiếu sáng 3D & Hỗ trợ kỹ thuật tận nơi cho nhà dân và thợ thầu.
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    24/7 Support
                                </div>
                            </div>
                        </div>

                        {/* Cart Header for desktop (Refined & Architectural) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3.5 bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] relative">
                            {/* Accent line on top for high-end feel */}
                            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                            
                            <div className="col-span-6 flex items-center gap-3">
                                <span className="text-amber-500/60 font-black">LIT.</span>
                                <span>DANH MỤC SẢN PHẨM</span>
                            </div>
                            <div className="col-span-2 text-center font-semibold tracking-normal capitalize">Đơn giá</div>
                            <div className="col-span-2 text-center font-semibold tracking-normal capitalize">Số lượng</div>
                            <div className="col-span-2 text-right text-gray-500 font-bold uppercase tracking-widest">Thành tiền</div>
                        </div>

                        {/* Item Cards */}
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={`${item.id}::${item.variant_label ?? "default"}`}
                                    className="group relative flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-200/50"
                                >
                                    {/* Product Details Section */}
                                    <div className="col-span-6 flex gap-4 sm:gap-6">
                                        <Link
                                            href={`/san-pham/${item.slug}`}
                                            className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 group-hover:shadow-inner transition-shadow"
                                        >
                                            <img
                                                src={item.image_url || "/placeholder.jpg"}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {/* Glow overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>

                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase">Lighting</span>
                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Chính hãng</span>
                                            </div>
                                            <Link
                                                href={`/san-pham/${item.slug}`}
                                                className="text-base sm:text-lg font-semibold text-slate-700 hover:text-amber-600 transition-colors leading-snug line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>
                                            {item.variant_label && (
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <Tags className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-500">
                                                        Phân loại: <span className="text-gray-900">{item.variant_label}</span>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Mobile price and quantity */}
                                            <div className="mt-3 flex items-center gap-4 md:hidden">
                                                <span className="text-sm font-black text-amber-600">
                                                    {vndFormat.format(item.price)}
                                                </span>
                                                <div className="h-4 w-px bg-gray-100" />
                                                <p className="text-xs font-bold text-gray-400">SL: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Price */}
                                    <div className="hidden md:block col-span-2 text-center">
                                        <p className="text-sm font-semibold text-slate-600">
                                            {vndFormat.format(item.price)}
                                        </p>
                                    </div>

                                    {/* Desktop Quantity */}
                                    <div className="hidden md:flex col-span-2 justify-center">
                                        <div className="transform scale-90 opacity-90 transition-opacity hover:opacity-100">
                                            <QuantitySelector
                                                value={item.quantity}
                                                onChange={(q) => updateQuantity(item.id, q, item.variant_label)}
                                            />
                                        </div>
                                    </div>

                                    {/* Line Total */}
                                    <div className="col-span-2 flex flex-col items-end justify-center self-stretch pr-4 md:pr-0">
                                        <span className="md:hidden text-[10px] font-bold text-gray-400 tracking-widest uppercase italic mb-1">Thành tiền</span>
                                        <p className="text-lg font-black text-slate-800">
                                            {vndFormat.format(item.price * item.quantity)}
                                        </p>
                                    </div>
                                    
                                    {/* Refined Delete Button (Absolute Positioned for consistency) */}
                                    <button
                                        onClick={() => removeItem(item.id, item.variant_label)}
                                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-50/20 text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-90"
                                        title="Xóa khỏi giỏ hàng"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* Mobile bottom actions */}
                                    <div className="md:hidden mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <QuantitySelector
                                            value={item.quantity}
                                            onChange={(q) => updateQuantity(item.id, q, item.variant_label)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Continue Shopping Footer */}
                        <div className="flex items-center justify-between pt-4">
                            <Link
                                href="/danh-muc"
                                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors group"
                            >
                                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                TIẾP TỤC KHÁM PHÁ
                            </Link>
                            <button
                                onClick={() => clearCart()}
                                className="text-[11px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                            >
                                Xóa tất cả giỏ hàng
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Order Summary (Sticky Sidebar) */}
                    <div className="lg:w-[400px]">
                        <div className="sticky top-24 space-y-4">
                            {/* Summary Card */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/30 border border-slate-100 overflow-hidden relative">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                                <h2 className="text-base font-black text-slate-800 uppercase tracking-tighter mb-8 italic flex items-center gap-2">
                                    <Package className="w-5 h-5 text-amber-500" />
                                    TÓM TẮT ĐƠN HÀNG
                                </h2>

                                <div className="space-y-4 mb-8 border-b border-slate-100 pb-8">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-400 italic">TẠM TÍNH ({totalItems})</span>
                                        <span className="font-bold text-slate-800">{vndFormat.format(totalAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-slate-400 italic">THUẾ (VAT)</span>
                                        <span className="font-bold text-slate-600">Đã bao gồm</span>
                                    </div>
                                    <div className="h-px bg-dashed border-t border-dashed border-slate-100 my-2" />
                                    <div className="flex items-end justify-between pt-2">
                                        <span className="text-sm font-black text-slate-900 uppercase italic">TỔNG CỘNG</span>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-amber-600 leading-none tracking-tighter">
                                                {vndFormat.format(totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/thanh-toan"
                                    className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-5 text-base font-black text-white shadow-2xl shadow-amber-500/30 transition-all hover:from-orange-500 hover:to-amber-600 active:scale-95 group"
                                >
                                    {/* Shine effect logic here with CSS */}
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                    <CreditCard className="h-5 w-5 text-white" />
                                    BẮT ĐẦU ĐẶT HÀNG
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                            </div>

                            {/* Trust Badge Card */}
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-dashed border-gray-200">
                                <div className="space-y-4">
                                    {[
                                        { icon: <ShieldCheck className="w-4 h-4" />, text: "Thanh toán bảo mật SSL 256-bit" },
                                        { icon: <CheckCircle2 className="w-4 h-4" />, text: "Cam kết sản phẩm đúng như mô tả" },
                                    ].map((b, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                                            <div className="text-amber-500">{b.icon}</div>
                                            {b.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
