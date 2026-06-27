"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import LeadFormModal from "@/components/storefront/LeadFormModal";

export default function FloatingContact() {
    const [formOpen, setFormOpen] = useState(false);

    return (
        <div className="floating-contact-container fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3 sm:right-6 lg:z-[45]">
            {/* Zalo */}
            <a
                href={siteConfig.contact.zaloHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#006AF5] shadow-lg shadow-blue-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 sm:h-14 sm:w-14"
                aria-label="Chat Zalo"
            >
                {/* Zalo SVG icon */}
                <Image
                    src="/Icon_of_Zalo.svg"
                    alt="Zalo"
                    width={56}
                    height={56}
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

            {/* CTA "viên thuốc" — mở form đăng ký tư vấn */}
            <button
                onClick={() => setFormOpen(true)}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 py-3 pl-4 pr-5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.03] hover:from-amber-600 hover:to-orange-700 hover:shadow-xl"
                aria-label="Đăng ký tư vấn"
            >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="whitespace-nowrap">Nhận tư vấn</span>
            </button>

            <LeadFormModal open={formOpen} onClose={() => setFormOpen(false)} />
        </div>
    );
}
