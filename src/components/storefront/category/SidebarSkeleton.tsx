import { ChevronDown, Layers, Package, Tag, ArrowRight } from "lucide-react";

export default function SidebarSkeleton() {
    return (
        <aside className="space-y-6 animate-pulse p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
            {/* Decoration blob */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none -z-10" />

            {/* Categories Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <ChevronDown className="h-4 w-4 text-gray-200" />
                </div>
                
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
                            <div className="h-7 w-7 bg-gray-100 rounded-lg shrink-0" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Brands Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <ChevronDown className="h-4 w-4 text-gray-200" />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                            <div className="h-8 w-8 bg-gray-100 rounded-md shrink-0" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Price Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                    <div className="h-5 w-24 bg-gray-200 rounded" />
                    <ChevronDown className="h-4 w-4 text-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-xl border border-gray-50" />
                    ))}
                </div>
                
                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                    <div className="h-3 w-3/4 bg-gray-200 rounded mb-1" />
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-full bg-white rounded-lg border border-gray-100" />
                        <div className="h-9 w-full bg-white rounded-lg border border-gray-100" />
                    </div>
                    <div className="mt-2 h-10 w-full bg-gray-200 rounded-lg" />
                </div>
            </div>
        </aside>
    );
}
