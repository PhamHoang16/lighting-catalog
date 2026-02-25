import type { Metadata } from "next";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Sản phẩm: ${slug}`,
        description: `Thông tin chi tiết sản phẩm ${slug}. Nhận báo giá ngay.`,
    };
}

export default async function ProductDetailPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    return (
        <section className="px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900">Sản phẩm: {slug}</h1>
            <p className="mt-2 text-gray-600">
                Chi tiết sản phẩm — sẽ được xây dựng.
            </p>
        </section>
    );
}
