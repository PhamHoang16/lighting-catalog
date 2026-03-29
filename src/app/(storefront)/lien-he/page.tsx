"use client";

export const dynamic = "force-static"; // Debug: Force static build for this client page

import { useState, type FormEvent } from "react";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    Loader2,
    CheckCircle2,
    MessageSquare,
    User,
} from "lucide-react";
import { siteConfig } from "@/lib/config/site";

const CONTACT_INFO = [
    {
        icon: MapPin,
        label: "Địa chỉ",
        value: siteConfig.contact.address,
        href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.contact.address)}`,
    },
    {
        icon: Phone,
        label: "Hotline",
        value: siteConfig.contact.hotline,
        href: siteConfig.contact.hotlineHref,
    },
    {
        icon: Mail,
        label: "Email",
        value: siteConfig.contact.email,
        href: `mailto:${siteConfig.contact.email}`,
    },
    {
        icon: Clock,
        label: "Giờ làm việc",
        value: siteConfig.contact.workingHours,
        href: undefined as string | undefined,
    },
];

export default function ContactPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !message.trim()) return;

        setLoading(true);
        // Simulate sending (can integrate Supabase/email later)
        await new Promise((r) => setTimeout(r, 1000));
        setLoading(false);
        setSuccess(true);
    }

    return (
        <div className="bg-white">
            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Liên hệ với chúng tôi
                        </h1>
                        <p className="mx-auto mt-3 max-w-xl text-gray-400">
                            Chúng tôi luôn sẵn sàng lắng nghe và phục vụ bạn. Hãy liên hệ
                            bằng bất kỳ cách nào thuận tiện nhất.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Contact Info Cards ────────────────────────────── */}
            <section className="relative -mt-8 mx-auto max-w-[1440px] px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {CONTACT_INFO.map((info) => (
                        <div
                            key={info.label}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-all hover:shadow-lg"
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                <info.icon className="h-5 w-5 text-amber-600" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                {info.label}
                            </p>
                            {info.href ? (
                                <a
                                    href={info.href}
                                    target={info.href.startsWith("http") ? "_blank" : undefined}
                                    className="mt-1 block text-sm font-semibold text-gray-900 transition-colors hover:text-amber-600"
                                >
                                    {info.value}
                                </a>
                            ) : (
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {info.value}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Form + Map ───────────────────────────────────── */}
            <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* ── Contact Form (3/5) ─────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900">
                                Gửi tin nhắn cho chúng tôi
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong 30 phút.
                            </p>

                            {success ? (
                                <div className="mt-8 flex flex-col items-center gap-4 py-8 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Gửi thành công!
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSuccess(false);
                                            setName("");
                                            setPhone("");
                                            setEmail("");
                                            setMessage("");
                                        }}
                                        className="mt-2 text-sm font-medium text-amber-600 hover:underline"
                                    >
                                        Gửi tin nhắn khác
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        {/* Họ tên */}
                                        <div>
                                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
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
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                            />
                                        </div>

                                        {/* SĐT */}
                                        <div>
                                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
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
                                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={loading}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                        />
                                    </div>

                                    {/* Lời nhắn */}
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            placeholder="Mô tả yêu cầu của bạn..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            disabled={loading}
                                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !name.trim() || !phone.trim() || !message.trim()}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang gửi...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Gửi tin nhắn
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ── Map placeholder (2/5) ──────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-4">
                            {/* Map */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.024!2d106.7!3d10.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzQ4LjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Bản đồ"
                                    className="w-full"
                                />
                            </div>

                            {/* Quick contact */}
                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
                                <h3 className="text-sm font-bold text-gray-900">
                                    Cần tư vấn ngay?
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Gọi hotline để được hỗ trợ trực tiếp.
                                </p>
                                <a
                                    href={siteConfig.contact.hotlineHref}
                                    className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700"
                                >
                                    <Phone className="h-4 w-4" />
                                    {siteConfig.contact.hotline}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
