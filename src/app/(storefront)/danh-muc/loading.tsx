import ProductCardSkeleton from "@/components/storefront/category/ProductCardSkeleton";
import SidebarSkeleton from "@/components/storefront/category/SidebarSkeleton";

export default function CategoryLoading() {
    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* ── Hero Header Skeleton ────────────────────────────────── */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                <div className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
                    <div className="mb-6 h-6 w-48 bg-gray-100 rounded animate-pulse" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4">
                        <div className="flex-1 space-y-3">
                            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-full max-w-2xl bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="shrink-0 h-10 w-32 bg-gray-50 rounded-xl border border-gray-200 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* ── Main content (Filters & Grid) ────────────────────────── */}
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    
                    {/* Desktop Sidebar Skeleton */}
                    <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
                        <SidebarSkeleton />
                    </div>
                    
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Toolbar Skeleton */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 animate-pulse">
                            <div className="h-5 w-48 bg-gray-100 rounded" />
                            <div className="h-10 w-40 bg-gray-100 rounded-lg" />
                        </div>

                        {/* Product Grid Skeleton */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[...Array(12)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
