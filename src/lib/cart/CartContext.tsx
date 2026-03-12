"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";

// ── Cart item type ──────────────────────────────────────────────
export interface CartItem {
    id: string;          // product id
    name: string;
    slug: string;
    image_url: string | null;
    price: number;       // unit price (variant price or base price)
    quantity: number;
    variant_label?: string;    // e.g. "4W / Đen nhám"
    selected_options?: Record<string, string>; // e.g. { "Công suất": "4W", "Màu": "Đen" }
}

// Unique key for cart item: product_id + variant_label
function cartItemKey(item: { id: string; variant_label?: string }) {
    return `${item.id}::${item.variant_label ?? "default"}`;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string, variantLabel?: string) => void;
    updateQuantity: (id: string, quantity: number, variantLabel?: string) => void;
    clearCart: () => void;
    isInCart: (id: string, variantLabel?: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "lighting-cart";

// ── Provider ────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // defer state update to avoid "Call setState synchronously in effect" warning
                setTimeout(() => setItems(JSON.parse(stored)), 0);
            }
        } catch {
            // ignore
        }
        setTimeout(() => setLoaded(true), 0);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, loaded]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const addItem = useCallback(
        (product: Omit<CartItem, "quantity">, quantity = 1) => {
            setItems((prev) => {
                const key = cartItemKey(product);
                const existing = prev.find((i) => cartItemKey(i) === key);
                if (existing) {
                    return prev.map((i) =>
                        cartItemKey(i) === key
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    );
                }
                return [...prev, { ...product, quantity }];
            });
        },
        []
    );

    const removeItem = useCallback((id: string, variantLabel?: string) => {
        const key = `${id}::${variantLabel ?? "default"}`;
        setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number, variantLabel?: string) => {
        const key = `${id}::${variantLabel ?? "default"}`;
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => cartItemKey(i) !== key));
        } else {
            setItems((prev) =>
                prev.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i))
            );
        }
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback(
        (id: string, variantLabel?: string) => {
            const key = `${id}::${variantLabel ?? "default"}`;
            return items.some((i) => cartItemKey(i) === key);
        },
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                totalAmount,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ── Hook ────────────────────────────────────────────────────────
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
}
