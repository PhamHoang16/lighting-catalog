"use client";

import { useState } from "react";
import { X, MapPin, Phone, CreditCard, FileText, Truck, Store, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import OrderStatusBadge from "./OrderStatusBadge";
import type { Order, OrderStatus } from "@/lib/types/database";

const vndFormat = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
});

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
];

interface OrderDetailModalProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onStatusUpdated: () => void;
}

export default function OrderDetailModal({
    open,
    onClose,
    order,
    onStatusUpdated,
}: OrderDetailModalProps) {
    const supabase = createClient();
    const { toast } = useToast();
    const [updatingStatus, setUpdatingStatus] = useState(false);

    if (!open || !order) return null;

    async function handleStatusChange(newStatus: string) {
        if (!order) return;
        setUpdatingStatus(true);

        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", order.id);

        if (error) {
            toast("Lỗi cập nhật trạng thái: " + error.message, "error");
        } else {
            toast("Đã cập nhật trạng thái đơn hàng!", "success");
            onStatusUpdated();
        }
        setUpdatingStatus(false);
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng</h2>
                    <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
                    {/* Customer info */}
                    <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {order.title === "chi" ? "Chị" : "Anh"} {order.customer_name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">{order.phone}</a>
                        </div>
                        {order.message && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <p>{order.message}</p>
                            </div>
                        )}
                    </div>

                    {/* Delivery info */}
                    <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            {order.delivery_method === "pickup" ? (
                                <>
                                    <Store className="h-4 w-4 text-emerald-500" />
                                    Nhận tại cửa hàng
                                </>
                            ) : (
                                <>
                                    <Truck className="h-4 w-4 text-blue-500" />
                                    Giao hàng tận nơi
                                </>
                            )}
                        </div>
                        {order.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <p>{order.address}</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            {order.card_at_home && (
                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                    <CreditCard className="mr-1 inline h-3 w-3" />
                                    Thanh toán khi nhận hàng
                                </span>
                            )}
                            {order.invoice_company && (
                                <span className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                    <FileText className="mr-1 inline h-3 w-3" />
                                    Xuất hóa đơn
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Order items */}
                    <div>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                            Sản phẩm ({order.items?.length ?? 0})
                        </h3>
                        <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                                    {item.product_image && (
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                            <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">{item.product_name}</p>
                                        {item.variant_label && (
                                            <p className="text-xs text-gray-500">Biến thể: {item.variant_label}</p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-amber-700">{vndFormat.format(item.unit_price)}</p>
                                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">Tổng tiền</span>
                        <span className="text-lg font-extrabold text-amber-700">
                            {vndFormat.format(order.total_amount)}
                        </span>
                    </div>

                    {/* Status & Time */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <OrderStatusBadge status={order.status} />
                            <span className="text-xs text-gray-400">
                                {order.created_at ? formatDate(order.created_at) : ""}
                            </span>
                        </div>
                    </div>

                    {/* Status update */}
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Cập nhật trạng thái
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleStatusChange(opt.value)}
                                    disabled={updatingStatus || order.status === opt.value}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-40 ${order.status === opt.value
                                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500/20"
                                        : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                        }`}
                                >
                                    {updatingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
