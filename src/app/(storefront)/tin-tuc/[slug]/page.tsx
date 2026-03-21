import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, ArrowLeft, Newspaper } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { formatDate } from "@/lib/utils";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import type { Post } from "@/lib/types/database";

export const revalidate = 60;

// ── Fetch ───────────────────────────────────────────────────────
async function getPost(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    return data as Post | null;
}

// ── SEO ─────────────────────────────────────────────────────────
interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) return { title: "Bài viết không tồn tại" };

    return {
        title: `${post.title} | ${siteConfig.name}`,
        description: post.summary || `${post.title} – Tin tức từ ${siteConfig.name}`,
        openGraph: {
            title: post.title,
            description: post.summary || undefined,
            images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : undefined,
        },
    };
}

// ── Page ────────────────────────────────────────────────────────
export default async function PostDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) notFound();

    const hasContent =
        post.content &&
        post.content.trim() !== "" &&
        post.content !== "<p><br></p>";

    return (
        <div className="bg-white min-h-screen">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
                    <Breadcrumbs
                        items={[
                            { label: "Tin tức", href: "/tin-tuc" },
                            { label: post.title },
                        ]}
                    />
                </div>
            </div>

            {/* Article */}
            <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
                {/* Back link */}
                <Link
                    href="/tin-tuc"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại Tin tức
                </Link>

                {/* Meta */}
                <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.created_at)}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                    {post.title}
                </h1>

                {/* Summary */}
                {post.summary && (
                    <p className="mt-5 text-lg leading-relaxed text-gray-500 border-l-4 border-amber-400 pl-4 italic">
                        {post.summary}
                    </p>
                )}

                {/* Thumbnail */}
                {post.thumbnail_url && (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                        <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                {hasContent && (
                    <div
                        className="mt-10 prose prose-lg max-w-none
                            prose-slate
                            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                            prose-p:leading-relaxed prose-p:text-gray-600
                            prose-a:font-medium prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:font-bold prose-strong:text-gray-900
                            prose-img:rounded-2xl prose-img:shadow-sm prose-img:border prose-img:border-gray-100
                            prose-blockquote:border-l-amber-400 prose-blockquote:text-gray-600 prose-blockquote:not-italic
                            prose-ul:marker:text-amber-400
                            prose-ol:marker:text-amber-600
                            prose-table:w-full prose-table:overflow-x-auto prose-table:text-sm
                            prose-th:bg-gray-50 prose-th:p-3
                            prose-td:p-3 prose-td:border-t prose-td:border-gray-100
                            break-words [&_*]:break-words"
                        dangerouslySetInnerHTML={{
                            __html: post.content!,
                        }}
                    />
                )}

                {/* Divider */}
                <div className="my-12 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* Footer CTA */}
                <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
                    <Newspaper className="h-8 w-8 text-amber-400" />
                    <p className="text-lg font-bold text-gray-900">
                        Bạn cần tư vấn chi tiết hơn?
                    </p>
                    <p className="text-sm text-gray-600 max-w-md">
                        Liên hệ với đội ngũ chuyên gia chiếu sáng của chúng tôi để được hỗ trợ tốt nhất.
                    </p>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/lien-he"
                            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-lg"
                        >
                            Liên hệ ngay
                        </Link>
                        <Link
                            href="/tin-tuc"
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Xem thêm tin tức
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
