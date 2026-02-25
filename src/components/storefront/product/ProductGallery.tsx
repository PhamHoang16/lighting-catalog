"use client";

import { useState } from "react";
import { ImageOff, ZoomIn } from "lucide-react";

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
    // Combine all images
    const allImages: string[] = [];
    if (mainImage) allImages.push(mainImage);
    if (gallery) allImages.push(...gallery);

    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

    const activeImage = allImages[activeIndex] ?? null;

    function handleImgError(index: number) {
        setImgErrors((prev) => new Set(prev).add(index));
    }

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
                    <div className="aspect-square">
                        {activeImage && !imgErrors.has(activeIndex) ? (
                            <img
                                src={activeImage}
                                alt={productName}
                                className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
                </div>

                {/* ── Thumbnails ───────────────────────────────────── */}
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {allImages.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${idx === activeIndex
                                        ? "border-amber-500 shadow-md shadow-amber-500/20"
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
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="relative max-h-[90vh] max-w-4xl">
                        <img
                            src={activeImage}
                            alt={productName}
                            className="max-h-[90vh] rounded-lg object-contain"
                        />
                        {/* Navigation dots */}
                        {allImages.length > 1 && (
                            <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
                                {allImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveIndex(idx);
                                        }}
                                        className={`h-2 w-2 rounded-full transition-all ${idx === activeIndex
                                                ? "w-6 bg-amber-500"
                                                : "bg-white/50 hover:bg-white/80"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
