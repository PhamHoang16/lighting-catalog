"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Menu,
    X,
    Home,
    ChevronRight,
    Phone,
    Info,
    Mail,
    ShoppingBag,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config/site";

interface MobileMenuProps {
    categories: { id: string; name: string; slug: string }[];
}

export default function MobileMenu({ categories }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const params = new URLSearchParams();
            params.set("q", query.trim());
            router.push(`/danh-muc?${params.toString()}`);
            setQuery("");
            setOpen(false);
        }
    };

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setOpen(true)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="Mở menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-in panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <span className="text-lg font-bold text-gray-900">Menu</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-amber-100 hover:text-amber-600 active:scale-95"
                            aria-label="Tìm kiếm"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        <MobileNavItem
                            href="/"
                            icon={<Home className="h-5 w-5" />}
                            label="Trang chủ"
                            onClick={() => setOpen(false)}
                        />

                        {/* Sản phẩm section */}
                        <li className="pt-2">
                            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Sản phẩm
                            </p>
                        </li>
                        <MobileNavItem
                            href="/danh-muc"
                            icon={<ShoppingBag className="h-5 w-5" />}
                            label="Tất cả sản phẩm"
                            onClick={() => setOpen(false)}
                        />
                        {categories.map((cat) => (
                            <MobileNavItem
                                key={cat.id}
                                href={`/danh-muc/${cat.slug}`}
                                icon={<ChevronRight className="h-4 w-4 text-gray-300" />}
                                label={cat.name}
                                onClick={() => setOpen(false)}
                            />
                        ))}

                        <li className="pt-2">
                            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Khác
                            </p>
                        </li>
                        <MobileNavItem
                            href="/gioi-thieu"
                            icon={<Info className="h-5 w-5" />}
                            label="Giới thiệu"
                            onClick={() => setOpen(false)}
                        />
                        <MobileNavItem
                            href="/lien-he"
                            icon={<Mail className="h-5 w-5" />}
                            label="Liên hệ"
                            onClick={() => setOpen(false)}
                        />
                    </ul>
                </nav>

                {/* Bottom CTA */}
                <div className="border-t border-gray-100 p-4">
                    <a
                        href={siteConfig.contact.hotlineHref}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700"
                    >
                        <Phone className="h-4 w-4" />
                        Gọi ngay: {siteConfig.contact.hotline}
                    </a>
                </div>
            </div>
        </>
    );
}

// ── Sub-component ───────────────────────────────────────────────
function MobileNavItem({
    href,
    icon,
    label,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
            >
                {icon}
                {label}
            </Link>
        </li>
    );
}
