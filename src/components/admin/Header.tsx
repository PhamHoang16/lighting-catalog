"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth/logout";
import { Menu, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
    onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: HeaderProps) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        await logoutAction();
        router.push("/login");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            {/* Left — Hamburger (mobile only) */}
            <button
                onClick={onMenuToggle}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                aria-label="Mở menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Center / spacer */}
            <div className="hidden lg:block" />

            {/* Right — Logout */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loggingOut ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang đăng xuất...
                        </>
                    ) : (
                        <>
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
