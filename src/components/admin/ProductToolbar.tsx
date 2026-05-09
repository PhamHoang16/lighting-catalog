"use client";

import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X, Flame } from "lucide-react";
import type { Category } from "@/lib/types/database";
import { getCategoriesAction } from "@/app/actions/admin";

// ── Sort options ────────────────────────────────────────────────
export interface SortOption {
    label: string;
    column: string;
    ascending: boolean;
}

export const SORT_OPTIONS: SortOption[] = [
    { label: "Mới nhất", column: "created_at", ascending: false },
    { label: "Cũ nhất", column: "created_at", ascending: true },
    { label: "Giá tăng dần", column: "price", ascending: true },
    { label: "Giá giảm dần", column: "price", ascending: false },
    { label: "Tên A → Z", column: "name", ascending: true },
    { label: "Tên Z → A", column: "name", ascending: false },
    { label: "Thứ tự hiển thị", column: "sort_order", ascending: true },
];

// ── Props ───────────────────────────────────────────────────────
interface ProductToolbarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortIndex: number;
    onSortChange: (index: number) => void;
    categoryId: string;
    onCategoryChange: (categoryId: string) => void;
    bestSellerOnly: boolean;
    onBestSellerChange: (value: boolean) => void;
}

export default function ProductToolbar({
    searchTerm,
    onSearchChange,
    sortIndex,
    onSortChange,
    categoryId,
    onCategoryChange,
    bestSellerOnly,
    onBestSellerChange,
}: ProductToolbarProps) {
    // ── Categories cho filter dropdown ──────────────────────────
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            setLoadingCats(true);
            try {
                const data = await getCategoriesAction();
                setCategories(data as Category[]);
            } catch {
                // Silently fail — filter will show empty
            }
            setLoadingCats(false);
        }
        fetchCategories();
    }, []);

    // ── Debounced search ────────────────────────────────────────
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        setLocalSearch(searchTerm);
    }, [searchTerm]);

    function handleSearchInput(value: string) {
        setLocalSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearchChange(value.trim());
        }, 300);
    }

    function clearSearch() {
        setLocalSearch("");
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onSearchChange("");
    }

    // ── Check if any filter is active ───────────────────────────
    const hasActiveFilters = searchTerm !== "" || categoryId !== "" || sortIndex !== 0 || bestSellerOnly;

    return (
        <div className="mb-4 space-y-3">
            {/* Row 1: Search + Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        value={localSearch}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-9 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {localSearch && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                            aria-label="Xóa tìm kiếm"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="hidden h-4 w-4 text-gray-400 sm:block" />
                    <select
                        value={sortIndex}
                        onChange={(e) => onSortChange(Number(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {SORT_OPTIONS.map((opt, idx) => (
                            <option key={idx} value={idx}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category filter */}
                <select
                    value={categoryId}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    disabled={loadingCats}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {/* Best seller toggle */}
                <button
                    onClick={() => onBestSellerChange(!bestSellerOnly)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium shadow-sm transition-all ${
                        bestSellerOnly
                            ? "border-orange-400 bg-orange-50 text-orange-600 ring-1 ring-orange-300"
                            : "border-gray-300 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500"
                    }`}
                    title={bestSellerOnly ? "Đang lọc: Bán chạy" : "Chỉ hiện sản phẩm bán chạy"}
                >
                    <Flame className={`h-4 w-4 ${bestSellerOnly ? "fill-current" : ""}`} />
                    Bán chạy
                </button>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Bộ lọc đang áp dụng:</span>
                    {searchTerm && (
                        <FilterChip
                            label={`Tìm: "${searchTerm}"`}
                            onRemove={clearSearch}
                        />
                    )}
                    {categoryId && (
                        <FilterChip
                            label={
                                categories.find((c) => c.id === categoryId)?.name ??
                                "Danh mục"
                            }
                            onRemove={() => onCategoryChange("")}
                        />
                    )}
                    {sortIndex !== 0 && (
                        <FilterChip
                            label={SORT_OPTIONS[sortIndex].label}
                            onRemove={() => onSortChange(0)}
                        />
                    )}
                    {bestSellerOnly && (
                        <FilterChip
                            label="Chỉ bán chạy 🔥"
                            onRemove={() => onBestSellerChange(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ── Sub-component: filter chip ──────────────────────────────────
function FilterChip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {label}
            <button
                onClick={onRemove}
                className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100"
                aria-label={`Xóa bộ lọc: ${label}`}
            >
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}
