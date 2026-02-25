import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ShieldCheck, Truck, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import ProductGallery from "@/components/storefront/product/ProductGallery";
import SpecsTable from "@/components/storefront/product/SpecsTable";
import QuoteRequestModal from "@/components/storefront/product/QuoteRequestModal";
import type { ProductWithCategory } from "@/lib/types/database";

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

// ── Fetch product by slug ───────────────────────────────────────
async function getProduct(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .single();

    return data as (ProductWithCategory & { categories: { name: string; slug: string } | null }) | null;
}

// ── SEO Metadata ────────────────────────────────────────────────
interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return { title: "Sản phẩm không tồn tại" };
    }

    const priceText =
        product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";

    return {
        title: product.name,
        description: `${product.name} - ${priceText}. ${siteConfig.description}`,
    };
}

// ── Page Component ──────────────────────────────────────────────
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
                                ? [
                                    {
                                        label: categoryName,
                                        href: `/danh-muc/${categorySlug}`,
                                    },
                                ]
                                : []),
                            { label: product.name },
                        ]}
                    />
                </div>
            </div>

            {/* ── Main Content ───────────────────────────────────── */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* ── Left: Gallery ──────────────────────────────── */}
                    <ProductGallery
                        mainImage={product.image_url}
                        gallery={product.gallery}
                        productName={product.name}
                    />

                    {/* ── Right: Product Info ────────────────────────── */}
                    <div className="flex flex-col">
                        {/* Category badge */}
                        {categoryName && (
                            <Link
                                href={`/danh-muc/${categorySlug}`}
                                className="mb-3 inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                            >
                                {categoryName}
                            </Link>
                        )}

                        {/* Product name */}
                        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline gap-2">
                            <span
                                className={`text-3xl font-extrabold ${product.price > 0
                                        ? "text-amber-600"
                                        : "text-gray-500"
                                    }`}
                            >
                                {priceDisplay}
                            </span>
                            {product.price > 0 && (
                                <span className="text-sm text-gray-400">/ sản phẩm</span>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="my-6 h-px bg-gray-200" />

                        {/* Trust badges */}
                        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <TrustBadge
                                icon={ShieldCheck}
                                text="Bảo hành chính hãng"
                            />
                            <TrustBadge icon={Truck} text="Giao hàng toàn quốc" />
                            <TrustBadge icon={Clock} text="Tư vấn 24/7" />
                        </div>

                        {/* ── CTA Button ──────────────────────────────── */}
                        <QuoteRequestModal
                            productId={product.id}
                            productName={product.name}
                            trigger={
                                <button className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-2xl hover:shadow-amber-500/30 active:scale-[0.98]">
                                    <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" />
                                    NHẬN BÁO GIÁ & TƯ VẤN
                                </button>
                            }
                        />

                        <p className="mt-3 text-center text-xs text-gray-400">
                            Hoặc gọi trực tiếp:{" "}
                            <a
                                href={siteConfig.contact.hotlineHref}
                                className="font-semibold text-amber-600 hover:underline"
                            >
                                {siteConfig.contact.hotline}
                            </a>
                        </p>

                        {/* ── Quick specs (nếu có, hiển thị 3 spec đầu) ── */}
                        {hasSpecs && product.specs!.length > 0 && (
                            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Thông số nổi bật
                                </p>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {product.specs!.slice(0, 4).map((spec, idx) => (
                                        <div key={idx}>
                                            <dt className="text-xs text-gray-400">{spec.name}</dt>
                                            <dd className="text-sm font-semibold text-gray-900">
                                                {spec.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
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
                            {/* Specs table — 2/5 */}
                            {hasSpecs && (
                                <div className="lg:col-span-2">
                                    <SpecsTable specs={product.specs!} />
                                </div>
                            )}

                            {/* Description — 3/5 */}
                            {hasDescription && (
                                <div className={hasSpecs ? "lg:col-span-3" : "lg:col-span-5"}>
                                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
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

            {/* ── Bottom CTA bar (sticky on mobile) ──────────────── */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 truncate">{product.name}</p>
                        <p className="text-lg font-bold text-amber-600">{priceDisplay}</p>
                    </div>
                    <QuoteRequestModal
                        productId={product.id}
                        productName={product.name}
                        trigger={
                            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25">
                                <Phone className="h-4 w-4" />
                                Báo giá
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

// ── Sub-component ───────────────────────────────────────────────
function TrustBadge({
    icon: Icon,
    text,
}: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
}) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
            <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-xs font-medium text-gray-600">{text}</span>
        </div>
    );
}
