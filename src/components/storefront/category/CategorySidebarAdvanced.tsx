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
    DollarSign,
    ArrowRight
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

    // Accordion states
    const [openCategory, setOpenCategory] = useState(true);
    const [openBrand, setOpenBrand] = useState(true);
    const [openPrice, setOpenPrice] = useState(true);
    const [openSort, setOpenSort] = useState(true);

    const tree = buildCategoryTree(categories);
    const selectedBrands = searchParams.get("brands")?.split(",").filter(Boolean) ?? [];
    const currentSort = searchParams.get("sort") || "featured";

    const SORT_OPTIONS = [
        { value: "featured", label: "Nổi bật" },
        { value: "newest", label: "Mới nhất" },
        { value: "oldest", label: "Cũ nhất" },
        { value: "price-asc", label: "Giá tăng dần" },
        { value: "price-desc", label: "Giá giảm dần" },
    ];

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
        params.set("page", "1");

        const basePath = activeSlug ? `/danh-muc/${activeSlug}` : "/danh-muc";
        startTransition(() => {
            router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
        });
    }

    function applySort(sortValue: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (sortValue === "featured") {
            params.delete("sort");
        } else {
            params.set("sort", sortValue);
        }
        params.set("page", "1");
        
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

    const hasActiveFilters = selectedBrands.length > 0 || parsedMinPrice !== undefined || parsedMaxPrice !== undefined || currentSort !== "featured";
    let activeFilterCount = selectedBrands.length;
    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) activeFilterCount++;
    if (currentSort !== "featured") activeFilterCount++;

    const content = (
        <div className="space-y-6">
            {/* Sort Filters (Mobile Only in drawer) */}
            <div className="relative lg:hidden">
                <button 
                    onClick={() => setOpenSort(!openSort)}
                    className="group flex w-full items-center justify-between pb-2 text-[15px] font-black uppercase tracking-wider text-gray-900"
                >
                    <div className="flex items-center gap-2 relative">
                        Sắp xếp
                        {currentSort !== "featured" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 absolute -right-3 top-1"></span>
                        )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${openSort ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
                </button>
                
                <div className={`transition-all duration-300 overflow-hidden ${openSort ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-2">
                        {SORT_OPTIONS.map((opt) => {
                            const isSelected = currentSort === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => applySort(opt.value)}
                                    disabled={isPending}
                                    className={`flex items-center justify-center rounded-xl border px-2 py-2.5 text-xs text-center font-bold tracking-tight transition-all disabled:opacity-50 disabled:cursor-wait ${isSelected
                                            ? "border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50/50 text-amber-900 shadow-sm"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-amber-300/50 hover:bg-gray-50/50 hover:text-gray-900 shadow-sm"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent lg:hidden" />

            {/* Categories */}
            <div className="relative">
                <button 
                    onClick={() => setOpenCategory(!openCategory)}
                    className="group flex w-full items-center justify-between pb-2 text-[15px] font-black uppercase tracking-wider text-gray-900"
                >
                    <div className="flex items-center gap-2 relative">
                        Danh Mục
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 absolute -right-3 top-1"></span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${openCategory ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
                </button>
                
                <div className={`transition-all duration-300 overflow-hidden ${openCategory ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <nav className="space-y-1.5 px-0.5">
                        <SidebarLink
                            href="/danh-muc"
                            label="Tất cả sản phẩm"
                            icon={<Layers className="h-4 w-4" />}
                            active={!activeSlug}
                            onClick={() => setMobileOpen(false)}
                        />
                        {tree.map((cat) => (
                            <CategoryNode
                                key={cat.id}
                                category={cat}
                                activeSlug={activeSlug}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        ))}
                    </nav>
                </div>
            </div>
            
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Brand Filters */}
            <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                    <button 
                        onClick={() => setOpenBrand(!openBrand)}
                        className="flex flex-1 items-center justify-between text-sm font-bold uppercase tracking-wider text-gray-900"
                    >
                        Thương hiệu
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openBrand ? "rotate-180" : ""}`} />
                    </button>
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${openBrand ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    {brands.length === 0 ? (
                        <p className="py-2 text-sm italic text-gray-400">
                            Chưa có dữ liệu
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 pt-1 pb-1">
                            {brands.map((brand) => {
                                const isSelected = selectedBrands.includes(brand.slug);
                                return (
                                    <button
                                        key={brand.id}
                                        onClick={() => toggleBrand(brand.slug)}
                                        disabled={isPending}
                                        className={`group relative flex w-full flex-row lg:flex-row items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all disabled:opacity-50 disabled:cursor-wait ${isSelected
                                            ? "border-amber-400 bg-amber-50/50 shadow-[0_2px_10px_-4px_rgba(245,158,11,0.2)]"
                                            : "border-gray-200 bg-white hover:border-amber-300/50 hover:bg-gray-50/50 hover:shadow-sm"
                                            }`}
                                    >
                                        {/* Logo or Icon */}
                                        {brand.logo_url ? (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100/50 bg-white p-0.5">
                                                <img
                                                    src={brand.logo_url}
                                                    alt={brand.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-100 bg-gray-50/80">
                                                <Package className="h-4 w-4 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Name */}
                                        <span className={`flex-1 font-semibold transition-colors ${isSelected ? "text-amber-900" : "text-gray-600 group-hover:text-gray-900"}`}>
                                            {brand.name}
                                        </span>

                                        {/* Indicator Dot */}
                                        {isSelected ? (
                                             <div className="flex shrink-0 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                        ) : (
                                             <div className="flex shrink-0 h-1.5 w-1.5 rounded-full bg-gray-200 group-hover:bg-amber-300 transition-colors"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Price Filters */}
            <div className="py-5">
                <button 
                    onClick={() => setOpenPrice(!openPrice)}
                    className="group mb-2 flex w-full items-center justify-between text-[15px] font-black uppercase tracking-wider text-gray-900"
                >
                    Mức giá
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${openPrice ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
                </button>
                
                <div className={`transition-all duration-300 overflow-hidden ${openPrice ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {PRICE_RANGES.map((range) => {
                            const isSelected = parsedMinPrice === range.min && parsedMaxPrice === range.max;
                            return (
                                <button
                                    key={range.id}
                                    onClick={() => applyPriceRange(range.min, range.max)}
                                    disabled={isPending}
                                    className={`flex items-center justify-center rounded-xl border px-2 py-2.5 text-xs text-center font-bold tracking-tight transition-all disabled:opacity-50 disabled:cursor-wait ${isSelected
                                            ? "border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50/50 text-amber-900 shadow-sm"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-amber-300/50 hover:bg-gray-50/50 hover:text-gray-900 shadow-sm"
                                        }`}
                                >
                                    {range.label}
                                </button>
                            );
                        })}
                    </div>
                        
                    {/* Custom Price Inputs */}
                        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                            <span className="text-xs font-semibold uppercase text-gray-500 mb-1">Hoặc nhập khoảng giá</span>
                            <div className="flex items-center justify-between gap-2">
                                <div className="relative w-full">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPriceInput}
                                        onChange={(e) => setMinPriceInput(e.target.value)}
                                        className="w-full rounded-lg border-none bg-white py-2 pl-3 pr-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-500"
                                    />
                                </div>
                                <span className="text-gray-400 font-bold">-</span>
                                <div className="relative w-full">
                                    <input
                                        type="number"
                                        placeholder="Tối đa"
                                        value={maxPriceInput}
                                        onChange={(e) => setMaxPriceInput(e.target.value)}
                                        className="w-full rounded-lg border-none bg-white py-2 pl-3 pr-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={applyCustomPrice}
                                disabled={isPending || (!minPriceInput && !maxPriceInput)}
                                className="mt-2 w-full rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Áp dụng <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* ── Desktop Sidebar ──────────────────────────────── */}
            <aside className="hidden lg:block relative z-20">
                <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] ring-1 ring-gray-950/5 overflow-hidden">
                    {/* Decorative subtle background gradient on top of desktop sidebar */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none -z-10" />
                    
                    {content}
                </div>
            </aside>

            {/* ── Mobile Filter Button (Circular Icon FAB) ── */}
            <div className="lg:hidden fixed bottom-5 left-4 sm:left-6 z-[55]">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur-md text-gray-700 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] border border-gray-200/80 ring-1 ring-black/5 transition-all hover:bg-gray-50 active:scale-95"
                    aria-label="Lọc và Sắp xếp"
                >
                    <Filter className="h-[22px] w-[22px] text-gray-600" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white border-2 border-white shadow-sm">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Mobile Drawer (Bottom Sheet) ──────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden flex flex-col justify-end">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative flex flex-col max-h-[85vh] h-[85vh] w-full rounded-t-[2rem] bg-white shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
                        {/* Drawer Header */}
                        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-black text-gray-900">
                                Lọc & Sắp xếp
                            </h3>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2">
                            {content}
                        </div>

                        {/* Drawer Footer (Sticky) */}
                        <div className="shrink-0 border-t border-gray-100 bg-white p-4 pb-safe flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                            <button
                                onClick={() => {
                                    clearFilters();
                                    setMobileOpen(false);
                                }}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
                            >
                                Đặt lại
                            </button>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-gray-800 active:scale-[0.98]"
                            >
                                Xem kết quả {hasActiveFilters ? `(${activeFilterCount})` : ""}
                            </button>
                        </div>
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
            <div className="flex items-center relative group">
                {/* Visual Active Line */}
                {isActive && (
                    <div className="absolute -left-1.5 md:-left-3 top-2 bottom-2 w-1.5 rounded-r-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                )}
                <Link
                    href={`/danh-muc/${category.slug}`}
                    onClick={onNavigate}
                    className={`flex flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-[600] transition-all duration-200 ${isActive
                        ? "bg-gradient-to-r from-amber-50 to-orange-50/30 text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-amber-500/20"
                        : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm"
                        }`}
                >
                    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ${isActive ? 'bg-white ring-1 ring-amber-100 text-amber-500' : 'bg-white border border-gray-100 text-gray-400 group-hover:border-gray-200 group-hover:text-amber-500 transition-colors'}`}>
                        {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="h-7 w-7 object-cover rounded-lg" />
                        ) : (
                            <span className="flex h-7 w-7 items-center justify-center">
                                <FolderOpen className="h-4 w-4" />
                            </span>
                        )}
                    </span>
                    <span className="flex-1 truncate leading-tight">{category.name}</span>
                </Link>

                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`absolute right-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all ${expanded ? 'bg-gray-100/80 text-gray-900' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Children container with animated height */}
            <div className={`overflow-hidden transition-all duration-300 ${hasChildren && expanded ? 'max-h-[1000px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                <div className="ml-[22px] border-l-2 border-dashed border-gray-200/60 pl-3 relative">
                    {category.children.map((child) => (
                        <div key={child.id} className="relative mt-1">
                            {/* Branch connector */}
                            {expanded && <div className="absolute -left-3 top-4 w-2.5 h-[2px] bg-gray-200/60 dashed" />}
                            <CategoryNode
                                category={child}
                                activeSlug={activeSlug}
                                onNavigate={onNavigate}
                            />
                        </div>
                    ))}
                </div>
            </div>
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
        <div className="flex items-center relative group mb-1.5">
            <Link
                href={href}
                onClick={onClick}
                className={`flex flex-1 items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-[600] transition-all duration-200 ${active
                    ? "bg-gradient-to-r from-amber-50 to-orange-50/30 text-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-amber-500/20"
                    : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm"
                    }`}
            >
                <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm ${active ? 'bg-white ring-1 ring-amber-100 text-amber-500' : 'bg-white border border-gray-100 text-gray-400 group-hover:border-gray-200 group-hover:text-amber-500 transition-colors'}`}>
                    <span className="flex h-7 w-7 items-center justify-center">
                        {icon}
                    </span>
                </span>
                <span className="flex-1 truncate leading-tight">{label}</span>
            </Link>
        </div>
    );
}
