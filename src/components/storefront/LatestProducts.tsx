import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/storefront/ProductCard";
import type { ProductWithCategory } from "@/lib/types/database";

async function getLatestProducts() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(8);
    return (data as ProductWithCategory[]) ?? [];
}

export default async function LatestProducts() {
    const products = await getLatestProducts();

    if (products.length === 0) return null;

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
                            categoryName={product.categories?.name}
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
