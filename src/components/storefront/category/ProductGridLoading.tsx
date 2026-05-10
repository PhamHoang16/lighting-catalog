import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductGridLoading() {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Toolbar Loading - hidden on mobile */}
            <div className="mb-4 hidden sm:flex flex-row items-center justify-between gap-2 border-b border-gray-100 pb-3 animate-pulse">
                <div className="h-5 w-48 bg-gray-100 rounded" />
                <div className="h-10 w-40 bg-gray-100 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(12)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
