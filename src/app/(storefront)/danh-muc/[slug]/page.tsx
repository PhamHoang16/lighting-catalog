import type { Metadata } from "next";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Danh mục: ${slug}`,
        description: `Xem sản phẩm trong danh mục ${slug}.`,
    };
}

export default async function CategoryDetailPage({
    params,
}: CategoryPageProps) {
    const { slug } = await params;

    return (
        <section className="px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900">Danh mục: {slug}</h1>
            <p className="mt-2 text-gray-600">
                Danh sách sản phẩm theo danh mục — sẽ được xây dựng.
            </p>
        </section>
    );
}
