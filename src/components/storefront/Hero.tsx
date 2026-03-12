import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gray-900">
            {/* ── Background layers ──────────────────────────────── */}
            {/* Gradient base */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

            {/* Amber accent glow */}
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-3xl" />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* ── Content ────────────────────────────────────────── */}
            <div className="relative mx-auto max-w-[1440px] px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
                <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
                        <Sparkles className="h-4 w-4" />
                        Giải pháp chiếu sáng chuyên nghiệp
                    </div>

                    {/* Heading */}
                    <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Đẳng Cấp{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Chiếu Sáng
                        </span>{" "}
                        Công Trình
                    </h1>

                    {/* Description */}
                    <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-400 sm:text-lg">
                        {siteConfig.description}
                    </p>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link
                            href="/danh-muc"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/30"
                        >
                            Khám phá Catalogue
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/lien-he"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600 px-7 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:bg-white/5 hover:text-white"
                        >
                            Liên hệ tư vấn
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-gray-800 pt-8">
                        <TrustItem value="500+" label="Dự án" />
                        <TrustItem value="1000+" label="Sản phẩm" />
                        <TrustItem value="10+" label="Năm kinh nghiệm" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrustItem({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-500">{value}</span>
            <span className="text-sm text-gray-500">{label}</span>
        </div>
    );
}
