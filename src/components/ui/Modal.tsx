"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    /** Max width class, default "max-w-md" */
    maxWidth?: string;
    /** Default true. Set to false if you want to prevent closing by clicking outside. */
    closeOnClickOutside?: boolean;
}

export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidth = "max-w-md",
    closeOnClickOutside = true,
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape + lock body scroll
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) {
            document.addEventListener("keydown", handleKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:items-center"
            onClick={(e) => {
                if (closeOnClickOutside && e.target === overlayRef.current) onClose();
            }}
        >
            <div
                className={cn(
                    "my-8 w-full max-h-[calc(100vh-4rem)] flex flex-col rounded-xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200",
                    maxWidth
                )}
            >
                {/* Header — fixed */}
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="overflow-y-auto px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
