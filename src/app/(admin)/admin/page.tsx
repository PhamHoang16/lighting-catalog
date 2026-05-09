import { Suspense } from "react";
import {
    Package,
    FolderOpen,
    ShoppingCart,
    Bell,
    Loader2,
} from "lucide-react";
import { db } from "@/lib/db";
import { categories, products, orders } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/require-admin";
import StatCard from "@/components/admin/dashboard/StatCard";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import type { Order } from "@/lib/types/database";

// ── Data fetching (Server-side) ─────────────────────────────────
async function getDashboardStats() {
    await requireAdmin();

    const [categoryCount, productCount, orderCount, pendingOrderCount, recentRes] =
        await Promise.all([
            db.select({ count: count() }).from(categories).then(r => Number(r[0]?.count ?? 0)),
            db.select({ count: count() }).from(products).then(r => Number(r[0]?.count ?? 0)),
            db.select({ count: count() }).from(orders).then(r => Number(r[0]?.count ?? 0)),
            db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")).then(r => Number(r[0]?.count ?? 0)),
            db.select({
                id: orders.id,
                customer_name: orders.customer_name,
                total_amount: orders.total_amount,
                status: orders.status,
                created_at: orders.created_at,
            }).from(orders).orderBy(desc(orders.created_at)).limit(5),
        ]);

    return {
        categoryCount,
        productCount,
        orderCount,
        pendingOrderCount,
        recentOrders: recentRes.map(r => ({
            ...r,
            total_amount: Number(r.total_amount),
            created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
        })) as Order[],
    };
}

// ── Skeleton component ──────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="space-y-8">
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
                    title="Đơn hàng"
                    value={stats.orderCount}
                    icon={ShoppingCart}
                    color="amber"
                />
                <StatCard
                    title="Chờ xác nhận"
                    value={stats.pendingOrderCount}
                    icon={Bell}
                    color="red"
                />
            </div>

            {/* ── Content Row ────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h2 className="mb-5 text-base font-semibold text-gray-900">
                        Đơn hàng gần đây
                    </h2>
                    <RecentOrders orders={stats.recentOrders} />
                </div>

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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Tổng quan
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Xin chào! Dưới đây là tình hình hoạt động của hệ thống.
                </p>
            </div>

            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </section>
    );
}
