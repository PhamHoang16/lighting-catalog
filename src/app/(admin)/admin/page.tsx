import { Suspense } from "react";
import {
    Package,
    FolderOpen,
    FileText,
    Bell,
    Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/dashboard/StatCard";
import RecentQuotes from "@/components/admin/dashboard/RecentQuotes";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import type { QuoteRequest } from "@/lib/types/database";

// ── Data fetching (Server-side) ─────────────────────────────────
async function getDashboardStats() {
    const supabase = await createClient();

    const [categoriesRes, productsRes, quotesRes, newQuotesRes, recentRes] =
        await Promise.all([
            supabase
                .from("categories")
                .select("*", { count: "exact", head: true }),
            supabase
                .from("products")
                .select("*", { count: "exact", head: true }),
            supabase
                .from("quote_requests")
                .select("*", { count: "exact", head: true }),
            supabase
                .from("quote_requests")
                .select("*", { count: "exact", head: true })
                .eq("status", "new"),
            supabase
                .from("quote_requests")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(5),
        ]);

    return {
        categoryCount: categoriesRes.count ?? 0,
        productCount: productsRes.count ?? 0,
        quoteCount: quotesRes.count ?? 0,
        newQuoteCount: newQuotesRes.count ?? 0,
        recentQuotes: (recentRes.data as QuoteRequest[]) ?? [],
    };
}

// ── Skeleton component ──────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* KPI skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="h-4 w-24 rounded bg-gray-200" />
                                <div className="h-8 w-16 rounded bg-gray-200" />
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Content skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
                    <div className="h-5 w-48 rounded bg-gray-200" />
                    <div className="mt-6 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 rounded bg-gray-200" />
                                    <div className="h-3 w-48 rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
                    <div className="h-5 w-32 rounded bg-gray-200" />
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-lg bg-gray-100" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Dashboard content (async) ───────────────────────────────────
async function DashboardContent() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            {/* ── KPI Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Danh mục"
                    value={stats.categoryCount}
                    icon={FolderOpen}
                    color="emerald"
                />
                <StatCard
                    title="Sản phẩm"
                    value={stats.productCount}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title="Yêu cầu báo giá"
                    value={stats.quoteCount}
                    icon={FileText}
                    color="amber"
                />
                <StatCard
                    title="Báo giá MỚI"
                    value={stats.newQuoteCount}
                    icon={Bell}
                    color="red"
                />
            </div>

            {/* ── Content Row ────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Hoạt động gần đây — 2/3 width */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-5 text-base font-semibold text-gray-900">
                        Yêu cầu báo giá gần đây
                    </h2>
                    <RecentQuotes quotes={stats.recentQuotes} />
                </div>

                {/* Quick Actions — 1/3 width */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-base font-semibold text-gray-900">
                        Thao tác nhanh
                    </h2>
                    <QuickActions />
                </div>
            </div>
        </div>
    );
}

// ── Page Component ──────────────────────────────────────────────
export default function AdminDashboardPage() {
    return (
        <section>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Tổng quan
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Xin chào! Dưới đây là tình hình hoạt động của hệ thống.
                </p>
            </div>

            {/* Content with Suspense */}
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </section>
    );
}
