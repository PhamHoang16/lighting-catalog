"use client";

import { useState, type FormEvent } from "react";
import { User, Phone, Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { createLeadAction } from "@/app/actions/admin";

export default function FooterContactForm() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    if (success) {
        return (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-gray-700 bg-gray-800/40 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Đã gửi thông tin!</p>
                    <p className="mt-1 text-sm text-gray-400">
                        Cảm ơn bạn, chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất.
                    </p>
                </div>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                >
                    Gửi thông tin khác
                </button>
            </div>
        );
    }

    const inputClass =
        "w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3.5 py-2.5 pl-10 text-sm text-white shadow-sm transition-all placeholder:text-gray-500 hover:border-gray-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60";

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm leading-relaxed text-gray-400">
                Để lại thông tin, chúng tôi sẽ gọi lại tư vấn miễn phí.
            </p>

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

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
                type="submit"
                disabled={loading || !name.trim() || !phone.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    );
}
