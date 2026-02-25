"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PaginationControlsProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function PaginationControls({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: PaginationControlsProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1;

    // Hiển thị range: "1–10 / 53"
    const from = currentPage * pageSize + 1;
    const to = Math.min((currentPage + 1) * pageSize, totalCount);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-3 sm:flex-row">
            {/* Left — info */}
            <div className="flex items-center gap-4">
                <p className="text-xs text-gray-500">
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-700">
                        {totalCount > 0 ? `${from}–${to}` : "0"}
                    </span>{" "}
                    / <span className="font-semibold text-gray-700">{totalCount}</span>{" "}
                    kết quả
                </p>

                {/* Page size select */}
                <div className="flex items-center gap-1.5">
                    <label htmlFor="page-size" className="text-xs text-gray-500">
                        Hiển thị
                    </label>
                    <select
                        id="page-size"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-gray-500">/ trang</span>
                </div>
            </div>

            {/* Right — navigation */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
                        isFirstPage
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Trước
                </button>

                <span className="min-w-[5rem] text-center text-xs font-medium text-gray-600">
                    Trang {currentPage + 1} / {totalPages}
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className={cn(
                        "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
                        isLastPage
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                            : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                >
                    Sau
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
