import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Star, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import ProductGallery from "@/components/storefront/product/ProductGallery";
import SpecsTable from "@/components/storefront/product/SpecsTable";
import ProductActions from "@/components/storefront/product/ProductActions";
import type { ProductWithCategory } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

// ── Fetch ───────────────────────────────────────────────────────
async function getProduct(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .single();

    return data as
        | (ProductWithCategory & {
            categories: { name: string; slug: string } | null;
        })
        | null;
}

// ── SEO ─────────────────────────────────────────────────────────
interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) return { title: "Sản phẩm không tồn tại" };

    const priceText =
        product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";

    return {
        title: product.name,
        description: `${product.name} - ${priceText}. ${siteConfig.description}`,
    };
}

// ── Page ────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) notFound();

    const hasSpecs = product.specs && product.specs.length > 0;
    const hasDescription =
        product.description &&
        product.description.trim() !== "" &&
        product.description !== "<p><br></p>";

    const priceDisplay =
        product.price > 0 ? vndFormat.format(product.price) : "Liên hệ báo giá";

    const categoryName = product.categories?.name ?? null;
    const categorySlug = product.categories?.slug ?? null;

    return (
        <div className="bg-white">
            {/* ── Breadcrumbs ────────────────────────────────────── */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                    <Breadcrumbs
                        items={[
                            { label: "Sản phẩm", href: "/danh-muc" },
                            ...(categoryName && categorySlug
                                ? [{ label: categoryName, href: `/danh-muc/${categorySlug}` }]
                                : []),
                            { label: product.name },
                        ]}
                    />
                </div>
            </div>

            {/* ── Main Content ───────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                    {/* ── Left: Gallery — 7 col ─────────────────────── */}
                    <div>
                        <ProductGallery
                            mainImage={product.image_url}
                            gallery={product.gallery}
                            productName={product.name}
                        />
                    </div>

                    {/* ── Right: Info — 5 col ───────────────────────── */}
                    <div>
                        {/* Category */}
                        {categoryName && (
                            <Link
                                href={`/danh-muc/${categorySlug}`}
                                className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                            >
                                <Zap className="h-3 w-3" />
                                {categoryName}
                            </Link>
                        )}

                        {/* Product name */}
                        <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-[28px]">
                            {product.name}
                        </h1>

                        {/* Rating placeholder — adds social proof feel */}
                        <div className="mt-2 flex items-center gap-1.5">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-amber-400 text-amber-400"
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">
                                Sản phẩm chất lượng cao
                            </span>
                        </div>

                        {/* ── Price block ─────────────────────────────── */}
                        <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 px-5 py-4">
                            <div className="flex items-baseline gap-2">
                                <span
                                    className={`text-3xl font-extrabold tracking-tight ${product.price > 0 ? "text-amber-600" : "text-gray-500"
                                        }`}
                                >
                                    {priceDisplay}
                                </span>
                                {product.price > 0 && (
                                    <span className="text-sm text-gray-400">/ sản phẩm</span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-amber-600/70">
                                Giá tốt nhất — Liên hệ để nhận chiết khấu dự án
                            </p>
                        </div>

                        {/* ── Trust badges ────────────────────────────── */}
                        <div className="mt-5 flex flex-wrap gap-2">
                            <TrustChip icon={ShieldCheck} text="Bảo hành chính hãng" />
                            <TrustChip icon={Truck} text="Giao hàng toàn quốc" />
                            <TrustChip icon={Clock} text="Phản hồi trong 30 phút" />
                        </div>

                        {/* ── Divider ─────────────────────────────────── */}
                        <div className="my-6 h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />

                        {/* ── Actions (Quantity + CTA + Add to Cart) ──── */}
                        <ProductActions
                            product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                image_url: product.image_url,
                                price: product.price,
                            }}
                        />

                        {/* ── Quick specs ─────────────────────────────── */}
                        {hasSpecs && product.specs!.length > 0 && (
                            <div className="mt-6">
                                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Thông số nổi bật
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {product.specs!.slice(0, 6).map((spec, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5"
                                        >
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                                {spec.name}
                                            </p>
                                            <p className="mt-0.5 text-sm font-bold text-gray-900">
                                                {spec.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail Sections ────────────────────────────────── */}
            {(hasSpecs || hasDescription) && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                            {/* Specs — 2/5 */}
                            {hasSpecs && (
                                <div className="lg:col-span-2">
                                    <SpecsTable specs={product.specs!} />
                                </div>
                            )}

                            {/* Description — 3/5 */}
                            {hasDescription && (
                                <div
                                    className={hasSpecs ? "lg:col-span-3" : "lg:col-span-5"}
                                >
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Mô tả sản phẩm
                                        </h2>
                                        <div
                                            className="prose prose-sm prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-amber-600 prose-strong:text-gray-900"
                                            dangerouslySetInnerHTML={{
                                                __html: product.description!,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile Sticky CTA ──────────────────────────────── */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-md lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-gray-500">{product.name}</p>
                        <p className="text-lg font-extrabold text-amber-600">
                            {priceDisplay}
                        </p>
                    </div>
                    <ProductActions
                        product={{
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            image_url: product.image_url,
                            price: product.price,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Trust chip ──────────────────────────────────────────────────
function TrustChip({
    icon: Icon,
    text,
}: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
}) {
    return (
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1.5">
            <Icon className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">{text}</span>
        </div>
    );
}
