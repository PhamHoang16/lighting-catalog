"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export default function QuantitySelector({
    value,
    onChange,
    min = 1,
    max = 999,
    disabled = false,
}: QuantitySelectorProps) {
    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                className="flex h-10 w-10 items-center justify-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Minus className="h-4 w-4" />
            </button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n) && n >= min && n <= max) onChange(n);
                }}
                disabled={disabled}
                className="h-10 w-14 border border-gray-300 bg-white text-center text-sm font-semibold text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                className="flex h-10 w-10 items-center justify-center rounded-r-xl border border-l-0 border-gray-300 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
