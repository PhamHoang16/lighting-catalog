import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Star, Zap, Info, FileText, Sparkles } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import ProductGallery from "@/components/storefront/product/ProductGallery";
import SpecsTable from "@/components/storefront/product/SpecsTable";
import ProductActions from "@/components/storefront/product/ProductActions";
import ProductCard from "@/components/storefront/ProductCard";
import type { ProductWithRelations, Product } from "@/lib/types/database";

export async function generateStaticParams() {
    const supabase = createStaticClient();
    const { data: products } = await supabase
        .from("products")
        .select("slug")
        .order("created_at", { ascending: false })
        .limit(20);

    return (products ?? []).map((product) => ({
        slug: product.slug,
    }));
}

// ── Formatter VND ───────────────────────────────────────────────
const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

// ── Fetch ───────────────────────────────────────────────────────
async function getProduct(slug: string) {
    const supabase = createStaticClient();
    const { data } = await supabase
        .from("products")
        .select("*, categories(name, slug), brands(name, logo_url)")
        .eq("slug", slug)
        .single();

    return data as ProductWithRelations | null;
}

async function getRelatedProducts(currentId: string, categoryId: string) {
    const supabase = createStaticClient();
    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", currentId)
        .order("created_at", { ascending: false })
        .limit(5);

    return (data ?? []) as Product[];
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

    const relatedProducts = await getRelatedProducts(product.id, product.category_id);

    const hasVariants = !!(product.variants && product.variants.options.length > 0);
    const hasSpecs = product.specs && product.specs.length > 0;
    const hasDescription =
        product.description &&
        product.description.trim() !== "" &&
        product.description !== "<p><br></p>";

    // Price display: show range if variants exist
    let priceDisplay: string;
    if (hasVariants) {
        const prices = product.variants!.variants
            .map((v) => v.price)
            .filter((p) => p > 0);
        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            priceDisplay = min === max
                ? vndFormat.format(min)
                : `${vndFormat.format(min)} - ${vndFormat.format(max)}`;
        } else {
            priceDisplay = product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";
        }
    } else {
        priceDisplay = product.price > 0 ? vndFormat.format(product.price) : "Liên hệ";
    }

    const categoryName = product.categories?.name ?? null;
    const categorySlug = product.categories?.slug ?? null;
    const brandName = product.brands?.name ?? null;
    const brandLogo = product.brands?.logo_url ?? null;

    return (
        <div className="bg-white">
            {/* ── Breadcrumbs ────────────────────────────────────── */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
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
            <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:py-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
                    {/* ── Left: Gallery ─────────────────────────────── */}
                    <div>
                        <ProductGallery
                            mainImage={product.image_url}
                            gallery={product.gallery}
                            productName={product.name}
                        />
                    </div>

                    {/* ── Right: Info ───────────────────────────────── */}
                    <div>
                        {/* Category + Brand */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            {categoryName && (
                                <Link
                                    href={`/danh-muc/${categorySlug}`}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                                >
                                    <Zap className="h-3 w-3" />
                                    {categoryName}
                                </Link>
                            )}
                            {brandName && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    {brandLogo && (
                                        <img src={brandLogo} alt={brandName} className="h-3.5 w-3.5 rounded-full object-contain" />
                                    )}
                                    {brandName}
                                </span>
                            )}
                        </div>

                        {/* Product name */}
                        <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl lg:text-[28px]">
                            {product.name}
                        </h1>

                        {/* Rating placeholder */}
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

                        {/* ── Base Price block (hidden if has variants, shown by ProductActions) ─── */}
                        {!hasVariants && (
                            <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 px-5 py-4">
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className={`text-3xl font-extrabold tracking-tight ${product.price > 0 ? "text-amber-600" : "text-gray-500"}`}
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
                        )}

                        {/* Price range hint for variants */}
                        {hasVariants && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
                                <p className="text-sm font-semibold text-amber-700">
                                    Giá từ: {priceDisplay}
                                </p>
                                <p className="text-xs text-amber-600/60">
                                    Chọn phân loại bên dưới để xem giá chính xác
                                </p>
                            </div>
                        )}

                        {/* ── Trust badges ────────────────────────────── */}
                        <div className="mt-5 flex flex-wrap gap-2">
                            <TrustChip icon={ShieldCheck} text="Bảo hành chính hãng" />
                            <TrustChip icon={Truck} text="Giao hàng toàn quốc" />
                            <TrustChip icon={Clock} text="Phản hồi trong 30 phút" />
                        </div>

                        {/* ── Divider ─────────────────────────────────── */}
                        <div className="my-6 h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />

                        {/* ── Actions (Variant selector + Quantity + CTA) ── */}
                        <ProductActions
                            product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                image_url: product.image_url,
                                price: product.price,
                                variants: product.variants,
                            }}
                        />

                        {/* ── Quick specs ─────────────────────────────── */}
                        {/* {hasSpecs && product.specs!.length > 0 && (
                            <div className="mt-8 rounded-2xl border border-gray-100/60 bg-white p-5 sm:p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-900">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                        <Zap className="h-3.5 w-3.5" />
                                    </span>
                                    Thông số nổi bật
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {product.specs!.slice(0, 6).map((spec, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex flex-col justify-center rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-amber-200 hover:ring-1 hover:ring-amber-200/50"
                                        >
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600/70 transition-colors group-hover:text-amber-600">
                                                {spec.name}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                                                {spec.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>

            {/* ── Detail Sections ────────────────────────────────── */}
            {(hasSpecs || hasDescription) && (
                <div className="border-t border-gray-100 bg-gray-50/50 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-40 -mt-40 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-96 w-96 rounded-full bg-orange-400/5 blur-3xl pointer-events-none" />

                    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 relative z-10">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                            {/* Left: Specs (Sticky on desktop) */}
                            {hasSpecs && (
                                <div className="lg:col-span-5 xl:col-span-4">
                                    <div className="sticky top-24">
                                        <SpecsTable specs={product.specs!} />
                                    </div>
                                </div>
                            )}

                            {/* Right: Description */}
                            {hasDescription && (
                                <div className={hasSpecs ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12"}>
                                    <div className="group/desc rounded-2xl border border-gray-200/60 bg-white shadow-sm relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:border-amber-200/60">

                                        <div className="relative border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-4">
                                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm border border-gray-100/80">
                                                <FileText className="h-[22px] w-[22px]" />
                                                <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-amber-400 animate-pulse" />
                                            </div>
                                            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight uppercase">
                                                Thông tin chi tiết
                                            </h3>
                                        </div>

                                        <div
                                            className="relative z-10 p-6 sm:p-8 bg-white/80 backdrop-blur-sm prose prose-sm sm:prose-base max-w-none prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:font-medium prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-strong:text-gray-900 prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-gray-100 prose-table:w-full prose-table:overflow-x-auto prose-table:text-sm prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-gray-100 break-words leading-relaxed text-gray-600"
                                            dangerouslySetInnerHTML={{
                                                __html: product.description!.replace(/&nbsp;/g, ' '),
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Thay đổi kiểu prose trong render ───────────────── */}
            <style>{`
                .prose-admin img {
                    border-radius: 0.75rem;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                }
                .prose-admin a { color: #d97706; text-decoration: none; }
                .prose-admin a:hover { text-decoration: underline; }
            `}</style>

            {/* ── Related Products ───────────────────────────────── */}
            {relatedProducts.length > 0 && (
                <div className="border-t border-gray-100 bg-white py-12 lg:py-16">
                    <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
                            <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 md:text-3xl">
                                Sản phẩm tương tự
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
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
                    <a
                        href="#product-actions"
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
                    >
                        MUA NGAY
                    </a>
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
