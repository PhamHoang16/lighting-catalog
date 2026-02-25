"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, FolderTree, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import CategoryTable from "@/components/admin/CategoryTable";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Category } from "@/lib/types/database";

export default function AdminCategoriesPage() {
    const supabase = createClient();
    const { toast } = useToast();

    // ── State ───────────────────────────────────────────────────
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch categories ────────────────────────────────────────
    const fetchCategories = useCallback(async () => {
        setLoadingData(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast("Không thể tải danh mục: " + error.message, "error");
        } else {
            setCategories(data ?? []);
        }
        setLoadingData(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Create ──────────────────────────────────────────────────
    async function handleCreate(formData: { name: string; slug: string }) {
        const { error } = await supabase
            .from("categories")
            .insert({ name: formData.name, slug: formData.slug });

        if (error) {
            if (error.code === "23505") {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast("Lỗi khi thêm danh mục: " + error.message, "error");
            }
            throw error; // prevent modal close
        }

        toast("Đã thêm danh mục thành công!", "success");
        setFormOpen(false);
        fetchCategories();
    }

    // ── Update ──────────────────────────────────────────────────
    async function handleUpdate(formData: { name: string; slug: string }) {
        if (!editingCategory) return;

        const { error } = await supabase
            .from("categories")
            .update({ name: formData.name, slug: formData.slug })
            .eq("id", editingCategory.id);

        if (error) {
            if (error.code === "23505") {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast("Lỗi khi cập nhật: " + error.message, "error");
            }
            throw error;
        }

        toast("Đã cập nhật danh mục thành công!", "success");
        setEditingCategory(null);
        setFormOpen(false);
        fetchCategories();
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleDelete() {
        if (!deletingCategory) return;
        setDeleting(true);

        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", deletingCategory.id);

        if (error) {
            toast("Lỗi khi xóa: " + error.message, "error");
        } else {
            toast(`Đã xóa danh mục "${deletingCategory.name}".`, "success");
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingCategory(null);
        fetchCategories();
    }

    // ── Open modals ─────────────────────────────────────────────
    function openCreate() {
        setEditingCategory(null);
        setFormOpen(true);
    }

    function openEdit(category: Category) {
        setEditingCategory(category);
        setFormOpen(true);
    }

    function openDelete(category: Category) {
        setDeletingCategory(category);
        setConfirmOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <FolderTree className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
                        <p className="text-sm text-gray-500">
                            Quản lý danh mục sản phẩm của bạn
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCategories}
                        disabled={loadingData}
                        className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                        title="Tải lại"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
                        />
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm danh mục
                    </button>
                </div>
            </div>

            {/* Content */}
            {loadingData ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">Đang tải danh mục...</span>
                </div>
            ) : (
                <CategoryTable
                    categories={categories}
                    onEdit={openEdit}
                    onDelete={openDelete}
                />
            )}

            {/* Create / Edit Modal */}
            <CategoryFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingCategory(null);
                }}
                onSubmit={editingCategory ? handleUpdate : handleCreate}
                editingCategory={editingCategory}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingCategory(null);
                }}
                onConfirm={handleDelete}
                title="Xóa danh mục"
                message={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.name ?? ""}"? Hành động này không thể hoàn tác.`}
                confirmLabel="Xóa danh mục"
                loading={deleting}
            />
        </div>
    );
}
