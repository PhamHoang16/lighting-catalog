"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Menu,
    X,
    Home,
    ChevronRight,
    ChevronDown,
    Phone,
    Info,
    Mail,
    ShoppingBag,
    Search,
    Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config/site";
import type { CategoryWithChildren } from "@/lib/types/database";

interface MobileMenuProps {
    categories: CategoryWithChildren[];
}

export default function MobileMenu({ categories }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    // Lock body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = "var(--removed-body-scroll-bar-size)"; // Optional: prevent layout shift
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [open]);

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
                    className="fixed inset-0 z-[60] bg-gray-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-in panel - Fixed to Left to match hamburger position */}
            <div
                className={`fixed inset-y-0 left-0 z-[70] flex h-full w-full max-w-[300px] flex-col transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-5 bg-slate-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-900 uppercase tracking-tighter italic leading-none">{siteConfig.name}</span>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">Menu danh mục</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="rounded-xl p-2 text-gray-400 bg-white border border-gray-100 shadow-sm transition-all hover:text-gray-900 active:scale-90"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search Bar - Fixed at top */}
                <div className="px-5 py-4 border-b border-gray-100 shrink-0">
                    <form onSubmit={handleSearch} className="relative group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 pl-4 pr-11 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 group-focus-within:text-amber-500 transition-colors"
                            aria-label="Tìm kiếm"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                {/* Nav links - Scrollable Area */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 custom-scrollbar">
                    <ul className="space-y-1">
                        <MobileNavItem
                            href="/"
                            icon={<Home className="h-5 w-5" />}
                            label="Trang chủ"
                            onClick={() => setOpen(false)}
                        />

                        {/* Sản phẩm section */}
                        <li className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-amber-600/60 italic border-l-2 border-amber-500 ml-1">
                                Danh mục chính
                            </p>
                        </li>
                        <MobileNavItem
                            href="/danh-muc"
                            icon={<ShoppingBag className="h-5 w-5" />}
                            label="Tất cả sản phẩm"
                            onClick={() => setOpen(false)}
                        />
                        {categories.map((cat) => (
                            <MobileNavCategoryItem
                                key={cat.id}
                                cat={cat}
                                onClick={() => setOpen(false)}
                            />
                        ))}

                        <li className="pt-6 pb-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 italic border-l-2 border-gray-200 ml-1">
                                Liên kết khác
                            </p>
                        </li>
                        <MobileNavItem
                            href="/gioi-thieu"
                            icon={<Info className="h-5 w-5 text-gray-400" />}
                            label="Về LIT Lighting"
                            onClick={() => setOpen(false)}
                        />
                        <MobileNavItem
                            href="/lien-he"
                            icon={<Mail className="h-5 w-5 text-gray-400" />}
                            label="Hỗ trợ & Liên hệ"
                            onClick={() => setOpen(false)}
                        />
                    </ul>
                </nav>

                {/* Bottom CTA - Fixed at bottom */}
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-pulse">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hotline hỗ trợ 24/7</p>
                            <p className="text-sm font-black text-gray-900 mt-1">{siteConfig.contact.hotline}</p>
                            <p className="text-sm font-black text-gray-900">{siteConfig.contact.hotline2}</p>
                        </div>
                    </div>
                    <a
                        href={siteConfig.contact.hotlineHref}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-400 hover:to-orange-500 active:scale-95"
                    >
                        <Phone className="h-4 w-4 fill-current" />
                        GỌI TƯ VẤN NGAY
                    </a>
                </div>
            </div>
        </>
    );
}

// ── Sub-components ───────────────────────────────────────────────

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

function MobileNavCategoryItem({
    cat,
    onClick,
}: {
    cat: CategoryWithChildren;
    onClick: () => void;
}) {
    const [open, setOpen] = useState(false);

    const thumbnail = (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white p-1 shadow-sm group-hover:border-amber-200">
            {cat.image_url ? (
                <Image
                    src={cat.image_url as string}
                    alt={cat.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-contain mix-blend-multiply"
                />
            ) : (
                <ChevronRight className="h-3 w-3 text-gray-300" />
            )}
        </div>
    );

    // if no children, just render standard item with thumbnail
    if (!cat.children || cat.children.length === 0) {
        return (
            <li className="group">
                <Link
                    href={`/danh-muc/${cat.slug}`}
                    onClick={onClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                    {thumbnail}
                    {cat.name}
                </Link>
            </li>
        );
    }

    return (
        <li className="flex flex-col group">
            <div className={`flex items-center justify-between rounded-lg pr-1 transition-colors ${open ? "bg-amber-50/50" : "hover:bg-amber-50"}`}>
                <Link
                    href={`/danh-muc/${cat.slug}`}
                    onClick={onClick}
                    className="flex flex-1 items-center gap-3 py-2 pl-3 text-sm font-medium text-gray-700 hover:text-amber-700"
                >
                    {thumbnail}
                    {cat.name}
                </Link>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setOpen(!open);
                    }}
                    className="p-2 text-gray-400 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-transform focus:outline-none"
                    aria-label="Toggle subcategories"
                >
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "-rotate-180 text-amber-600" : ""}`} />
                </button>
            </div>
            {/* Accordion panel */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}
            >
                <ul className="overflow-hidden pl-11 space-y-1 relative before:absolute before:left-[22px] before:top-2 before:w-px before:h-[calc(100%-16px)] before:bg-gray-100">
                    {cat.children.map((child: CategoryWithChildren) => (
                        <li key={child.id} className="relative before:absolute before:-left-[22px] before:top-1/2 before:-translate-y-1/2 before:w-[22px] before:h-px before:bg-gray-100">
                            <Link
                                href={`/danh-muc/${child.slug}`}
                                onClick={onClick}
                                className="group/sub flex items-center gap-2.5 py-2 translation-all"
                            >
                                {/* Micro Thumbnail for Subcategory */}
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-50 bg-white p-0.5 shadow-sm transition-colors group-hover/sub:border-amber-200">
                                    {child.image_url ? (
                                        <Image
                                            src={child.image_url as string}
                                            alt={child.name}
                                            width={18}
                                            height={18}
                                            className="h-full w-full object-contain mix-blend-multiply"
                                        />
                                    ) : (
                                        <div className="h-1 w-1 rounded-full bg-gray-200" />
                                    )}
                                </div>
                                <span className="text-[13px] font-medium text-gray-500 transition-colors group-hover/sub:text-amber-600">
                                    {child.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
}
