"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    Trash2,
    Minus,
    Plus,
    Send,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    ImageOff,
    PackageOpen,
    Phone,
    User,
    MessageSquare,
    Building2,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config/site";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

export default function QuoteCartPage() {
    const { items, totalItems, updateQuantity, removeItem, clearCart } =
        useCart();
    const supabase = createClient();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [projectName, setProjectName] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || items.length === 0) return;

        setLoading(true);

        const { error } = await supabase.from("quote_requests").insert({
            customer_name: name.trim(),
            phone: phone.trim(),
            message: [
                projectName.trim() ? `Dự án: ${projectName.trim()}` : "",
                message.trim(),
            ]
                .filter(Boolean)
                .join("\n") || null,
            status: "new",
            items: items.map((item) => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
            })),
        });

        setLoading(false);

        if (error) {
            alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            return;
        }

        clearCart();
        setSuccess(true);
    }

    // ── Success state ─────────────────────────────────────────────
    if (success) {
        return (
            <div className="bg-white">
                <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gửi yêu cầu thành công!
                    </h1>
                    <p className="mt-3 text-gray-500">
                        Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi. Đội ngũ tư vấn
                        sẽ liên hệ bạn trong thời gian sớm nhất.
                    </p>
                    <div className="mt-8 flex items-center gap-3">
                        <Link
                            href="/danh-muc"
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                        >
                            Tiếp tục khám phá
                        </Link>
                        <Link
                            href="/"
                            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-colors hover:bg-amber-600"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Empty cart ─────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="bg-white">
                <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <PackageOpen className="h-10 w-10 text-gray-300" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Giỏ báo giá trống
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Hãy thêm sản phẩm vào danh sách để gửi yêu cầu báo giá.
                    </p>
                    <Link
                        href="/danh-muc"
                        className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-colors hover:bg-amber-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    // ── Cart with items ───────────────────────────────────────────
    return (
        <div className="bg-white">
            {/* Header */}
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                            <ShoppingCart className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Giỏ yêu cầu báo giá
                            </h1>
                            <p className="mt-0.5 text-sm text-gray-400">
                                {totalItems} sản phẩm trong danh sách
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* ── Product list (3/5) ──────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                >
                                    {/* Image */}
                                    <Link
                                        href={`/san-pham/${item.slug}`}
                                        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ImageOff className="h-6 w-6 text-gray-300" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/san-pham/${item.slug}`}
                                                className="text-sm font-semibold text-gray-900 hover:text-amber-700"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="mt-0.5 text-sm font-bold text-amber-600">
                                                {item.price > 0
                                                    ? vndFormat.format(item.price)
                                                    : "Liên hệ"}
                                            </p>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity - 1)
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/danh-muc"
                            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-amber-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Thêm sản phẩm khác
                        </Link>
                    </div>

                    {/* ── Quote form (2/5) ───────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 rounded-xl border border-gray-200 bg-white shadow-sm">
                            {/* Form header */}
                            <div className="rounded-t-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-white">
                                <h2 className="text-base font-bold">Gửi yêu cầu báo giá</h2>
                                <p className="mt-0.5 text-xs text-amber-100">
                                    Chúng tôi sẽ phản hồi trong 30 phút
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                                {/* Họ tên */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <User className="h-4 w-4 text-gray-400" />
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nguyễn Văn A"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                    />
                                </div>

                                {/* SĐT */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="0909 123 456"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                    />
                                </div>

                                {/* Tên dự án */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        Tên dự án / Công trình
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="VD: Văn phòng ABC"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        disabled={loading}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                    />
                                </div>

                                {/* Lời nhắn */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                        <MessageSquare className="h-4 w-4 text-gray-400" />
                                        Lời nhắn
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Yêu cầu thêm..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={loading}
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                    />
                                </div>

                                {/* Summary */}
                                <div className="rounded-lg bg-gray-50 px-4 py-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Tổng sản phẩm:</span>
                                        <span className="font-bold text-gray-900">
                                            {totalItems} SP
                                        </span>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim() || !phone.trim()}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Gửi yêu cầu báo giá
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    Hoặc gọi:{" "}
                                    <a
                                        href={siteConfig.contact.hotlineHref}
                                        className="font-semibold text-amber-600 hover:underline"
                                    >
                                        {siteConfig.contact.hotline}
                                    </a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
