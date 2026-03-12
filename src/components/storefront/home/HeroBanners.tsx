"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Banner } from "@/lib/types/database";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

export default function HeroBanners({ banners }: { banners: Banner[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: true }),
    ]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    if (!banners || banners.length === 0) {
        return (
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 mt-4">
                <div className="aspect-[21/9] md:aspect-[3/1] w-full rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 font-medium">Đang tải Banner...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 mt-4">
            <div className="relative overflow-hidden rounded-2xl shadow-sm" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {banners.map((banner) => (
                        <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                            {banner.link_url ? (
                                <Link href={banner.link_url} className="block relative aspect-[21/9] md:aspect-[3/1] w-full">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title ?? "Banner"}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </Link>
                            ) : (
                                <div className="relative aspect-[21/9] md:aspect-[3/1] w-full">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title ?? "Banner"}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-2 text-gray-800 backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-md hidden md:block"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-2 text-gray-800 backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-md hidden md:block"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
