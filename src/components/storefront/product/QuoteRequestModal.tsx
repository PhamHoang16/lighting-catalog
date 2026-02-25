"use client";

import { useState, type FormEvent } from "react";
import {
    Phone,
    User,
    MessageSquare,
    CheckCircle2,
    Loader2,
    X,
    Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface QuoteRequestModalProps {
    productId: string;
    productName: string;
    trigger: React.ReactNode;
}

export default function QuoteRequestModal({
    productId,
    productName,
    trigger,
}: QuoteRequestModalProps) {
    const supabase = createClient();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function resetForm() {
        setName("");
        setPhone("");
        setMessage("");
        setSuccess(false);
    }

    function handleClose() {
        if (!loading) {
            setOpen(false);
            setTimeout(resetForm, 300);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        setLoading(true);
        const { error } = await supabase.from("quote_requests").insert({
            customer_name: name.trim(),
            phone: phone.trim(),
            message: message.trim() || null,
            status: "new",
            items: [
                {
                    product_id: productId,
                    product_name: productName,
                    quantity: 1,
                },
            ],
        });

        setLoading(false);

        if (error) {
            alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            return;
        }

        setSuccess(true);
        setTimeout(handleClose, 2500);
    }

    return (
        <>
            {/* Trigger */}
            <div onClick={() => setOpen(true)}>{trigger}</div>

            {/* Modal */}
            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleClose();
                    }}
                >
                    <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95 sm:fade-in">
                        <div className="rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
                            {/* ── Header ───────────────────────────────────── */}
                            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white sm:rounded-t-2xl">
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold">Nhận báo giá</h3>
                                    <p className="mt-1 text-sm text-amber-100">
                                        Sản phẩm: {productName}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                {/* Decorative circles */}
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                            </div>

                            {/* ── Body ─────────────────────────────────────── */}
                            <div className="px-6 py-5">
                                {success ? (
                                    <SuccessMessage />
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
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
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                            />
                                        </div>

                                        {/* Lời nhắn */}
                                        <div>
                                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                                Lời nhắn
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="Tôi muốn hỏi về sản phẩm này..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                disabled={loading}
                                                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                                            />
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
                                            Chúng tôi sẽ liên hệ bạn trong vòng 30 phút
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function SuccessMessage() {
    return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
                <h4 className="text-lg font-bold text-gray-900">
                    Gửi thành công!
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                    Đội ngũ tư vấn sẽ liên hệ bạn trong thời gian sớm nhất.
                </p>
            </div>
        </div>
    );
}
