"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Images, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import BannerTable from "@/components/admin/BannerTable";
import BannerFormModal, { type BannerFormData } from "@/components/admin/BannerFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Banner } from "@/lib/types/database";

export default function AdminBannersPage() {
    const supabase = createClient();
    const { toast } = useToast();

    // ── State ───────────────────────────────────────────────────
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch banners ───────────────────────────────────────────
    const fetchBanners = useCallback(async () => {
        setLoadingData(true);
        const { data, error } = await supabase
            .from("banners")
            .select("id, title, image_url, link_url, sort_order, is_active, created_at")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            toast("Không thể tải banner: " + error.message, "error");
        } else {
            setBanners(data ?? []);
        }
        setLoadingData(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Create ──────────────────────────────────────────────────
    async function handleCreate(formData: BannerFormData) {
        const { data, error } = await supabase
            .from("banners")
            .insert({
                title: formData.title,
                image_url: formData.image_url,
                link_url: formData.link_url,
                is_active: formData.is_active,
                sort_order: formData.sort_order,
            })
            .select();

        if (error) {
            toast("Lỗi khi thêm banner: " + error.message, "error");
            throw error;
        }
        
        if (!data || data.length === 0) {
            toast("Thêm thất bại do lỗi phân quyền (Hãy chạy SQL Policy)", "error");
            return;
        }

        toast("Đã thêm banner thành công!", "success");
        setFormOpen(false);
        fetchBanners();
    }

    // ── Update ──────────────────────────────────────────────────
    async function handleUpdate(formData: BannerFormData) {
        if (!editingBanner) return;

        const { data, error } = await supabase
            .from("banners")
            .update({
                title: formData.title,
                image_url: formData.image_url,
                link_url: formData.link_url,
                is_active: formData.is_active,
                sort_order: formData.sort_order,
            })
            .eq("id", editingBanner.id)
            .select();

        if (error) {
            toast("Lỗi khi cập nhật banner: " + error.message, "error");
            throw error;
        }
        
        if (!data || data.length === 0) {
            toast("Cập nhật thất bại do lỗi phân quyền (Hãy chạy SQL Policy)", "error");
            return;
        }

        toast("Đã cập nhật banner thành công!", "success");
        setFormOpen(false);
        setEditingBanner(null);
        fetchBanners();
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleConfirmDelete() {
        if (!deletingBanner) return;

        setDeleting(true);
        const { data, error } = await supabase
            .from("banners")
            .delete()
            .eq("id", deletingBanner.id)
            .select();

        if (error) {
            toast("Lỗi khi xóa banner: " + error.message, "error");
        } else if (!data || data.length === 0) {
            toast("Không thể xoá do giới hạn quyền (Hãy chạy SQL Policy đã hướng dẫn)", "error");
        } else {
            toast("Đã xóa banner thành công!", "success");
            fetchBanners();
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingBanner(null);
    }

    // ── UI handlers ─────────────────────────────────────────────
    function openCreateForm() {
        setEditingBanner(null);
        setFormOpen(true);
    }

    function openEditForm(banner: Banner) {
        setEditingBanner(banner);
        setFormOpen(true);
    }

    function openDeleteDialog(banner: Banner) {
        setDeletingBanner(banner);
        setConfirmOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                        <Images className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý Banner
                        </h1>
                        <p className="text-sm text-gray-500">
                            Thêm, phân loại, và cấu hình các ảnh quảng cáo trang chủ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBanners}
                        disabled={loadingData}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
                        />
                        Tải lại
                    </button>
                    <button
                        onClick={openCreateForm}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-amber-600 hover:to-orange-700"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm Banner
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                <div className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-amber-600" />
                    <p className="text-sm font-medium text-gray-700">
                        Tổng số banner hiện có:{" "}
                        <span className="font-bold text-amber-600">
                            {banners.length}
                        </span>
                        {" "}
                        hiển thị: <span className="font-bold text-emerald-600">{banners.filter(b => b.is_active).length}</span>
                    </p>
                </div>
            </div>

            {/* Table */}
            {loadingData ? (
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">Đang tải...</p>
                    </div>
                </div>
            ) : (
                <BannerTable
                    banners={banners}
                    onEdit={openEditForm}
                    onDelete={openDeleteDialog}
                />
            )}

            {/* Form Modal */}
            <BannerFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingBanner(null);
                }}
                onSubmit={editingBanner ? handleUpdate : handleCreate}
                editingBanner={editingBanner}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingBanner(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa banner"
                message={`Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác.`}
                loading={deleting}
            />
        </div>
    );
}
