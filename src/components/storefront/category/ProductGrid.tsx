"use client";

import { PackageOpen, Home } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import ProductCard from "@/components/storefront/ProductCard";
import SortDropdown, { type SortOption } from "./SortDropdown";
import Pagination from "./Pagination";
import type { Product } from "@/lib/types/database";

interface ProductGridProps {
    products: Product[];
    categoryName?: string;
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
}

export default function ProductGrid({
    products,
    categoryName,
    totalCount = 0,
    currentPage = 1,
    totalPages = 1,
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
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <PackageOpen className="h-8 w-8 text-gray-300" />
                </div>
                <div>
                    <p className="text-base font-semibold text-gray-900">
                        Chưa có sản phẩm nào
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        {categoryName
                            ? `Danh mục "${categoryName}" hiện chưa có sản phẩm.`
                            : "Hiện chưa có sản phẩm nào trong hệ thống."}
                    </p>
                </div>
                <Link
                    href="/"
                    className="mt-2 flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/25 transition-all hover:bg-amber-600"
                >
                    <Home className="h-4 w-4" />
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* ── Toolbar ──────────────────────────────────────── */}
            <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-900">
                        {totalCount}
                    </span>{" "}
                    sản phẩm
                </p>
                <div className={`transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SortDropdown value={currentSort} onChange={handleSortChange} />
                </div>
            </div>

            {/* ── Grid ─────────────────────────────────────────── */}
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* ── Pagination ────────────────────────────────────── */}
            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
        </div>
    );
}
