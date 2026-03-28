import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import type { Product, Category } from "@/lib/types/database";

export interface CategoryShowcaseData {
    category: Category;
    subcategories: Category[];
    products: Product[];
}

export default function CategoryShowcaseBlock({ data }: { data: CategoryShowcaseData }) {
    if (!data.products || data.products.length === 0) return null;

    return (
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 mb-8">
            <div className="flex flex-col lg:flex-row overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">

                {/* ── Left Sidebar / Top Mobile Header: Category Info & Banner ──────────────── */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 lg:p-6 lg:w-[280px] xl:w-[320px] shrink-0 border-b border-white/5 lg:border-none">
                    {/* Background Image (if any) with Overlay */}
                    {data.category.image_url && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={data.category.image_url}
                                alt={data.category.name}
                                className="h-full w-full object-cover opacity-20 mix-blend-luminosity duration-700 hover:scale-105 transition-transform"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-br from-slate-950 via-slate-900/40 to-transparent" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col flex-1">
                        <div className="flex items-center justify-between lg:block mb-4 lg:mb-6">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl uppercase italic leading-none">
                                    {data.category.name}
                                </h2>
                                <div className="mt-2 h-1 w-8 lg:w-12 rounded-full bg-amber-500" />
                            </div>
                            
                            {/* Mobile only "See All" Link - Discrete style */}
                            <Link
                                href={`/danh-muc/${data.category.slug}`}
                                className="lg:hidden text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/30 rounded-full px-3 py-1.5 hover:bg-amber-500 hover:text-white transition-all"
                            >
                                Xem tất cả
                            </Link>
                        </div>

                        {/* Subcategories - Compact & Scrollable on Mobile */}
                        {data.subcategories && data.subcategories.length > 0 && (
                            <ul className="mb-4 lg:mb-8 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                                {data.subcategories.map((sub) => (
                                    <li key={sub.id} className="shrink-0">
                                        <Link
                                            href={`/danh-muc/${sub.slug}`}
                                            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 lg:bg-transparent lg:px-3 lg:py-1.5 lg:text-sm"
                                        >
                                            <span className="hidden h-1.5 w-1.5 rounded-full bg-amber-500 transition-transform group-hover:scale-150 lg:block" />
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="hidden lg:flex mt-auto pt-4">
                            <Link
                                href={`/danh-muc/${data.category.slug}`}
                                className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95"
                            >
                                Xem tất cả
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Right Content: Product Grid ────────────────────────── */}
                <div className="flex-1 p-4 sm:p-5 lg:p-6 bg-white">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {data.products.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
