"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MobileSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/danh-muc?q=${encodeURIComponent(query)}`);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600 active:scale-95"
                aria-label="Tìm kiếm"
            >
                <Search className="h-5 w-5" />
            </button>

            {/* Full-width Search Overlay */}
            {isOpen && (
                <div className="absolute inset-0 z-[60] flex items-center bg-white px-4 animate-in fade-in slide-in-from-top-4 duration-200">
                    <form onSubmit={handleSearch} className="flex h-12 w-full items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        
                        <div className="relative flex flex-1 items-center">
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Bạn đang tìm gì?..."
                                className="h-10 w-full rounded-xl border-none bg-gray-100 px-4 text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex items-center justify-center text-[15px] font-bold text-amber-600 active:scale-95"
                        >
                            Tìm
                        </button>
                    </form>
                </div>
            )}

            {/* Backdrop for closing */}
            {isOpen && (
                <div 
                    className="fixed inset-0 top-16 z-[55] bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
