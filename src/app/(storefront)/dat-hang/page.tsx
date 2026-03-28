"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Truck,
    Store,
    CreditCard,
    FileText,
    ShoppingCart,
    Check,
    ChevronLeft,
    Loader2,
    Package,
    MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { siteConfig } from "@/lib/config/site";
import type { OrderItem } from "@/lib/types/database";

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

export default function CheckoutPage() {
    const supabase = createClient();
    const router = useRouter();
    const { toast } = useToast();
    const { items, totalAmount, clearCart } = useCart();

    // Person info
    const [title, setTitle] = useState("anh");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    // Delivery
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
    const [address, setAddress] = useState("");
    const [cardAtHome, setCardAtHome] = useState(false);
    const [invoiceCompany, setInvoiceCompany] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (items.length === 0 && !success) {
        return (
            <div className="bg-white">
                <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
                    <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <h1 className="text-xl font-bold text-gray-900">Giỏ hàng trống</h1>
                    <p className="mt-2 text-sm text-gray-500">Hãy thêm sản phẩm vào giỏ trước khi đặt hàng.</p>
                    <Link
                        href="/danh-muc"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
                    >
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="bg-white">
                <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Đặt hàng thành công!</h1>
                    <p className="mt-3 text-sm text-gray-500">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Hotline:{" "}
                        <a href={siteConfig.contact.hotlineHref} className="font-semibold text-amber-600 hover:underline">
                            {siteConfig.contact.hotline}
                        </a>
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;
        if (deliveryMethod === "delivery" && !address.trim()) return;

        setLoading(true);

        const orderItems: OrderItem[] = items.map((item: CartItem) => ({
            product_id: item.id,
            product_name: item.name,
            product_image: item.image_url,
            variant_label: item.variant_label,
            unit_price: item.price,
            quantity: item.quantity,
        }));

        const { error } = await supabase.from("orders").insert({
            customer_name: name.trim(),
            phone: phone.trim(),
            title,
            message: message.trim() || null,
            delivery_method: deliveryMethod,
            address: deliveryMethod === "delivery" ? address.trim() : null,
            card_at_home: deliveryMethod === "delivery" ? cardAtHome : false,
            invoice_company: deliveryMethod === "delivery" ? invoiceCompany : false,
            total_amount: totalAmount,
            items: orderItems,
            status: "pending",
        });

        if (error) {
            toast("Lỗi khi đặt hàng: " + error.message, "error");
        } else {
            clearCart();
            setSuccess(true);
        }

        setLoading(false);
    }

    return (
        <div className="bg-gray-50/50">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <h1 className="text-2xl font-bold text-white">Đặt hàng</h1>
                    <p className="mt-1 text-sm text-gray-400">Hoàn tất thông tin để đặt hàng</p>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* ═══════════════════════════════════════════════ */}
                    {/* LEFT: Form — 3/5 */}
                    {/* ═══════════════════════════════════════════════ */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Section 1: Customer info */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                                Thông tin người nhận
                            </h2>

                            {/* Title radio */}
                            <div className="mb-4 flex gap-4">
                                {[
                                    { value: "anh", label: "Anh" },
                                    { value: "chi", label: "Chị" },
                                ].map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${title === opt.value
                                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                                : "border-gray-200 text-gray-600 hover:border-amber-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="title"
                                            value={opt.value}
                                            checked={title === opt.value}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="sr-only"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>

                            {/* Name */}
                            <div className="mb-3">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>

                            {/* Phone */}
                            <div className="mb-3">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0912 345 678"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Yêu cầu khác
                                </label>
                                <textarea
                                    rows={2}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Ghi chú thêm cho đơn hàng..."
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        {/* Section 2: Delivery method */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                                Phương thức nhận hàng
                            </h2>

                            {/* Tabs */}
                            <div className="mb-4 flex rounded-lg border border-gray-200 p-1">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod("delivery")}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${deliveryMethod === "delivery"
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Truck className="h-4 w-4" />
                                    Giao hàng
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod("pickup")}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all ${deliveryMethod === "pickup"
                                            ? "bg-amber-500 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Store className="h-4 w-4" />
                                    Nhận tại CH
                                </button>
                            </div>

                            {deliveryMethod === "delivery" ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Địa chỉ giao hàng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required={deliveryMethod === "delivery"}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                        />
                                    </div>

                                    {/* Options */}
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={cardAtHome}
                                                onChange={(e) => setCardAtHome(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                            />
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            Thanh toán khi nhận hàng
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={invoiceCompany}
                                                onChange={(e) => setInvoiceCompany(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                            />
                                            <FileText className="h-4 w-4 text-gray-400" />
                                            Xuất hóa đơn công ty
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800">
                                                Nhận tại cửa hàng
                                            </p>
                                            <p className="mt-1 text-sm text-emerald-700">
                                                {siteConfig.contact.address}
                                            </p>
                                            <p className="mt-0.5 text-xs text-emerald-600">
                                                {siteConfig.contact.workingHours}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════ */}
                    {/* RIGHT: Order Summary — 2/5 */}
                    {/* ═══════════════════════════════════════════════ */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                                Đơn hàng ({items.length} sản phẩm)
                            </h2>

                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={`${item.id}::${item.variant_label ?? "d"}`} className="flex gap-3">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-5 w-5 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                                            {item.variant_label && (
                                                <p className="text-xs text-gray-400">{item.variant_label}</p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {vndFormat.format(item.price)} x {item.quantity}
                                            </p>
                                        </div>
                                        <p className="shrink-0 text-sm font-semibold text-gray-900">
                                            {vndFormat.format(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="my-4 h-px bg-gray-200" />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Tổng tiền</span>
                                <span className="text-xl font-extrabold text-amber-600">
                                    {vndFormat.format(totalAmount)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name.trim() || !phone.trim() || (deliveryMethod === "delivery" && !address.trim())}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        ĐẶT HÀNG
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-center text-xs text-gray-400">
                                Xem hàng, không mua không sao 😊
                            </p>

                            <Link
                                href="/gio-hang"
                                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                            >
                                <ChevronLeft className="h-3 w-3" />
                                Quay lại giỏ hàng
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
