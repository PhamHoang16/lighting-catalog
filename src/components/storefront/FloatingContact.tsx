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
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white overflow-hidden shadow-lg shadow-blue-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 sm:h-14 sm:w-14"
                aria-label="Chat Zalo"
            >
                {/* Zalo SVG icon */}
                <img 
                    src="/Icon_of_Zalo.svg" 
                    alt="Zalo" 
                    className="h-full w-full object-contain p-1.5 sm:p-2"
                />

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
