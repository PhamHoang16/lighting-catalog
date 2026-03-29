"use client";

import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export default function FloatingContact() {
    return (
        <div className="floating-contact-container fixed bottom-6 right-4 z-40 flex flex-col items-center gap-3 sm:right-6 lg:z-[45]">
            {/* Zalo */}
            <a
                href={siteConfig.contact.zaloHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 sm:h-14 sm:w-14"
                aria-label="Chat Zalo"
            >
                {/* Zalo SVG icon */}
                <svg
                    viewBox="0 0 48 48"
                    fill="currentColor"
                    className="h-6 w-6 sm:h-7 sm:w-7"
                >
                    <path d="M24 2C11.85 2 2 11.21 2 22.6c0 6.51 3.18 12.3 8.15 16.1-.17 1.82-.87 4.55-2.54 6.4 0 0 4.88-.35 8.75-3.56 2.38.73 4.93 1.13 7.64 1.13C36.15 42.67 46 33.46 46 22.06S36.15 2 24 2zm-7.82 27.56H9.64c-.65 0-.92-.39-.92-.88V27.4l8.24-11.62H10.4a.8.8 0 01-.8-.8v-1.32a.8.8 0 01.8-.8h6.85c.65 0 .92.39.92.88v1.28l-8.24 11.62h7.25a.8.8 0 01.8.8v1.32a.8.8 0 01-.8.8zm6.47.1c-.55 0-1-.45-1-1V13.76c0-.55.45-1 1-1h1.3c.55 0 1 .45 1 1v14.9c0 .55-.45 1-1 1h-1.3zm14.07-1.34a6.39 6.39 0 01-4.55 1.93 6.39 6.39 0 01-4.55-1.93 6.87 6.87 0 01-1.87-4.8 6.87 6.87 0 011.87-4.8 6.39 6.39 0 014.55-1.93 6.39 6.39 0 014.55 1.93 6.87 6.87 0 011.87 4.8 6.87 6.87 0 01-1.87 4.8zm-1.95-8.07a3.67 3.67 0 00-2.6-1.08 3.67 3.67 0 00-2.6 1.08 3.96 3.96 0 00-1.09 2.87c0 1.14.38 2.1 1.09 2.87a3.67 3.67 0 002.6 1.08 3.67 3.67 0 002.6-1.08 3.96 3.96 0 001.09-2.87c0-1.14-.38-2.1-1.09-2.87z" />
                </svg>

                {/* Tooltip */}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Chat Zalo
                </span>

                {/* Pulse ring */}
                <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
            </a>

            {/* Phone */}
            <a
                href={siteConfig.contact.hotlineHref}
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-amber-500/40 sm:h-14 sm:w-14"
                aria-label="Gọi hotline"
            >
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" />

                {/* Tooltip */}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {siteConfig.contact.hotline}
                </span>

                {/* Pulse ring */}
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-20" />
            </a>
        </div>
    );
}
