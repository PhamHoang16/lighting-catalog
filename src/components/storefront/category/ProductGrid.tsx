"use client";

import { useState, useMemo } from "react";
import { PackageOpen, Home } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import SortDropdown, { type SortOption } from "./SortDropdown";
import type { Product } from "@/lib/types/database";

interface ProductGridProps {
    products: Product[];
    categoryName?: string;
}

export default function ProductGrid({
    products,
    categoryName,
}: ProductGridProps) {
    const [sort, setSort] = useState<SortOption>("newest");

    const sorted = useMemo(() => {
        const list = [...products];
        switch (sort) {
            case "newest":
                return list.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );
            case "oldest":
                return list.sort(
                    (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                );
            case "price-asc":
                return list.sort((a, b) => a.price - b.price);
            case "price-desc":
                return list.sort((a, b) => b.price - a.price);
            default:
                return list;
        }
    }, [products, sort]);

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
                        {products.length}
                    </span>{" "}
                    sản phẩm
                </p>
                <SortDropdown value={sort} onChange={setSort} />
            </div>

            {/* ── Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {sorted.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
