"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    if (totalPages <= 1) return null;

    const navigateToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="mt-10 flex items-center justify-center gap-2">
            <button
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
                aria-label="Trang trước"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page, index) => {
                if (page === "...") {
                    return (
                        <span key={`ellipsis-${index}`} className="flex h-10 w-10 items-center justify-center text-gray-400">
                            ...
                        </span>
                    );
                }

                const isCurrent = page === currentPage;
                return (
                    <button
                        key={`page-${page}`}
                        onClick={() => navigateToPage(page as number)}
                        disabled={isPending}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 ${isCurrent
                                ? "border-amber-500 bg-amber-500 text-white shadow-amber-500/25 cursor-default"
                                : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
                            }`}
                        aria-current={isCurrent ? "page" : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
                aria-label="Trang sau"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
