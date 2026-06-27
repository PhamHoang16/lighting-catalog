"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { User, Phone, Mail, Send, Loader2, CheckCircle2, X } from "lucide-react";
import { createLeadAction } from "@/app/actions/admin";

interface LeadFormModalProps {
    open: boolean;
    onClose: () => void;
}

export default function LeadFormModal({ open, onClose }: LeadFormModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape" && !loading) onClose();
        }
        if (open) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose, loading]);

    if (!open) return null;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        setLoading(true);
        setError(null);
        const result = await createLeadAction({ name, phone, email });
        setLoading(false);

        if (result?.error) {
            setError(result.error);
            return;
        }
        setSuccess(true);
        setName("");
        setPhone("");
        setEmail("");
    }

    const inputClass =
        "w-full rounded-xl border border-gray-300 px-4 py-3 pl-10 text-sm shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60";

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === overlayRef.current && !loading) onClose();
            }}
        >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                    aria-label="Đóng"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 py-5">
                    <h3 className="text-lg font-bold text-white">Đăng ký tư vấn miễn phí</h3>
                    <p className="mt-0.5 text-sm text-amber-50">
                        Để lại thông tin, chúng tôi sẽ gọi lại ngay cho bạn.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900">Đã gửi thành công!</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-1 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                            >
                                Đóng
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Họ và tên"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Số điện thoại"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
                                <input
                                    type="email"
                                    placeholder="Email (không bắt buộc)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className={inputClass}
                                />
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading || !name.trim() || !phone.trim()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Đăng ký tư vấn
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
