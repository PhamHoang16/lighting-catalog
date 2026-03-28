import type { ReactNode } from "react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import FloatingContact from "@/components/storefront/FloatingContact";
import ScrollToTop from "@/components/storefront/ScrollToTop";
import { Suspense } from "react";
import { CartProvider } from "@/lib/cart/CartContext";
import { ToastProvider } from "@/components/ui/Toast";

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Suspense fallback={null}>
                <ScrollToTop />
            </Suspense>
            <StorefrontHeader />
            <main className="flex-1">{children}</main>
            <StorefrontFooter />
            <FloatingContact />
        </div>
    );
}
