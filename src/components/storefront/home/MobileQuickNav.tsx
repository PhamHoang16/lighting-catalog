"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, LayoutGrid } from "lucide-react";
import type { Category } from "@/lib/types/database";

interface MobileQuickNavProps {
    topCategories: Category[];
}

export default function MobileQuickNav({ topCategories }: MobileQuickNavProps) {
    const pathname = usePathname();

    // Chỉ hiển thị ở trang chủ
    if (pathname !== "/") return null;

    return (
        <nav className="relative z-10 flex w-full items-center gap-3 overflow-x-auto border-b border-gray-100 bg-white/95 px-4 py-3.5 backdrop-blur-md no-scrollbar animate-in slide-in-from-top-2 duration-500">
            {/* Category Tabs */}
            {topCategories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/danh-muc/${cat.slug}`}
                    className="flex shrink-0 items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/40 px-3.5 py-1.5 transition-all shadow-sm active:scale-95 hover:border-amber-300 hover:bg-amber-100/50"
                >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-sm border border-amber-200/50">
                        {cat.image_url ? (
                            <Image
                                src={cat.image_url as string}
                                alt={cat.name}
                                width={24}
                                height={24}
                                className="h-full w-full object-contain mix-blend-multiply"
                            />
                        ) : (
                            <ChevronRight className="h-3 w-3 text-amber-300" />
                        )}
                    </div>
                    <span className="whitespace-nowrap text-[11px] font-black uppercase tracking-tight text-amber-900/80">
                        {cat.name}
                    </span>
                </Link>
            ))}

            {/* Xem tất cả - Chuyển xuống cuối list */}
            <Link
                href="/danh-muc"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-white shadow-md shadow-amber-500/20 active:scale-95"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Xem tất cả</span>
            </Link>
        </nav>
    );
}
