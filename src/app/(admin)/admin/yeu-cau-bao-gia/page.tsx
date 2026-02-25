"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Loader2,
    FileText,
    RefreshCw,
    Eye,
    Trash2,
    Inbox,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PaginationControls from "@/components/ui/PaginationControls";
import QuoteStatusBadge from "@/components/admin/QuoteStatusBadge";
import QuoteDetailModal from "@/components/admin/QuoteDetailModal";
import type { QuoteRequest } from "@/lib/types/database";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminQuoteRequestsPage() {
    const supabase = createClient();
    const { toast } = useToast();

    // ── State ───────────────────────────────────────────────────
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    // Detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

    // Delete confirm
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingQuote, setDeletingQuote] = useState<QuoteRequest | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch quotes (paginated) ────────────────────────────────
    const fetchQuotes = useCallback(
        async (page = currentPage, size = pageSize) => {
            setIsLoading(true);
            const from = page * size;
            const to = from + size - 1;

            const { data, error, count } = await supabase
                .from("quote_requests")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                toast("Không thể tải yêu cầu báo giá: " + error.message, "error");
            } else {
                setQuotes((data as QuoteRequest[]) ?? []);
                setTotalCount(count ?? 0);
            }
            setIsLoading(false);
        },
        [supabase, toast, currentPage, pageSize]
    );

    useEffect(() => {
        fetchQuotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // ── Pagination handlers ─────────────────────────────────────
    function handlePageChange(page: number) {
        setCurrentPage(page);
    }

    function handlePageSizeChange(size: number) {
        setPageSize(size);
        setCurrentPage(0);
    }

    // ── Delete ──────────────────────────────────────────────────
    function openDelete(quote: QuoteRequest) {
        setDeletingQuote(quote);
        setConfirmOpen(true);
    }

    async function handleDelete() {
        if (!deletingQuote) return;
        setDeleting(true);

        const { error } = await supabase
            .from("quote_requests")
            .delete()
            .eq("id", deletingQuote.id);

        if (error) {
            toast("Lỗi khi xóa: " + error.message, "error");
        } else {
            toast("Đã xóa yêu cầu báo giá.", "success");
            if (quotes.length === 1 && currentPage > 0) {
                setCurrentPage((prev) => prev - 1);
            } else {
                fetchQuotes();
            }
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingQuote(null);
    }

    // ── View detail ─────────────────────────────────────────────
    function openDetail(quote: QuoteRequest) {
        setSelectedQuote(quote);
        setDetailOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <FileText className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Yêu cầu báo giá
                        </h1>
                        <p className="text-sm text-gray-500">
                            Theo dõi và xử lý yêu cầu từ khách hàng
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => fetchQuotes()}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Tải lại
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">
                        Đang tải yêu cầu báo giá...
                    </span>
                </div>
            ) : quotes.length === 0 && currentPage === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <Inbox className="h-7 w-7 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                            Chưa có yêu cầu báo giá nào
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Khi khách hàng gửi yêu cầu, chúng sẽ hiển thị ở đây.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                        Khách hàng
                                    </th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                        SĐT
                                    </th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                        Sản phẩm
                                    </th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                        Trạng thái
                                    </th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">
                                        Ngày gửi
                                    </th>
                                    <th className="whitespace-nowrap px-6 py-3.5 text-right font-semibold text-gray-600">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quotes.map((quote) => {
                                    const itemCount = quote.items?.length ?? 0;
                                    return (
                                        <tr
                                            key={quote.id}
                                            className="transition-colors hover:bg-gray-50/50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {quote.customer_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <a
                                                    href={`tel:${quote.phone}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {quote.phone}
                                                </a>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {itemCount > 0 ? (
                                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                                        {itemCount} mặt hàng
                                                    </span>
                                                ) : (
                                                    <span className="text-xs italic text-gray-400">
                                                        Không có
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <QuoteStatusBadge status={quote.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {quote.created_at
                                                    ? formatDate(quote.created_at)
                                                    : "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openDetail(quote)}
                                                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDelete(quote)}
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

                    {/* Pagination */}
                    <PaginationControls
                        currentPage={currentPage}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </div>
            )}

            {/* Detail Modal */}
            <QuoteDetailModal
                open={detailOpen}
                onClose={() => {
                    setDetailOpen(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onStatusUpdated={() => {
                    fetchQuotes();
                    setDetailOpen(false);
                    setSelectedQuote(null);
                }}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingQuote(null);
                }}
                onConfirm={handleDelete}
                title="Xóa yêu cầu báo giá"
                message={`Bạn có chắc chắn muốn xóa yêu cầu từ "${deletingQuote?.customer_name ?? ""}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa yêu cầu"
                loading={deleting}
            />
        </div>
    );
}
