"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { Product } from "@/lib/types/database";
import ProductCard from "@/components/storefront/ProductCard";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useCallback } from "react";

export default function HotProducts({ products }: { products: Product[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 2,
        breakpoints: {
            "(min-width: 768px)": { slidesToScroll: 3 },
            "(min-width: 1024px)": { slidesToScroll: 5 }
        }
    });

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!products || products.length === 0) return null;

    return (
        <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 relative">
            <div className="rounded-2xl bg-gradient-to-br from-red-50/80 via-white to-orange-50/80 p-4 sm:p-6 shadow-sm border border-orange-100 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-red-400/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20">
                            <Zap className="h-5 w-5 fill-current animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 sm:text-2xl">
                            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                                Sản phẩm Siêu Hot
                            </span>
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={scrollPrev}
                            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95"
                            aria-label="Next"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex backface-hidden -ml-4 touch-pan-y">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-0 pl-4 flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%]"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
