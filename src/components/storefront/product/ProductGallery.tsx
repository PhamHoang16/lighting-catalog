"use client";

import { useState, useCallback } from "react";
import {
    ImageOff,
    ZoomIn,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

interface ProductGalleryProps {
    mainImage: string | null;
    gallery: string[] | null;
    productName: string;
}

export default function ProductGallery({
    mainImage,
    gallery,
    productName,
}: ProductGalleryProps) {
    const allImages: string[] = [];
    if (mainImage) allImages.push(mainImage);
    if (gallery) allImages.push(...gallery);

    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

    const activeImage = allImages[activeIndex] ?? null;

    const handleImgError = useCallback((index: number) => {
        setImgErrors((prev) => new Set(prev).add(index));
    }, []);

    const goTo = useCallback(
        (dir: -1 | 1) => {
            setActiveIndex((prev) => {
                const next = prev + dir;
                if (next < 0) return allImages.length - 1;
                if (next >= allImages.length) return 0;
                return next;
            });
        },
        [allImages.length]
    );

    // ── No images ─────────────────────────────────────────────
    if (allImages.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <ImageOff className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-400">Chưa có ảnh</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {/* ── Main image ───────────────────────────────────── */}
                <div
                    className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    onClick={() => setLightboxOpen(true)}
                >
                    <div className="aspect-[4/3]">
                        {activeImage && !imgErrors.has(activeIndex) ? (
                            <img
                                src={activeImage}
                                alt={productName}
                                className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-50">
                                <ImageOff className="h-16 w-16 text-gray-300" />
                            </div>
                        )}
                    </div>

                    {/* Zoom hint */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Phóng to
                    </div>

                    {/* Nav arrows on main image */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goTo(-1);
                                }}
                                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goTo(1);
                                }}
                                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-600 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Image counter */}
                    {allImages.length > 1 && (
                        <div className="absolute left-3 bottom-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {activeIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* ── Thumbnails ───────────────────────────────────── */}
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {allImages.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${idx === activeIndex
                                    ? "border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/10"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                {!imgErrors.has(idx) ? (
                                    <img
                                        src={url}
                                        alt={`${productName} ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                        onError={() => handleImgError(idx)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                        <ImageOff className="h-4 w-4 text-gray-300" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Lightbox ─────────────────────────────────────── */}
            {lightboxOpen && activeImage && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Close */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Image */}
                    <div className="relative max-h-[85vh] max-w-5xl px-4">
                        <img
                            src={activeImage}
                            alt={productName}
                            className="max-h-[85vh] rounded-lg object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Prev/Next arrows */}
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goTo(-1);
                                }}
                                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goTo(1);
                                }}
                                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                            {allImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveIndex(idx);
                                    }}
                                    className={`h-2 rounded-full transition-all ${idx === activeIndex
                                        ? "w-6 bg-amber-500"
                                        : "w-2 bg-white/40 hover:bg-white/70"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
