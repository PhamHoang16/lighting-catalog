"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeaderSearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const params = new URLSearchParams();
            params.set("q", query.trim());
            router.push(`/danh-muc?${params.toString()}`);
            setQuery("");
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-sm lg:max-w-md items-center mx-4 lg:mx-8"
            title="Tìm kiếm sản phẩm"
        >
            <div className="relative w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm, danh mục..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50/50 py-2 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-amber-100 hover:text-amber-600 active:scale-95"
                    aria-label="Tìm kiếm"
                >
                    <Search className="h-4 w-4" />
                </button>
            </div>
        </form>
    );
}
