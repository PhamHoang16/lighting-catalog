"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart/CartContext";

interface ProductCardCartButtonProps {
    product: Omit<CartItem, "quantity">;
}

export default function ProductCardCartButton({ product }: ProductCardCartButtonProps) {
    const { addItem } = useCart();
    const [justAdded, setJustAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (justAdded) return; // Tránh bấm liên tục khi đang hiện hiệu ứng

        addItem(product);
        setJustAdded(true);
        
        // Trở lại trạng thái bình thường sau 1.5s
        setTimeout(() => setJustAdded(false), 1500);
    };

    return (
        <button
            onClick={handleAdd}
            className={`flex shrink-0 items-center justify-center rounded-full p-2 transition-all duration-300 shadow-sm active:scale-95 ${
                justAdded 
                ? "bg-emerald-500 text-white scale-110" 
                : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white hover:scale-110"
            }`}
            aria-label={`Thêm ${product.name} vào giỏ`}
        >
            {justAdded ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5 animate-in zoom-in duration-200" />
            ) : (
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
        </button>
    );
}
