import type { ReactNode } from "react";
import StorefrontHeader from "@/components/storefront/Header";
import StorefrontFooter from "@/components/storefront/Footer";
import FloatingContact from "@/components/storefront/FloatingContact";
import { CartProvider } from "@/lib/cart/CartContext";

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <CartProvider>
            <div className="flex min-h-screen flex-col bg-gray-50">
                <StorefrontHeader />
                <main className="flex-1">{children}</main>
                <StorefrontFooter />
                <FloatingContact />
            </div>
        </CartProvider>
    );
}
