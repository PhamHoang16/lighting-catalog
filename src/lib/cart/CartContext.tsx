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
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    price: number;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "lighting-quote-cart";

// ── Provider ────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setItems(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
        setLoaded(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, loaded]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const addItem = useCallback(
        (product: Omit<CartItem, "quantity">, quantity = 1) => {
            setItems((prev) => {
                const existing = prev.find((i) => i.id === product.id);
                if (existing) {
                    return prev.map((i) =>
                        i.id === product.id
                            ? { ...i, quantity: i.quantity + quantity }
                            : i
                    );
                }
                return [...prev, { ...product, quantity }];
            });
        },
        []
    );

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.id !== id));
        } else {
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity } : i))
            );
        }
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback(
        (id: string) => items.some((i) => i.id === id),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
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
