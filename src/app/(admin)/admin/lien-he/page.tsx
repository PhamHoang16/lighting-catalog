"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
    Loader2,
    MessageSquare,
    RefreshCw,
    Trash2,
    Inbox,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PaginationControls from "@/components/ui/PaginationControls";
import type { Lead, LeadStatus } from "@/lib/types/database";
import { LEAD_STATUS_MAP } from "@/lib/types/database";
import {
    getLeadsAction,
    updateLeadStatusAction,
    deleteLeadAction,
} from "@/app/actions/admin";

const DEFAULT_PAGE_SIZE = 10;
const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "done"];

export default function AdminLeadsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchLeads = useCallback(
        async (page = currentPage, size = pageSize) => {
            setIsLoading(true);
            try {
                const result = await getLeadsAction({ page, pageSize: size });
                setLeads(result.data as Lead[]);
                setTotalCount(result.count);
            } catch (e) {
                toast("Không thể tải danh sách: " + (e as Error).message, "error");
            }
            setIsLoading(false);
        },
        [toast, currentPage, pageSize]
    );

    useEffect(() => {
        fetchLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    async function handleStatusChange(lead: Lead, status: LeadStatus) {
        setLeads((prev) =>
            prev.map((l) => (l.id === lead.id ? { ...l, status } : l))
        );
        const result = await updateLeadStatusAction(lead.id, status);
        if (result?.error) {
            toast("Lỗi cập nhật trạng thái: " + result.error, "error");
            startTransition(() => { fetchLeads(); });
        }
    }

    function openDelete(lead: Lead) {
        setDeletingLead(lead);
        setConfirmOpen(true);
    }

    async function handleDelete() {
        if (!deletingLead) return;
        setDeleting(true);

        const result = await deleteLeadAction(deletingLead.id);

        if (result?.error) {
            toast("Lỗi khi xóa: " + result.error, "error");
        } else {
            toast("Đã xóa.", "success");
            if (leads.length === 1 && currentPage > 0) {
                setCurrentPage((prev) => prev - 1);
            } else {
                startTransition(() => { fetchLeads(); });
            }
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingLead(null);
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Đăng ký tư vấn
                        </h1>
                        <p className="text-sm text-gray-500">
                            Thông tin khách để lại từ form cuối trang
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => fetchLeads()}
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
                    <span className="text-sm text-gray-500">Đang tải...</span>
                </div>
            ) : leads.length === 0 && currentPage === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <Inbox className="h-7 w-7 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Chưa có đăng ký nào</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Khi khách điền form tư vấn, thông tin sẽ hiển thị ở đây.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/80">
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Họ tên</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">SĐT</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Email</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Trạng thái</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-gray-600">Ngày gửi</th>
                                    <th className="whitespace-nowrap px-6 py-3.5 text-right font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leads.map((lead) => {
                                    const statusInfo =
                                        LEAD_STATUS_MAP[lead.status as LeadStatus] ?? LEAD_STATUS_MAP.new;
                                    return (
                                        <tr key={lead.id} className="transition-colors hover:bg-gray-50/50">
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {lead.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                                    {lead.phone}
                                                </a>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                                {lead.email ? (
                                                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                                        {lead.email}
                                                    </a>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <select
                                                    value={(lead.status as LeadStatus) in LEAD_STATUS_MAP ? lead.status : "new"}
                                                    onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                                                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-amber-500/30 ${statusInfo.bg} ${statusInfo.text}`}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {LEAD_STATUS_MAP[s].label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {lead.created_at ? formatDate(lead.created_at) : "—"}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openDelete(lead)}
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

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingLead(null);
                }}
                onConfirm={handleDelete}
                title="Xóa đăng ký"
                message={`Bạn có chắc chắn muốn xóa thông tin của "${deletingLead?.name ?? ""}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa"
                loading={deleting}
            />
        </div>
    );
}
