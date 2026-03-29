"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Product } from "@/lib/types/database";
import ProductCard from "@/components/storefront/ProductCard";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useCallback } from "react";
import { clsx } from "clsx";

export default function HotProducts({ products }: { products: Product[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: "start",
            loop: true,
            slidesToScroll: 1, // Smooth automatic scrolling
            breakpoints: {
                "(min-width: 768px)": { slidesToScroll: 1 },
                "(min-width: 1024px)": { slidesToScroll: 1 }
            }
        },
        [
            Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true
            })
        ]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!products || products.length === 0) return null;

    return (
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 relative group">
            <div className="rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-orange-50/80 p-4 sm:p-6 lg:p-8 shadow-sm border border-orange-100 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-red-100/50 pb-5 relative z-10">
                    <div className="flex items-center gap-3">
                        {/* Icon Box */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30">
                            <Zap className="h-6 w-6 fill-current animate-pulse" />
                        </div>
                        {/* Label Badge */}
                        <div className="relative">
                            <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl text-red-600">
                                <span className="inline-block rounded-xl bg-white px-5 py-2 shadow-sm ring-1 ring-red-500/20">
                                    Sản phẩm bán chạy
                                </span>
                            </h2>
                            {/* Refined Accent Underline */}
                        </div>
                    </div>
                    {/* View All link */}
                    <a href="/danh-muc" className="text-sm font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition-colors hidden sm:block">
                        Xem tất cả &rarr;
                    </a>
                </div>

                {/* Carousel */}
                <div className="overflow-hidden relative z-10 -mx-2 px-2" ref={emblaRef}>
                    <div className="flex backface-hidden -ml-4 touch-pan-y">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                /* Mobile: flex-[0_0_45%] => ~2.2 items on screen. 
                                   SM: ~3 items (35%)
                                   MD: 4 items (25%)
                                   LG: 5 items (20%) */
                                className="min-w-0 pl-4 flex-[0_0_45%] sm:flex-[0_0_35%] md:flex-[0_0_25%] lg:flex-[0_0_20%]"
                            >
                                <ProductCard
                                    product={product}
                                    categoryName={(product as any).categoryName}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows (Hidden & shown on hover for MD+) */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-2 top-[55%] -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 text-orange-600 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-orange-50 hover:scale-110 active:scale-95 z-20 hidden md:flex opacity-0 group-hover:opacity-100"
                    aria-label="Previous"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-2 top-[55%] -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 text-orange-600 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-orange-50 hover:scale-110 active:scale-95 z-20 hidden md:flex opacity-0 group-hover:opacity-100"
                    aria-label="Next"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
        </section>
    );
}
