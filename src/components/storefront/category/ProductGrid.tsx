"use client";

import { PackageOpen, Home } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import ProductCard from "@/components/storefront/ProductCard";
import SortDropdown, { type SortOption } from "./SortDropdown";
import Pagination from "./Pagination";
import ProductCardSkeleton from "./ProductCardSkeleton";
import type { Product } from "@/lib/types/database";

interface ProductGridProps {
    products: Product[];
    categoryName?: string;
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    hasFilters?: boolean;
}

export default function ProductGrid({
    products,
    categoryName,
    totalCount = 0,
    currentPage = 1,
    totalPages = 1,
    hasFilters = false,
}: ProductGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSort = (searchParams.get("sort") as SortOption) || "newest";

    const handleSortChange = (newSort: SortOption) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", newSort);
        // Reset page to 1 when sort changes
        params.set("page", "1");

        startTransition(() => {
            router.push(`?${params.toString()}`);
        });
    };



    // ── Empty state ─────────────────────────────────────────────
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-24 text-center mx-auto max-w-2xl h-full min-h-[400px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 mb-2">
                    <PackageOpen className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-900 mb-2">
                        {hasFilters ? "Không tìm thấy kết quả phù hợp" : "Chưa có sản phẩm nào"}
                    </p>
                    <p className="text-[15px] text-gray-500 max-w-md mx-auto leading-relaxed">
                        {hasFilters 
                            ? "Không có sản phẩm nào khớp với bộ lọc bạn đang chọn. Vui lòng thử thay đổi các tùy chọn lọc hoặc xóa bộ lọc để xem toàn bộ danh sách."
                            : categoryName
                                ? `Danh mục "${categoryName}" hiện đang được cập nhật sản phẩm. Vui lòng quay lại sau.`
                                : "Hiện chưa có sản phẩm nào trong hệ thống."}
                    </p>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    {hasFilters && (
                        <button
                            onClick={() => router.push("?")}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gray-800 hover:scale-105 active:scale-95"
                        >
                            Xóa toàn bộ bộ lọc
                        </button>
                    )}
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                    >
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* ── Toolbar ──────────────────────────────────────── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <p className="text-[15px] font-medium text-gray-600">
                    Tìm thấy <span className="font-bold text-gray-900">{totalCount}</span> sản phẩm
                </p>
                <div className={`transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SortDropdown value={currentSort} onChange={handleSortChange} />
                </div>
            </div>

            {/* ── Grid ─────────────────────────────────────────── */}
            {/* ── Grid ─────────────────────────────────────────── */}
            <div className="relative">
                {isPending ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-300">
                        {[...Array(8)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ────────────────────────────────────── */}
            <div className={isPending ? "opacity-30 pointer-events-none" : ""}>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                )}
            </div>
        </div>
    );
}
