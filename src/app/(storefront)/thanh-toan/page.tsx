"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
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
    ArrowRight,
    ShieldCheck,
    Phone,
    User,
    MessageSquare,
    Wallet,
    Info,
    X,
    QrCode,
    Copy,
    Building2,
    CheckCircle2,
    Clock
} from "lucide-react";

import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { siteConfig } from "@/lib/config/site";
import type { OrderItem } from "@/lib/types/database";
import { createOrderAction } from "@/app/actions/admin";

// Secure Local QR Code Import
import bankQRCode from "@/assets/images/bank-qr/my-secure-qr.jpg";

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

export default function CheckoutPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { items, totalAmount, clearCart, totalItems } = useCart();

    // Form States
    const [title, setTitle] = useState("anh");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [address, setAddress] = useState("");
    
    // UI States
    const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "transfer">("cod");
    const [invoiceCompany, setInvoiceCompany] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // If cart is empty and not just placed an order
    if (items.length === 0 && !success) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4">
                 <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-100">
                    <ShoppingCart className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Giỏ hàng của bạn đang trống</h1>
                <p className="text-gray-500 font-medium mb-8 text-center max-w-sm">
                    Hãy quay lại cửa hàng để chọn những mẫu đèn cao cấp nhất cho không gian của bạn.
                </p>
                <Link
                    href="/danh-muc"
                    className="flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                >
                    <Package className="h-4 w-4" />
                    Khám phá sản phẩm
                </Link>
            </div>
        );
    }

    // Success State
    if (success) {
        return (
            <div className="bg-slate-50 min-h-screen py-20 px-4">
                <div className="relative mx-auto max-w-2xl bg-white rounded-[40px] shadow-2xl shadow-emerald-500/10 border border-emerald-100 p-8 sm:p-12 text-center overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full -ml-16 -mt-16 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mb-16 blur-3xl opacity-50" />
                    
                    <div className="relative">
                        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-50 border border-emerald-100 shadow-inner">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic mb-4">Đặt hàng thành công!</h1>
                        <p className="text-gray-600 font-medium text-lg leading-relaxed mb-2 px-4">
                            Cảm ơn {title === "anh" ? "Anh" : "Chị"} <span className="text-gray-950 font-black">{name}</span> đã tin tưởng lựa chọn chúng tôi.
                        </p>
                        <p className="text-gray-500 font-medium mb-8">
                            Đội ngũ chuyên viên của chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian dự kiến</p>
                                <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1.5">
                                    <Truck className="w-4 h-4 text-emerald-500" /> 1-3 Ngày làm việc
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã vận đơn</p>
                                <p className="text-sm font-bold text-amber-600">LIT-{orderId?.slice(-6).toUpperCase() || "..."}</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-10 py-4 text-sm font-black text-white shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Về Trang chủ
                            </Link>
                            <a
                                href={`tel:${siteConfig.contact.hotline}`}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-10 py-4 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                <Phone className="h-4 w-4 text-amber-500" />
                                Hỗ trợ: {siteConfig.contact.hotline}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    async function handlePlaceOrder(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || (deliveryMethod === "delivery" && !address.trim())) {
            toast("Vui lòng nhập đầy đủ các thông tin bắt buộc (*)", "error");
            return;
        }

        setLoading(true);

        const orderItems: OrderItem[] = items.map((item: CartItem) => ({
            product_id: item.id,
            product_name: item.name,
            product_image: item.image_url,
            variant_label: item.variant_label,
            unit_price: item.price,
            quantity: item.quantity,
        }));

        const result = await createOrderAction({
            customer_name: name.trim(),
            phone: phone.trim(),
            title,
            message: message.trim() || null,
            delivery_method: deliveryMethod,
            address: deliveryMethod === "delivery" ? address.trim() : null,
            card_at_home: paymentMethod === "cod",
            invoice_company: invoiceCompany,
            total_amount: totalAmount,
            items: orderItems,
        });

        if (result?.error) {
            toast("Lỗi khi đặt hàng: " + result.error, "error");
            setLoading(false);
        } else {
            // generate a fake orderId for display (UUID not returned from action)
            setOrderId(crypto.randomUUID());
            if (paymentMethod === "transfer") {
                setShowQRModal(true);
            } else {
                clearCart();
                toast("Đặt hàng thành công!", "success");
                setSuccess(true);
                setLoading(false);
            }
        }
    }

    const handleCompleteTransfer = () => {
        clearCart();
        setShowQRModal(false);
        setSuccess(true);
        setLoading(false);
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* ── Cinematic Checkout Header ───────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 to-gray-800 py-12 lg:py-20">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
                
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Link href="/gio-hang" className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                                <ChevronLeft className="w-3 h-3" /> Giỏ hàng
                            </Link>
                            <span className="text-gray-600">/</span>
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Xác nhận đặt hàng</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
                            Hoàn tất Không gian Ánh sáng <br className="hidden md:block" />
                            <span className="text-amber-500 NOT-italic">Chỉ 1 bước cuối cùng</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl text-lg">
                            Dành 1 phút hoàn thiện thông tin để nhận được sự phục vụ tận tâm nhất từ đội ngũ chuyên gia chiếu sáng của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Checkout Main Area ────────────────────────────────────────── */}
            <div className="relative -mt-10 mx-auto max-w-7xl px-4 sm:px-6">
                <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Form Info */}
                    <div className="flex-1 space-y-6">
                        {/* Area 1: Customer Contact */}
                        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Thông tin người nhận</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Title Selector */}
                                <div className="flex gap-4">
                                    {[
                                        { value: "anh", label: "Anh" },
                                        { value: "chi", label: "Chị" },
                                    ].map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 py-3.5 text-sm font-black transition-all ${title === opt.value
                                                    ? "border-amber-500 bg-amber-50 text-amber-700 shadow-inner"
                                                    : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
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
                                            {title === opt.value && <CheckCircle2 className="w-4 h-4" />}
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-amber-600">
                                            Họ và tên <span className="text-amber-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Nhập họ và tên..."
                                                className="w-full rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300 transition-all"
                                            />
                                            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 transition-colors group-focus-within:text-amber-300" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-amber-600">
                                            Số điện thoại <span className="text-amber-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="0911 222 333"
                                                className="w-full rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300 transition-all"
                                            />
                                            <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 transition-colors group-focus-within:text-amber-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-amber-600">
                                        Ghi chú yêu cầu <span className="text-gray-300 italic font-normal tracking-normal">(Tùy chọn)</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            rows={3}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Lời nhắn về thời gian giao hàng, yêu cầu kỹ thuật..."
                                            className="w-full resize-none rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300 transition-all"
                                        />
                                        <MessageSquare className="absolute right-5 top-5 w-4 h-4 text-gray-200 transition-colors group-focus-within:text-amber-300" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Area 2: Delivery & Payment Methods */}
                        <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Giao nhận & Thanh toán</h2>
                                </div>
                                
                                <div className="flex p-1.5 bg-slate-50 border border-gray-100 rounded-2xl gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod("delivery")}
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${deliveryMethod === "delivery" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Giao hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod("pickup")}
                                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${deliveryMethod === "pickup" ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Nhận tại kho
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Address Input if delivery */}
                                {deliveryMethod === "delivery" ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2 group">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                                Địa chỉ giao hàng chi tiết <span className="text-amber-500 font-bold">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required={deliveryMethod === "delivery"}
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    placeholder="Số nhà, đường, phường/xã, quận, tỉnh thành..."
                                                    className="w-full rounded-2xl border border-gray-100 bg-slate-50 px-5 py-4 text-sm font-bold text-gray-900 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 placeholder:text-gray-300 transition-all"
                                                />
                                                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 group-focus-within:text-amber-300" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-emerald-900 uppercase">Kho hàng chính hãng</p>
                                            <p className="text-sm font-bold text-emerald-700 mt-1 leading-snug">
                                                {siteConfig.contact.address}
                                            </p>
                                            <p className="text-[11px] font-bold text-emerald-500 mt-2 flex items-center gap-1.5 italic">
                                                <Clock className="w-3.5 h-3.5" /> Mở cửa: {siteConfig.contact.workingHours}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Selection Cards */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                        Chọn phương thức thanh toán
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("cod")}
                                            className={`relative group flex items-center gap-4 rounded-3xl border-2 p-6 transition-all text-left ${paymentMethod === "cod" ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                        >
                                            <div className={`p-4 rounded-2xl transition-colors ${paymentMethod === "cod" ? 'bg-amber-500 text-white' : 'bg-white text-gray-400 group-hover:text-amber-500'}`}>
                                                <Wallet className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase tracking-tight italic">Thanh toán khi nhận</p>
                                                <p className="text-xs font-bold text-gray-500 leading-tight mt-1">
                                                    Thanh toán khi nhận được hàng.
                                                </p>
                                            </div>
                                            {paymentMethod === "cod" && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle2 className="w-6 h-6" /></div>}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("transfer")}
                                            className={`relative group flex items-center gap-4 rounded-3xl border-2 p-6 transition-all text-left ${paymentMethod === "transfer" ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                        >
                                            <div className={`p-4 rounded-2xl transition-colors ${paymentMethod === "transfer" ? 'bg-amber-500 text-white' : 'bg-white text-gray-400 group-hover:text-amber-500'}`}>
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 uppercase tracking-tight italic">Chuyển khoản / VietQR</p>
                                                <p className="text-xs font-bold text-gray-500 leading-tight mt-1">
                                                    Xác nhận nhanh chóng qua mã QR Code bảo mật.
                                                </p>
                                            </div>
                                            {paymentMethod === "transfer" && <div className="absolute top-4 right-4 text-amber-500"><CheckCircle2 className="w-6 h-6" /></div>}
                                        </button>
                                    </div>
                                </div>

                                {/* Custom checkboxes */}
                                <div className="flex items-center pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={invoiceCompany}
                                                onChange={(e) => setInvoiceCompany(e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 rounded-md border-2 border-gray-200 transition-all peer-checked:border-amber-500 peer-checked:bg-amber-500" />
                                            <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest italic group-hover:text-gray-900 transition-colors">Yêu cầu xuất hóa đơn Công ty (VAT)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:w-[450px]">
                        <div className="sticky top-24 space-y-6">
                            {/* Summary Card - High Contrast */}
                            <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-gray-100 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full -mr-16 -mt-16 blur-2xl" />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic flex items-center gap-2.5">
                                        <Package className="w-6 h-6 text-amber-500" />
                                        Đơn hàng <span className="text-amber-500 font-bold">({totalItems})</span>
                                    </h2>
                                    <Link href="/gio-hang" className="text-[10px] font-black text-gray-400 hover:text-amber-600 transition-colors uppercase border-b-2 border-transparent hover:border-amber-500 pb-0.5">Sửa giỏ hàng</Link>
                                </div>

                                {/* Item List Preview */}
                                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {items.map((item) => (
                                        <div key={`${item.id}::${item.variant_label}`} className="flex gap-4 group">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 group-hover:shadow-inner transition-shadow">
                                                <img src={item.image_url || "/placeholder.jpg"} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1 flex flex-col justify-center">
                                                <p className="truncate text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">{item.name}</p>
                                                {item.variant_label && (
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{item.variant_label}</p>
                                                )}
                                                <div className="flex items-center justify-between mt-1">
                                                     <p className="text-[11px] font-black text-gray-400 italic">SL: {item.quantity}</p>
                                                     <p className="text-sm font-black text-gray-900">{vndFormat.format(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-dashed border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-400 italic">Tổng tạm tính</span>
                                        <span className="text-sm font-black text-gray-900">{vndFormat.format(totalAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 flex items-center gap-1.5 italic">
                                            Phí vận chuyển <Info className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="text-xs font-black text-gray-400 uppercase italic">(Chưa tính)</span>
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-blue-50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-gray-900 uppercase italic">TỔNG THANH TOÁN</span>
                                            <span className="text-3xl font-black text-amber-600 tracking-tighter">
                                                {vndFormat.format(totalAmount)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold text-right mt-1 italic italic">Đơn giá đã bao gồm thuế tiêu chuẩn VAT.</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-8 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-amber-500 to-orange-600 py-6 text-base font-black text-white shadow-2xl shadow-amber-500/30 transition-all hover:from-orange-500 hover:to-amber-600 active:scale-95 disabled:opacity-50 group"
                                >
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>
                                            XÁC NHẬN ĐẶT HÀNG
                                            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <p className="mt-6 text-center text-[10px] font-black text-gray-400">
                                    Bằng cách đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi.
                                </p>
                            </div>

                            {/* Trust Seals */}
                            <div className="flex items-center justify-center gap-6 px-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <ShieldCheck className="w-5 h-5 text-amber-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Bảo mật SSL 256</span>
                                </div>
                                <div className="h-4 w-px bg-gray-200" />
                                <div className="flex items-center gap-2 text-gray-400">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Chính hãng 100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Secure Bank Transfer Modal ───────────────────────────────────── */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl animate-in fade-in duration-300" 
                        onClick={handleCompleteTransfer}
                    />
                    
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Internal Close */}
                        <button 
                            onClick={handleCompleteTransfer}
                            className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 sm:p-10 text-center">
                            <div className="mb-6 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-[22px] bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                                    <QrCode className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Thanh toán qua VietQR</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1 italic">Vui lòng quét mã để xác nhận đơn hàng của bạn</p>
                            </div>

                            {/* QR Container - Premium Styling */}
                            <div className="relative group mx-auto mb-8 w-64 h-64 bg-slate-50 rounded-[40px] p-2 border-2 border-dashed border-gray-100 transition-all hover:border-amber-500/50 overflow-hidden">
                                <div className="h-full w-full rounded-[32px] overflow-hidden bg-white flex items-center justify-center">
                                    {/* Using local secure import */}
                                    <Image 
                                        src={bankQRCode} 
                                        alt="Secure Bank QR" 
                                        className="w-full h-full object-contain"
                                        placeholder="blur" 
                                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                                    />
                                </div>
                                <div className="absolute inset-0 bg-transparent flex items-center justify-center group-hover:bg-black/5 transition-colors pointer-events-none" />
                            </div>

                            {/* Bank Details Table */}
                            <div className="bg-slate-50 rounded-[32px] p-6 space-y-4 text-left border border-gray-100">
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên Ngân hàng</p>
                                        <p className="text-sm font-black text-gray-900">VIETCOMBANK (VCB)</p>
                                    </div>
                                    <Copy className="w-4 h-4 text-gray-200 group-hover:text-amber-500 cursor-pointer transition-colors" />
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tài khoản</p>
                                        <p className="text-lg font-black text-amber-600 tracking-tight">123 456 7890</p>
                                    </div>
                                    <Copy className="w-4 h-4 text-gray-200 group-hover:text-amber-500 cursor-pointer transition-colors" />
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chủ tài khoản</p>
                                        <p className="text-sm font-black text-gray-900 uppercase">NGUYEN VAN A</p>
                                    </div>
                                    <Copy className="w-4 h-4 text-gray-200 group-hover:text-amber-500 cursor-pointer transition-colors" />
                                </div>
                                <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung chuyển khoản</p>
                                        <p className="text-sm font-black text-blue-600 uppercase">LIT {orderId ? orderId.slice(-6).toUpperCase() : 'ORDER'}</p>
                                    </div>
                                    <Copy className="w-4 h-4 text-gray-200 group-hover:text-amber-500 cursor-pointer transition-colors" />
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteTransfer}
                                className="mt-8 w-full py-5 rounded-[24px] bg-emerald-500 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                TÔI ĐÃ CHUYỂN KHOẢN XONG
                            </button>
                            
                            <p className="mt-4 text-[10px] font-bold text-gray-400 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Giao dịch bảo mật VietQR 2.0 chuẩn quốc tế
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
