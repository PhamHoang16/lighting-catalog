import Link from "next/link";
import {
    Clock,
    Phone,
    User,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import type { Order } from "@/lib/types/database";

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

interface RecentOrdersProps {
    orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">
                    Chưa có đơn hàng nào.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {orders.map((order) => {
                const itemCount = order.items?.length ?? 0;
                const firstItem = order.items?.[0];

                return (
                    <div
                        key={order.id}
                        className="flex items-start gap-4 px-1 py-4 transition-colors first:pt-0 last:pb-0"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50">
                            <User className="h-5 w-5 text-blue-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {order.title === "chi" ? "Chị" : "Anh"} {order.customer_name}
                                </p>
                                <OrderStatusBadge status={order.status} />
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {order.phone}
                                </span>
                                {firstItem && (
                                    <span className="flex items-center gap-1">
                                        <ShoppingBag className="h-3 w-3" />
                                        {firstItem.product_name}
                                        {itemCount > 1 && (
                                            <span className="text-gray-400">
                                                +{itemCount - 1} SP
                                            </span>
                                        )}
                                    </span>
                                )}
                                {order.total_amount > 0 && (
                                    <span className="font-semibold text-amber-600">
                                        {vndFormat.format(order.total_amount)}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {timeAgo(order.created_at)}
                            </p>
                        </div>
                    </div>
                );
            })}

            <div className="pt-4">
                <Link
                    href="/admin/don-hang"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                    Xem tất cả đơn hàng
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
