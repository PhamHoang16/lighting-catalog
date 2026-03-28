"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * ScrollToTop Component
 * Ensures the window scrolls to top on every navigation/URL change.
 * This fixes the issue where the header is hidden because the scroll position 
 * is maintained from the previous page.
 */
export default function ScrollToTop() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // We use requestAnimationFrame to ensure the scroll happens after the new content is painted
        const scrollInstance = requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant", // We use "instant" to avoid smooth scrolling visual bugs during route transitions
            });
        });

        return () => cancelAnimationFrame(scrollInstance);
    }, [pathname, searchParams]);

    return null;
}
