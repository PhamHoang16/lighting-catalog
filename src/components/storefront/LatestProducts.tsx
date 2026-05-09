import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { getLatestProducts } from "@/lib/db/queries/products";

export default async function LatestProducts() {
    const products = await getLatestProducts(8);

    if (products.length === 0) return null;

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
                {/* Section header */}
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
                            Mới nhất
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Sản phẩm mới cập nhật
                        </h2>
                    </div>
                    <Link
                        href="/danh-muc"
                        className="hidden items-center gap-1.5 text-sm font-semibold text-amber-600 transition-colors hover:text-amber-700 sm:flex"
                    >
                        Xem tất cả
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Product grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            categoryName={product.categories?.name ?? undefined}
                        />
                    ))}
                </div>

                {/* Mobile "Xem tất cả" */}
                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href="/danh-muc"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600"
                    >
                        Xem tất cả sản phẩm
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
