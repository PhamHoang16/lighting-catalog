"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Filter,
    X,
    FolderOpen,
    Layers,
    ChevronDown,
    ChevronRight,
    Tag,
    Package,
    Loader2,
    DollarSign
} from "lucide-react";
import { buildCategoryTree } from "@/lib/utils";
import type { Category, CategoryWithChildren, Brand } from "@/lib/types/database";

interface CategorySidebarProps {
    categories: Category[];
    brands: Brand[];
    activeSlug?: string | null;
}

export default function CategorySidebar({
    categories,
    brands,
    activeSlug,
}: CategorySidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const tree = buildCategoryTree(categories);
    const selectedBrands = searchParams.get("brands")?.split(",").filter(Boolean) ?? [];

    // Price filter state
    const parsedMinPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const parsedMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const [minPriceInput, setMinPriceInput] = useState(parsedMinPrice ? parsedMinPrice.toString() : "");
    const [maxPriceInput, setMaxPriceInput] = useState(parsedMaxPrice ? parsedMaxPrice.toString() : "");

    const PRICE_RANGES = [
        { id: "range-0", label: "Dưới 1 triệu", min: undefined, max: 1000000 },
        { id: "range-1", label: "1 triệu - 3 triệu", min: 1000000, max: 3000000 },
        { id: "range-2", label: "3 triệu - 5 triệu", min: 3000000, max: 5000000 },
        { id: "range-3", label: "5 triệu - 10 triệu", min: 5000000, max: 10000000 },
        { id: "range-4", label: "Trên 10 triệu", min: 10000000, max: undefined },
    ];

    // Toggle brand filter
    function toggleBrand(brandSlug: string) {
        const current = new Set(selectedBrands);
        if (current.has(brandSlug)) {
            current.delete(brandSlug);
        } else {
            current.add(brandSlug);
        }

        const params = new URLSearchParams(searchParams.toString());
        if (current.size > 0) {
            params.set("brands", Array.from(current).join(","));
        } else {
            params.delete("brands");
        }

        const basePath = activeSlug ? `/danh-muc/${activeSlug}` : "/danh-muc";
        startTransition(() => {
            router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
        });
    }

    function applyPriceRange(min?: number, max?: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (min !== undefined) {
            params.set("minPrice", min.toString());
            setMinPriceInput(min.toString());
        } else {
            params.delete("minPrice");
            setMinPriceInput("");
        }

        if (max !== undefined) {
            params.set("maxPrice", max.toString());
            setMaxPriceInput(max.toString());
        } else {
            params.delete("maxPrice");
            setMaxPriceInput("");
        }

        const basePath = activeSlug ? `/danh-muc/${activeSlug}` : "/danh-muc";
        startTransition(() => {
            router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
        });
    }

    function applyCustomPrice() {
        const min = minPriceInput ? Number(minPriceInput) : undefined;
        const max = maxPriceInput ? Number(maxPriceInput) : undefined;
        applyPriceRange(min, max);
    }

    // Clear all filters
    function clearFilters() {
        const basePath = activeSlug ? `/danh-muc/${activeSlug}` : "/danh-muc";
        setMinPriceInput("");
        setMaxPriceInput("");
        startTransition(() => {
            router.push(basePath);
        });
    }

    const hasActiveFilters = selectedBrands.length > 0 || parsedMinPrice !== undefined || parsedMaxPrice !== undefined;
    let activeFilterCount = selectedBrands.length;
    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) activeFilterCount++;

    const content = (
        <div className="space-y-6">
            {/* Categories */}
            <nav className="space-y-1">
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

                {tree.map((cat) => (
                    <CategoryNode
                        key={cat.id}
                        category={cat}
                        activeSlug={activeSlug}
                        onNavigate={() => setMobileOpen(false)}
                    />
                ))}
            </nav>

            {/* Brand Filters */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Thương hiệu
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>

                {brands.length === 0 ? (
                    <p className="px-3 py-2 text-sm italic text-gray-400">
                        Chưa có thương hiệu nào
                    </p>
                ) : (
                    <div className="space-y-1.5">
                        {brands.map((brand) => {
                            const isSelected = selectedBrands.includes(brand.slug);
                            return (
                                <button
                                    key={brand.id}
                                    onClick={() => toggleBrand(brand.slug)}
                                    disabled={isPending}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all disabled:opacity-50 disabled:cursor-wait ${isSelected
                                        ? "bg-amber-50 text-amber-900"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${isSelected
                                            ? "border-amber-500 bg-amber-500"
                                            : "border-gray-300 bg-white"
                                            }`}
                                    >
                                        {isSelected && !isPending && (
                                            <svg
                                                className="h-2.5 w-2.5 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={4}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                        {isSelected && isPending && (
                                            <Loader2 className="h-2.5 w-2.5 text-white animate-spin" />
                                        )}
                                    </div>

                                    {/* Logo */}
                                    {brand.logo_url ? (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white">
                                            <img
                                                src={brand.logo_url}
                                                alt={brand.name}
                                                className="h-full w-full object-contain p-0.5"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
                                            <Package className="h-4 w-4 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Name */}
                                    <span className="flex-1 font-medium">
                                        {brand.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Price Filters */}
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Mức giá
                    </p>
                </div>
                <div className="space-y-1.5">
                    {PRICE_RANGES.map((range) => {
                        const isSelected = parsedMinPrice === range.min && parsedMaxPrice === range.max;
                        return (
                            <button
                                key={range.id}
                                onClick={() => applyPriceRange(range.min, range.max)}
                                disabled={isPending}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all disabled:opacity-50 disabled:cursor-wait ${isSelected
                                        ? "bg-amber-50 text-amber-900 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300 bg-white"
                                        }`}
                                >
                                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                </div>
                                <span>{range.label}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Tối thiểu"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <input
                        type="number"
                        placeholder="Tối đa"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>
                <button
                    onClick={applyCustomPrice}
                    disabled={isPending}
                    className="mt-2 w-full rounded-md bg-white border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 transition-all active:scale-95"
                >
                    Áp dụng giá
                </button>
            </div>
        </div>
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
                    Bộ lọc
                    {activeFilterCount > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Mobile Drawer ────────────────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-900">
                                Bộ lọc
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

// ── Category node with expandable children ──────────────────────
function CategoryNode({
    category,
    activeSlug,
    onNavigate,
}: {
    category: CategoryWithChildren;
    activeSlug?: string | null;
    onNavigate: () => void;
}) {
    const hasChildren = category.children.length > 0;
    const isActive = activeSlug === category.slug;
    const hasActiveChild = hasChildren && category.children.some(
        (c) => c.slug === activeSlug || c.children.some((cc) => cc.slug === activeSlug)
    );
    const [expanded, setExpanded] = useState(hasActiveChild || isActive);

    return (
        <div>
            <div className="flex items-center">
                <Link
                    href={`/danh-muc/${category.slug}`}
                    onClick={onNavigate}
                    className={`flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                        ? "bg-amber-50 text-amber-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                >
                    <span className={isActive ? "text-amber-500" : "text-gray-400"}>
                        <FolderOpen className="h-4 w-4" />
                    </span>
                    {category.name}
                </Link>

                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="ml-4 border-l border-gray-100 pl-2">
                    {category.children.map((child) => (
                        <CategoryNode
                            key={child.id}
                            category={child}
                            activeSlug={activeSlug}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
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
