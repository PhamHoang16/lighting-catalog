"use client";

import { ArrowUpDown } from "lucide-react";

export type SortOption = "featured" | "newest" | "oldest" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "featured", label: "Nổi bật" },
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "price-asc", label: "Giá tăng dần" },
    { value: "price-desc", label: "Giá giảm dần" },
];

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide hidden sm:inline-block">
                Sắp xếp theo
            </span>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as SortOption)}
                    className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-10 text-[14px] font-semibold text-gray-800 shadow-sm transition-all hover:bg-gray-100 hover:border-gray-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
