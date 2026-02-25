import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Danh mục sản phẩm",
    description: "Khám phá danh mục sản phẩm chiếu sáng đa dạng.",
};

export default function CategoriesPage() {
    return (
        <section className="px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
            <p className="mt-2 text-gray-600">Trang danh mục — sẽ được xây dựng.</p>
        </section>
    );
}
