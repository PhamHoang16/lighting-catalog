import Link from "next/link";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Facebook,
    ExternalLink,
} from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { siteConfig } from "@/lib/config/site";
import type { Category } from "@/lib/types/database";

// Fetch only root categories
async function getCategories() {
    const supabase = createStaticClient();
    const { data } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id")
        .order("name", { ascending: true });
    return data ?? [];
}

export default async function StorefrontFooter() {
    const categories = await getCategories();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* ── Main grid ──────────────────────────────────────── */}
            <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* ── Cột 1: Công ty ─────────────────────────────── */}
                    <div>
                        <Link href="/" className="mb-5 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
                                <span className="text-lg font-bold text-white">L</span>
                            </div>
                            <span className="text-lg font-bold text-white">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="mb-4 text-sm leading-relaxed text-gray-400">
                            {siteConfig.description}
                        </p>

                        <ul className="space-y-2.5 text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                <span>{siteConfig.contact.address}</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                                <div className="flex flex-col gap-0.5">
                                    <a
                                        href={siteConfig.contact.hotlineHref}
                                        className="transition-colors hover:text-white"
                                    >
                                        {siteConfig.contact.hotline}
                                    </a>
                                    <a
                                        href={`tel:${siteConfig.contact.hotline2.replace(/\s/g, "")}`}
                                        className="transition-colors hover:text-white"
                                    >
                                        {siteConfig.contact.hotline2}
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                                <a
                                    href={`mailto:${siteConfig.contact.email}`}
                                    className="transition-colors hover:text-white"
                                >
                                    {siteConfig.contact.email}
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                                <span>{siteConfig.contact.workingHours}</span>
                            </li>
                        </ul>
                    </div>

                    {/* ── Cột 2: Danh mục sản phẩm ──────────────────── */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Danh mục sản phẩm
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link
                                    href="/danh-muc"
                                    className="text-sm transition-colors hover:text-amber-400"
                                >
                                    Tất cả sản phẩm
                                </Link>
                            </li>
                            {categories.filter(c => !c.parent_id).map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/danh-muc/${cat.slug}`}
                                        className="text-sm transition-colors hover:text-amber-400"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Cột 3: Hỗ trợ khách hàng ──────────────────── */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Hỗ trợ khách hàng
                        </h3>
                        <ul className="space-y-2.5">
                            <FooterLink href="/tin-tuc" label="Tin tức" />
                            <FooterLink href="/gioi-thieu" label="Giới thiệu" />
                            <FooterLink href="/lien-he" label="Liên hệ" />
                            <FooterLink
                                href="/chinh-sach/bao-hanh"
                                label="Chính sách bảo hành"
                            />
                        </ul>
                    </div>

                    {/* ── Cột 4: Kết nối ────────────────────────────── */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Kết nối với chúng tôi
                        </h3>

                        {/* Social icons */}
                        <div className="mb-6 flex items-center gap-3">
                            <SocialIcon
                                href={siteConfig.contact.facebook}
                                label="Facebook"
                                icon={<Facebook className="h-5 w-5" />}
                            />
                            <SocialIcon
                                href={siteConfig.contact.zaloHref}
                                label="Zalo"
                                icon={
                                    <svg viewBox="0 0 48 48" fill="currentColor" className="h-5 w-5">
                                        <path d="M24 2C11.85 2 2 11.21 2 22.6c0 6.51 3.18 12.3 8.15 16.1-.17 1.82-.87 4.55-2.54 6.4 0 0 4.88-.35 8.75-3.56 2.38.73 4.93 1.13 7.64 1.13C36.15 42.67 46 33.46 46 22.06S36.15 2 24 2z" />
                                    </svg>
                                }
                            />
                        </div>

                        {/* Google Maps embed */}
                        <div className="overflow-hidden rounded-lg border border-gray-700">
                            <iframe
                                title="Bản đồ"
                                src="https://maps.google.com/maps?q=21.0546381,105.7452889&z=17&hl=vi&output=embed"
                                width="100%"
                                height="140"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom bar ─────────────────────────────────────── */}
            <div className="border-t border-gray-800">
                <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
                    <p className="text-xs text-gray-500">
                        © {currentYear} {siteConfig.name}. Tất cả quyền được bảo lưu.
                    </p>
                    <p className="text-xs text-gray-600">
                        Thiết kế bởi{" "}
                        <span className="font-medium text-gray-500">Antigravity</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ── Sub-components ──────────────────────────────────────────────

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <li>
            <Link
                href={href}
                className="inline-flex items-center gap-1 text-sm transition-colors hover:text-amber-400"
            >
                {label}
            </Link>
        </li>
    );
}

function SocialIcon({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-amber-500 hover:text-white hover:shadow-lg hover:shadow-amber-500/20"
            aria-label={label}
        >
            {icon}
        </a>
    );
}
