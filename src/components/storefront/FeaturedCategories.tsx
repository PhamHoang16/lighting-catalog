import Link from "next/link";
import { ArrowRight, Grid3X3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// ── Accent colors cho mỗi card ─────────────────────────────────
const CARD_ACCENTS = [
    { bg: "bg-amber-50", icon: "text-amber-500", hover: "hover:border-amber-300" },
    { bg: "bg-blue-50", icon: "text-blue-500", hover: "hover:border-blue-300" },
    { bg: "bg-emerald-50", icon: "text-emerald-500", hover: "hover:border-emerald-300" },
    { bg: "bg-violet-50", icon: "text-violet-500", hover: "hover:border-violet-300" },
];

async function getFeaturedCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("created_at", { ascending: true })
        .limit(4);
    return data ?? [];
}

export default async function FeaturedCategories() {
    const categories = await getFeaturedCategories();

    if (categories.length === 0) return null;

    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
                {/* Section header */}
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
                            Danh mục
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Khám phá theo danh mục
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

                {/* Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categories.map((cat, idx) => {
                        const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                        return (
                            <Link
                                key={cat.id}
                                href={`/danh-muc/${cat.slug}`}
                                className={`group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${accent.hover}`}
                            >
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}
                                >
                                    <Grid3X3 className={`h-6 w-6 ${accent.icon}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                                        {cat.name}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-gray-400">Xem sản phẩm →</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile "Xem tất cả" */}
                <div className="mt-6 text-center sm:hidden">
                    <Link
                        href="/danh-muc"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600"
                    >
                        Xem tất cả danh mục
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
