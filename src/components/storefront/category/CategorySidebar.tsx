"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, X, FolderOpen, Layers } from "lucide-react";
import type { Category } from "@/lib/types/database";

interface CategorySidebarProps {
    categories: Category[];
    activeSlug?: string | null;
}

export default function CategorySidebar({
    categories,
    activeSlug,
}: CategorySidebarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const content = (
        <nav className="space-y-1">
            {/* Tất cả */}
            <SidebarLink
                href="/danh-muc"
                label="Tất cả sản phẩm"
                icon={<Layers className="h-4 w-4" />}
                active={!activeSlug}
                onClick={() => setMobileOpen(false)}
            />

            <div className="my-3 h-px bg-gray-200" />

            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Danh mục
            </p>

            {categories.map((cat) => (
                <SidebarLink
                    key={cat.id}
                    href={`/danh-muc/${cat.slug}`}
                    label={cat.name}
                    icon={<FolderOpen className="h-4 w-4" />}
                    active={activeSlug === cat.slug}
                    onClick={() => setMobileOpen(false)}
                />
            ))}
        </nav>
    );

    return (
        <>
            {/* ── Desktop Sidebar ──────────────────────────────── */}
            <aside className="hidden lg:block">
                <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-gray-900">
                        Bộ lọc
                    </h3>
                    {content}
                </div>
            </aside>

            {/* ── Mobile Filter Button ─────────────────────────── */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                    <Filter className="h-4 w-4" />
                    Lọc danh mục
                    {activeSlug && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            1
                        </span>
                    )}
                </button>
            </div>

            {/* ── Mobile Drawer ────────────────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Drawer panel */}
                    <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-900">
                                Lọc danh mục
                            </h3>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}

// ── Sidebar link ────────────────────────────────────────────────
function SidebarLink({
    href,
    label,
    icon,
    active,
    onClick,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${active
                    ? "bg-amber-50 text-amber-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            <span className={active ? "text-amber-500" : "text-gray-400"}>
                {icon}
            </span>
            {label}
        </Link>
    );
}
