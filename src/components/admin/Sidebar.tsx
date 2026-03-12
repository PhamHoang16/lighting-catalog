"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Lightbulb,
    LayoutDashboard,
    Package,
    FolderTree,
    Tag,
    FileText,
    Images,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const navItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Sản phẩm",
        href: "/admin/san-pham",
        icon: Package,
    },
    {
        label: "Danh mục",
        href: "/admin/danh-muc",
        icon: FolderTree,
    },
    {
        label: "Thương hiệu",
        href: "/admin/thuong-hieu",
        icon: Tag,
    },
    {
        label: "Banner",
        href: "/admin/banner",
        icon: Images,
    },
    {
        label: "Đơn hàng",
        href: "/admin/don-hang",
        icon: FileText,
    },
];

export default function AdminSidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    return (
        <>
            {/* ── Mobile overlay ──────────────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200/80 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-500/20">
                            <Lightbulb className="h-5 w-5 text-amber-300" />
                        </div>
                        <div>
                            <span className="text-sm font-bold tracking-tight text-gray-900">
                                Lighting
                            </span>
                            <span className="ml-1 text-xs font-medium text-gray-400">
                                Admin
                            </span>
                        </div>
                    </Link>

                    {/* Mobile close button */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                        aria-label="Đóng menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Menu chính
                    </p>
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                    active
                                        ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-[18px] w-[18px] shrink-0 transition-colors",
                                        active
                                            ? "text-blue-600"
                                            : "text-gray-400 group-hover:text-gray-600"
                                    )}
                                />
                                {item.label}
                                {active && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="border-t border-gray-100 px-4 py-4">
                    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 px-3 py-3">
                        <p className="text-xs font-medium text-gray-500">Phiên bản</p>
                        <p className="mt-0.5 text-xs text-gray-400">v1.0.0 — Beta</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
