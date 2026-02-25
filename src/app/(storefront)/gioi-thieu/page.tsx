import type { Metadata } from "next";
import {
    Lightbulb,
    Target,
    Users,
    Award,
    TrendingUp,
    Heart,
    Phone,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
    title: "Giới thiệu",
    description: `Tìm hiểu về ${siteConfig.name} — đơn vị cung cấp giải pháp chiếu sáng chuyên nghiệp hàng đầu.`,
};

// ── Stats ───────────────────────────────────────────────────────
const STATS = [
    { number: "10+", label: "Năm kinh nghiệm" },
    { number: "5000+", label: "Sản phẩm đa dạng" },
    { number: "1000+", label: "Dự án hoàn thành" },
    { number: "98%", label: "Khách hàng hài lòng" },
];

// ── Values ──────────────────────────────────────────────────────
const VALUES = [
    {
        icon: Award,
        title: "Chất lượng đảm bảo",
        description:
            "100% sản phẩm chính hãng, có chứng nhận chất lượng và bảo hành dài hạn từ nhà sản xuất.",
    },
    {
        icon: TrendingUp,
        title: "Giá cạnh tranh",
        description:
            "Nhập hàng trực tiếp từ nhà máy, loại bỏ trung gian để mang đến mức giá tốt nhất cho khách hàng.",
    },
    {
        icon: Users,
        title: "Đội ngũ chuyên gia",
        description:
            "Kỹ sư và tư vấn viên giàu kinh nghiệm, sẵn sàng hỗ trợ thiết kế giải pháp chiếu sáng tối ưu.",
    },
    {
        icon: Heart,
        title: "Dịch vụ tận tâm",
        description:
            "Hỗ trợ khách hàng 24/7, phản hồi nhanh chóng và đồng hành trong suốt quá trình dự án.",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* ── Hero ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.08),transparent_50%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
                            <Lightbulb className="h-4 w-4" />
                            Về chúng tôi
                        </div>
                        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                            Soi sáng mọi{" "}
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                không gian
                            </span>
                        </h1>
                        <p className="mt-5 text-lg leading-relaxed text-gray-400">
                            {siteConfig.name} là đơn vị chuyên cung cấp các giải pháp chiếu sáng
                            cho công trình thương mại, dân dụng và công nghiệp. Với hơn 10 năm kinh
                            nghiệm, chúng tôi tự hào mang đến sản phẩm chất lượng cao cùng dịch vụ
                            tư vấn chuyên nghiệp.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────────── */}
            <section className="border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid grid-cols-2 divide-x divide-gray-100 lg:grid-cols-4">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="px-4 py-10 text-center sm:px-8">
                                <p className="text-3xl font-extrabold text-amber-600 sm:text-4xl">
                                    {stat.number}
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission ───────────────────────────────────────── */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Left — text */}
                    <div>
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Target className="h-3.5 w-3.5" />
                            Sứ mệnh
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Mang ánh sáng chất lượng đến mọi công trình
                        </h2>
                        <p className="mt-4 leading-relaxed text-gray-600">
                            Chúng tôi tin rằng ánh sáng không chỉ đơn thuần là chiếu sáng — nó tạo nên
                            không khí, cảm xúc và giá trị thẩm mỹ cho không gian sống. Với triết lý đó,
                            {siteConfig.name} cam kết:
                        </p>
                        <ul className="mt-5 space-y-3">
                            {[
                                "Chỉ phân phối sản phẩm chính hãng, đạt tiêu chuẩn quốc tế",
                                "Tư vấn giải pháp chiếu sáng tối ưu cho từng loại công trình",
                                "Hỗ trợ lắp đặt và bảo hành dài hạn",
                                "Cập nhật công nghệ LED tiên tiến nhất",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right — visual card */}
                    <div className="relative">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 p-8 lg:p-10">
                            <div className="grid grid-cols-2 gap-4">
                                {VALUES.slice(0, 2).map((v) => (
                                    <ValueMiniCard key={v.title} {...v} />
                                ))}
                                {VALUES.slice(2, 4).map((v) => (
                                    <ValueMiniCard key={v.title} {...v} />
                                ))}
                            </div>
                        </div>
                        {/* Decorative dot */}
                        <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-amber-500/20" />
                        <div className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-orange-500/20" />
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Sẵn sàng cho dự án tiếp theo?
                    </h2>
                    <p className="mt-3 text-gray-400">
                        Liên hệ ngay để nhận tư vấn và báo giá miễn phí.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Link
                            href="/lien-he"
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-xl"
                        >
                            Liên hệ ngay
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a
                            href={siteConfig.contact.hotlineHref}
                            className="flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            <Phone className="h-4 w-4" />
                            {siteConfig.contact.hotline}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

// ── Value mini card ─────────────────────────────────────────────
function ValueMiniCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <Icon className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
        </div>
    );
}
