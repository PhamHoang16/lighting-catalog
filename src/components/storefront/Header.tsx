import Link from "next/link";
import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree } from "@/lib/utils";
import MobileMenu from "@/components/storefront/MobileMenu";
import CartHeaderIcon from "@/components/storefront/CartHeaderIcon";
import HeaderSearchBar from "@/components/storefront/HeaderSearchBar";

// Server Component — fetch categories trực tiếp
async function getCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
    return data ?? [];
}

export default async function StorefrontHeader() {
    const categories = await getCategories();
    const tree = buildCategoryTree(categories);

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
            {/* ── Top bar — thông tin liên hệ ────────────────────── */}
            <div className="border-b border-gray-100 bg-gray-900 text-gray-300">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-1.5 text-xs sm:px-6">
                    <span className="hidden sm:inline">
                        {siteConfig.contact.workingHours}
                    </span>
                    <div className="flex items-center gap-4">
                        <a
                            href={`mailto:${siteConfig.contact.email}`}
                            className="transition-colors hover:text-white"
                        >
                            {siteConfig.contact.email}
                        </a>
                        <a
                            href={siteConfig.contact.hotlineHref}
                            className="font-medium text-amber-400 transition-colors hover:text-amber-300"
                        >
                            {siteConfig.contact.hotline}
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Main nav ───────────────────────────────────────── */}
            <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/25">
                        <span className="text-lg font-bold text-white">L</span>
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-lg font-bold text-gray-900">
                            {siteConfig.name}
                        </span>
                    </div>
                </Link>

                {/* Search Bar */}
                <div className="hidden flex-1 sm:flex items-center justify-start lg:justify-center mx-4">
                    <HeaderSearchBar />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-1 lg:flex">
                    <NavLink href="/">Trang chủ</NavLink>

                    {/* Sản phẩm — dropdown */}
                    <div className="group relative">
                        <NavLink href="/danh-muc">
                            Sản phẩm
                            <svg
                                className="ml-1 h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </NavLink>

                        {/* Dropdown */}
                        <div className="invisible absolute left-0 top-full z-50 min-w-[220px] translate-y-1 rounded-xl border border-gray-200 bg-white py-2 opacity-0 shadow-xl shadow-gray-200/50 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                            <Link
                                href="/danh-muc"
                                className="block px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-amber-50 hover:text-amber-700"
                            >
                                Tất cả sản phẩm
                            </Link>
                            {categories.length > 0 && (
                                <div className="mx-3 my-1 border-t border-gray-100" />
                            )}
                            {tree.map((parent) => (
                                <div key={parent.id}>
                                    <Link
                                        href={`/danh-muc/${parent.slug}`}
                                        className="block px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                    >
                                        {parent.name}
                                    </Link>
                                    {parent.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/danh-muc/${child.slug}`}
                                            className="block px-4 py-1.5 pl-7 text-sm text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                        >
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <NavLink href="/gioi-thieu">Giới thiệu</NavLink>
                    <NavLink href="/lien-he">Liên hệ</NavLink>
                </nav>

                {/* Right — Cart + Hotline CTA + Mobile menu */}
                <div className="flex items-center gap-2">
                    <CartHeaderIcon />

                    <a
                        href={siteConfig.contact.hotlineHref}
                        className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-lg sm:flex"
                    >
                        <Phone className="h-4 w-4" />
                        {siteConfig.contact.hotline}
                    </a>

                    {/* Mobile menu toggle */}
                    <MobileMenu categories={categories} />
                </div>
            </div>
        </header>
    );
}

// ── Nav link sub-component ──────────────────────────────────────
function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
            {children}
        </Link>
    );
}
