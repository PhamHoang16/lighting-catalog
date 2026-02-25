"use client";

import { useState } from "react";
import {
    User,
    Phone,
    MessageSquare,
    CalendarDays,
    Loader2,
    ShoppingCart,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import QuoteStatusBadge from "@/components/admin/QuoteStatusBadge";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
    QUOTE_STATUS_MAP,
    type QuoteStatus,
    type QuoteRequest,
} from "@/lib/types/database";

interface QuoteDetailModalProps {
    open: boolean;
    onClose: () => void;
    quote: QuoteRequest | null;
    /** Gọi lại sau khi cập nhật status để refresh table */
    onStatusUpdated: () => void;
}

const statusKeys = Object.keys(QUOTE_STATUS_MAP) as QuoteStatus[];

export default function QuoteDetailModal({
    open,
    onClose,
    quote,
    onStatusUpdated,
}: QuoteDetailModalProps) {
    const supabase = createClient();
    const { toast } = useToast();
    const [updating, setUpdating] = useState(false);

    if (!quote) return null;

    const items = quote.items ?? [];

    async function handleStatusChange(newStatus: string) {
        if (!quote || newStatus === quote.status) return;

        setUpdating(true);
        const { error } = await supabase
            .from("quote_requests")
            .update({ status: newStatus })
            .eq("id", quote.id);

        if (error) {
            toast("Lỗi khi cập nhật trạng thái: " + error.message, "error");
        } else {
            const label =
                QUOTE_STATUS_MAP[newStatus as QuoteStatus]?.label ?? newStatus;
            toast(`Đã chuyển trạng thái sang "${label}".`, "success");
            onStatusUpdated();
        }
        setUpdating(false);
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Chi tiết yêu cầu báo giá"
            maxWidth="max-w-xl"
        >
            <div className="space-y-5">
                {/* ── Thông tin khách hàng ───────────────────────────── */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                        icon={<User className="h-4 w-4" />}
                        label="Khách hàng"
                        value={quote.customer_name}
                    />
                    <InfoItem
                        icon={<Phone className="h-4 w-4" />}
                        label="Số điện thoại"
                        value={
                            <a
                                href={`tel:${quote.phone}`}
                                className="font-medium text-blue-600 hover:underline"
                            >
                                {quote.phone}
                            </a>
                        }
                    />
                    <InfoItem
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Ngày gửi"
                        value={quote.created_at ? formatDate(quote.created_at) : "—"}
                    />
                    <InfoItem
                        icon={<ShoppingCart className="h-4 w-4" />}
                        label="Số mặt hàng"
                        value={
                            <span className="font-semibold text-blue-700">
                                {items.length} sản phẩm
                            </span>
                        }
                    />
                </div>

                {/* ── Danh sách sản phẩm (Items table) ─────────────── */}
                {items.length > 0 && (
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <ShoppingCart className="h-4 w-4" />
                            Danh sách sản phẩm yêu cầu
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80">
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">
                                            #
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-600">
                                            Tên sản phẩm
                                        </th>
                                        <th className="px-4 py-2.5 text-right font-semibold text-gray-600">
                                            Số lượng
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, idx) => (
                                        <tr
                                            key={item.product_id + idx}
                                            className="transition-colors hover:bg-gray-50/50"
                                        >
                                            <td className="whitespace-nowrap px-4 py-2.5 text-gray-400">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-gray-900">
                                                {item.product_name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Lời nhắn / Thông tin dự án ───────────────────── */}
                <div>
                    <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-500">
                        <MessageSquare className="h-4 w-4" />
                        Lời nhắn / Thông tin dự án
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                        {quote.message || (
                            <span className="italic text-gray-400">Không có lời nhắn</span>
                        )}
                    </div>
                </div>

                {/* ── Cập nhật trạng thái ──────────────────────────── */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">
                            Trạng thái:
                        </span>
                        <QuoteStatusBadge status={quote.status} />
                    </div>

                    <div className="flex items-center gap-2">
                        {updating && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <select
                            value={quote.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {statusKeys.map((key) => (
                                <option key={key} value={key}>
                                    {QUOTE_STATUS_MAP[key].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// ── Sub-component: hiển thị 1 dòng thông tin ──────────────────
function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-500">
                {icon}
                {label}
            </div>
            <div className="text-sm text-gray-900">{value}</div>
        </div>
    );
}
