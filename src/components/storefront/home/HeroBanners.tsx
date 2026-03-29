"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Banner } from "@/lib/types/database";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";

export default function HeroBanners({ banners }: { banners: Banner[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", duration: 40 }, [
        Autoplay({ delay: 6000, stopOnInteraction: false }),
    ]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onInit = useCallback((emblaApi: any) => {
        setScrollSnaps(emblaApi.scrollSnapList());
    }, []);

    const onSelect = useCallback((emblaApi: any) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onInit(emblaApi);
        onSelect(emblaApi);
        emblaApi.on("reInit", onInit).on("reInit", onSelect).on("select", onSelect);
    }, [emblaApi, onInit, onSelect]);

    if (!banners || banners.length === 0) {
        return (
            <div className="w-full">
                <div className="aspect-[21/9] lg:aspect-[3/1] w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black animate-pulse flex items-center justify-center">
                    <span className="text-white/50 font-medium tracking-widest uppercase text-sm md:text-base">Đang tải Banner...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden bg-black group" ref={emblaRef}>
            {/* Cinematic Wrapper */}
            <div className="flex touch-pan-y">
                {banners.map((banner, index) => {
                    const isActive = index === selectedIndex;
                    return (
                        <div
                            key={banner.id}
                            className="min-w-0 flex-[0_0_100%] relative"
                        >
                            <div className="relative w-full aspect-[21/9] lg:aspect-[3/1] overflow-hidden bg-gray-950">
                                {banner.link_url ? (
                                    <Link href={banner.link_url} className="absolute inset-0 block w-full h-full cursor-pointer">
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title ?? "Banner"}
                                            className={clsx(
                                                "absolute inset-0 h-full w-full object-cover object-center transition-[transform,opacity] ease-out",
                                                isActive ? "scale-105 opacity-100 duration-[15000ms]" : "scale-100 opacity-60 duration-500"
                                            )}
                                            loading={index === 0 ? "eager" : "lazy"}
                                        />
                                        {/* Cinematic Overlay: Vignette + Linear Fade for text */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_110%)] pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    </Link>
                                ) : (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title ?? "Banner"}
                                            className={clsx(
                                                "absolute inset-0 h-full w-full object-cover object-center transition-[transform,opacity] ease-out",
                                                isActive ? "scale-105 opacity-100 duration-[15000ms]" : "scale-100 opacity-60 duration-500"
                                            )}
                                            loading={index === 0 ? "eager" : "lazy"}
                                        />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_110%)] pointer-events-none" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                    </div>
                                )}

                                {/* Floating Cinematic Title (Fade & Slide UP) */}
                                {banner.title && (
                                    <div className={clsx(
                                        "absolute bottom-[10%] md:bottom-[15%] left-[5%] md:left-[8%] max-w-[85%] md:max-w-3xl pointer-events-none transition-all duration-[1200ms] transform",
                                        isActive ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0"
                                    )}>
                                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight leading-[1.15] uppercase">
                                            {banner.title}
                                        </h2>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Premium Hidden Arrows (Hover to reveal) */}
            <button
                onClick={scrollPrev}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-2 md:p-3 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
            >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <button
                onClick={scrollNext}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-2 md:p-3 text-white backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-0"
            >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>

            {/* Cinematic Pagination Lines */}
            {scrollSnaps.length > 1 && (
                <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={clsx(
                                "h-1 rounded-full overflow-hidden relative transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                index === selectedIndex
                                    ? "w-12 md:w-20 bg-white/30 drop-shadow-lg"
                                    : "w-2 md:w-3 bg-white/40 hover:bg-white/80"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {/* Inner active fill */}
                            <div
                                className={clsx(
                                    "absolute inset-y-0 left-0 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-500",
                                    index === selectedIndex ? "w-full" : "w-0"
                                )}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
