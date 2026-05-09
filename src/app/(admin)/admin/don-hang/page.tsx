"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
    Loader2,
    ShoppingCart,
    RefreshCw,
    Eye,
    Trash2,
    Inbox,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PaginationControls from "@/components/ui/PaginationControls";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import type { Order } from "@/lib/types/database";
import {
    getOrdersAction,
    getOrderByIdAction,
    deleteOrderAction,
} from "@/app/actions/admin";

const DEFAULT_PAGE_SIZE = 10;

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

export default function AdminOrdersPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchOrders = useCallback(
        async (page = currentPage, size = pageSize) => {
            setIsLoading(true);
            try {
                const result = await getOrdersAction({ page, pageSize: size });
                setOrders(result.data as Order[]);
                setTotalCount(result.count);
            } catch (e) {
                toast("Không thể tải đơn hàng: " + (e as Error).message, "error");
            }
            setIsLoading(false);
        },
        [toast, currentPage, pageSize]
    );

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    function openDelete(order: Order) {
        setDeletingOrder(order);
        setConfirmOpen(true);
    }

    async function handleDelete() {
        if (!deletingOrder) return;
        setDeleting(true);

        const result = await deleteOrderAction(deletingOrder.id);

        if (result?.error) {
            toast("Lỗi khi xóa: " + result.error, "error");
        } else {
            toast("Đã xóa đơn hàng.", "success");
            if (orders.length === 1 && currentPage > 0) {
                setCurrentPage((prev) => prev - 1);
            } else {
                startTransition(() => { fetchOrders(); });
            }
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingOrder(null);
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <ShoppingCart className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Đơn đặt hàng
                        </h1>
                        <p className="text-sm text-gray-500">
                            Theo dõi và xử lý đơn hàng từ khách hàng
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => fetchOrders()}
                    disabled={isLoading || isPending}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Tải lại
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">Đang tải đơn hàng...</span>
                </div>
            ) : orders.length === 0 && currentPage === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <Inbox className="h-7 w-7 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Chưa có đơn hàng nào</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Khi khách hàng đặt hàng, đơn sẽ hiển thị ở đây.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Khách hàng</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">SĐT</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Sản phẩm</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Tổng tiền</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Nhận hàng</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Trạng thái</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Ngày đặt</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 text-right font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    return (
                                        <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {order.title === "chi" ? "Chị" : "Anh"} {order.customer_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">
                                                    {order.phone}
                                                </a>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                                                    Bấm xem
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-amber-700">
                                                {order.total_amount > 0 ? vndFormat.format(order.total_amount) : "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.delivery_method === "pickup" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                                                    {order.delivery_method === "pickup" ? "Nhận tại CH" : "Giao hàng"}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <OrderStatusBadge status={order.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {order.created_at ? formatDate(order.created_at) : "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={async () => {
                                                            setIsLoading(true);
                                                            const data = await getOrderByIdAction(order.id);
                                                            setIsLoading(false);
                                                            if (!data) {
                                                                toast("Lỗi khi lấy chi tiết đơn hàng.", "error");
                                                                return;
                                                            }
                                                            setSelectedOrder(data as Order);
                                                            setDetailOpen(true);
                                                        }}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(order)}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <PaginationControls
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(0);
                        }}
                    />
                </div>
            )}

            {/* Detail Modal */}
            <OrderDetailModal
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onStatusUpdated={() => {
                    startTransition(() => { fetchOrders(); });
                    setDetailOpen(false);
                    setSelectedOrder(null);
                }}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingOrder(null);
                }}
                onConfirm={handleDelete}
                title="Xóa đơn hàng"
                message={`Bạn có chắc chắn muốn xóa đơn hàng của "${deletingOrder?.customer_name ?? ""}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa đơn hàng"
                loading={deleting}
            />
        </div>
    );
}
