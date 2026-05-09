"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Plus, Loader2, Tag, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import BrandTable from "@/components/admin/BrandTable";
import BrandFormModal, { type BrandFormData } from "@/components/admin/BrandFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Brand } from "@/lib/types/database";
import {
    getBrandsAction,
    saveBrandAction,
    deleteBrandAction,
} from "@/app/actions/admin";

export default function AdminBrandsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    // ── State ───────────────────────────────────────────────────
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch brands ────────────────────────────────────────────
    const fetchBrands = useCallback(async () => {
        setLoadingData(true);
        try {
            const data = await getBrandsAction();
            setBrands(data);
        } catch (e) {
            toast("Không thể tải thương hiệu: " + (e as Error).message, "error");
        }
        setLoadingData(false);
    }, [toast]);

    useEffect(() => {
        fetchBrands();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Create ──────────────────────────────────────────────────
    async function handleCreate(formData: BrandFormData) {
        const result = await saveBrandAction(null, {
            name: formData.name,
            slug: formData.slug,
            logo_url: formData.logo_url,
        });

        if (result?.error) {
            if (result.error.includes("Slug")) {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast("Lỗi khi thêm thương hiệu: " + result.error, "error");
            }
            throw new Error(result.error);
        }

        toast("Đã thêm thương hiệu thành công!", "success");
        setFormOpen(false);
        startTransition(() => { fetchBrands(); });
    }

    // ── Update ──────────────────────────────────────────────────
    async function handleUpdate(formData: BrandFormData) {
        if (!editingBrand) return;

        const result = await saveBrandAction(editingBrand.id, {
            name: formData.name,
            slug: formData.slug,
            logo_url: formData.logo_url,
        });

        if (result?.error) {
            if (result.error.includes("Slug")) {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast("Lỗi khi cập nhật: " + result.error, "error");
            }
            throw new Error(result.error);
        }

        toast("Đã cập nhật thương hiệu thành công!", "success");
        setFormOpen(false);
        setEditingBrand(null);
        startTransition(() => { fetchBrands(); });
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleConfirmDelete() {
        if (!deletingBrand) return;

        setDeleting(true);
        const result = await deleteBrandAction(deletingBrand.id);

        if (result?.error) {
            if (result.error.includes("sản phẩm liên kết")) {
                toast("Không thể xóa thương hiệu này vì đang có sản phẩm liên kết.", "error");
            } else {
                toast("Lỗi khi xóa: " + result.error, "error");
            }
        } else {
            toast("Đã xóa thương hiệu thành công!", "success");
            startTransition(() => { fetchBrands(); });
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingBrand(null);
    }

    // ── UI handlers ─────────────────────────────────────────────
    function openCreateForm() {
        setEditingBrand(null);
        setFormOpen(true);
    }

    function openEditForm(brand: Brand) {
        setEditingBrand(brand);
        setFormOpen(true);
    }

    function openDeleteDialog(brand: Brand) {
        setDeletingBrand(brand);
        setConfirmOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                        <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý Thương hiệu
                        </h1>
                        <p className="text-sm text-gray-500">
                            Thêm, sửa, xóa thương hiệu sản phẩm
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBrands}
                        disabled={loadingData || isPending}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
                        />
                        Tải lại
                    </button>
                    <button
                        onClick={openCreateForm}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm thương hiệu
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium text-gray-700">
                        Tổng số thương hiệu:{" "}
                        <span className="font-bold text-purple-600">
                            {brands.length}
                        </span>
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
                <BrandTable
                    brands={brands}
                    onEdit={openEditForm}
                    onDelete={openDeleteDialog}
                />
            )}

            {/* Form Modal */}
            <BrandFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingBrand(null);
                }}
                onSubmit={editingBrand ? handleUpdate : handleCreate}
                editingBrand={editingBrand}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingBrand(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa thương hiệu "${deletingBrand?.name}"? Hành động này không thể hoàn tác.`}
                loading={deleting}
            />
        </div>
    );
}
