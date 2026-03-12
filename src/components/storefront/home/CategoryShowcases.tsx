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

                {/* ── Left Sidebar: Category Info & Banner ──────────────── */}
                <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:w-[280px] xl:w-[320px] shrink-0">
                    {/* Background Image (if any) with Overlay */}
                    {data.category.image_url && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={data.category.image_url}
                                alt={data.category.name}
                                className="h-full w-full object-cover opacity-20 mix-blend-luminosity duration-700 hover:scale-105 transition-transform"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col flex-1">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-3xl leading-tight">
                                {data.category.name}
                            </h2>
                            <div className="mt-4 h-1 w-12 rounded-full bg-amber-500" />
                        </div>

                        {/* Subcategories */}
                        {data.subcategories && data.subcategories.length > 0 && (
                            <ul className="mb-8 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-wrap lg:flex-nowrap">
                                {data.subcategories.map((sub) => (
                                    <li key={sub.id}>
                                        <Link
                                            href={`/danh-muc/${sub.slug}`}
                                            className="group flex items-center gap-2 whitespace-nowrap lg:whitespace-normal rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            <span className="hidden h-1.5 w-1.5 rounded-full bg-amber-500 transition-transform group-hover:scale-150 lg:block" />
                                            {sub.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-auto pt-4 flex">
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
