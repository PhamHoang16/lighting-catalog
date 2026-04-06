"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, FolderTree, RefreshCw, ArrowUpDown, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import CategoryTable from "@/components/admin/CategoryTable";
import CategoryFormModal, { type CategoryFormData } from "@/components/admin/CategoryFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Category } from "@/lib/types/database";
import { revalidateCategory, revalidateStorefront } from "@/app/actions/revalidate";

export default function AdminCategoriesPage() {
    const supabase = createClient();
    const { toast } = useToast();

    // ── State ───────────────────────────────────────────────────
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Form modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Inline sort state ────────────────────────────────────────
    // Local copy of categories for reordering (without hitting the server)
    const [sortMode, setSortMode] = useState(false);
    const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);

    // ── Fetch categories (Thin Row) ────────────────────────────
    const fetchCategories = useCallback(async () => {
        setLoadingData(true);
        const { data, error } = await supabase
            .from("categories")
            .select("id, name, slug, parent_id, image_url, sort_order, created_at")
            .order("sort_order", { ascending: true });

        if (error) {
            toast("Không thể tải danh mục: " + error.message, "error");
        } else {
            setCategories((data as any[]) ?? []);
        }
        setLoadingData(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Create ──────────────────────────────────────────────────
    async function handleCreate(formData: CategoryFormData) {
        const siblings = categories.filter(
            (c) => c.parent_id === formData.parent_id
        );
        const maxSortOrder = siblings.reduce(
            (max, c) => Math.max(max, c.sort_order ?? 0),
            -1
        );

        const { error } = await supabase
            .from("categories")
            .insert({
                name: formData.name,
                slug: formData.slug,
                parent_id: formData.parent_id,
                image_url: formData.image_url,
                description: formData.description,
                sort_order: maxSortOrder + 1,
            });

        if (error) {
            if (error.code === "23505") {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast("Lỗi khi thêm danh mục: " + error.message, "error");
            }
            throw error;
        }

        toast("Đã thêm danh mục thành công!", "success");
        setFormOpen(false);
        fetchCategories();
        await revalidateStorefront();
    }

    // ── Update ──────────────────────────────────────────────────
    async function handleUpdate(formData: CategoryFormData) {
        if (!editingCategory) return;

        const { error } = await supabase
            .from("categories")
            .update({
                name: formData.name,
                slug: formData.slug,
                parent_id: formData.parent_id,
                image_url: formData.image_url,
                description: formData.description,
            })
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
        await revalidateCategory(formData.slug);
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
            await revalidateCategory(deletingCategory.slug);
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

    async function openEdit(category: Category) {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", category.id)
            .single();

        if (error) {
            toast("Không thể lấy thông tin chi tiết: " + error.message, "error");
            return;
        }

        setEditingCategory(data as Category);
        setFormOpen(true);
    }

    function openDelete(category: Category) {
        setDeletingCategory(category);
        setConfirmOpen(true);
    }

    // ── Inline sort: enter/exit sort mode ───────────────────────
    function enterSortMode() {
        // Clone current list as local working copy
        setSortedCategories([...categories]);
        setSortMode(true);
    }

    function cancelSortMode() {
        setSortMode(false);
        setSortedCategories([]);
    }

    // Move a category up or down among its siblings (local state only)
    function handleMove(id: string, direction: "up" | "down", parentId: string | null) {
        setSortedCategories((prev) => {
            // 1. Get siblings sorted by their current sort_order (= visual order in tree)
            const siblings = [...prev]
                .filter((c) => c.parent_id === parentId)
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

            const idx = siblings.findIndex((c) => c.id === id);
            if (idx === -1) return prev;

            const swapIdx = direction === "up" ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= siblings.length) return prev;

            // 2. Assign clean sequential sort_orders (0, 1, 2...) so values are never ambiguous
            const reordered = siblings.map((c, i) => ({ ...c, sort_order: i }));

            // 3. Swap the two items
            const tmp = reordered[idx].sort_order;
            reordered[idx] = { ...reordered[idx], sort_order: reordered[swapIdx].sort_order };
            reordered[swapIdx] = { ...reordered[swapIdx], sort_order: tmp };

            // 4. Build lookup map of updated sort_orders
            const newOrders = new Map(reordered.map((c) => [c.id, c.sort_order]));

            // 5. Apply back to full list (non-siblings untouched)
            return prev.map((c) =>
                newOrders.has(c.id) ? { ...c, sort_order: newOrders.get(c.id)! } : c
            );
        });
    }

    // Save the reordered list to Supabase
    async function handleSaveSort() {
        setSaving(true);
        try {
            // Group by parent, renumber sequentially per group
            const parentGroups = new Map<string, Category[]>();
            for (const cat of sortedCategories) {
                const key = cat.parent_id ?? "__root__";
                if (!parentGroups.has(key)) parentGroups.set(key, []);
                parentGroups.get(key)!.push(cat);
            }

            const updates: { id: string; sort_order: number }[] = [];
            for (const [, siblings] of parentGroups) {
                const sorted = [...siblings].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                );
                sorted.forEach((cat, idx) => updates.push({ id: cat.id, sort_order: idx }));
            }

            // Batch update (parallel)
            const results = await Promise.all(
                updates.map(({ id, sort_order }) =>
                    supabase.from("categories").update({ sort_order }).eq("id", id)
                )
            );

            if (results.some((r) => r.error)) {
                toast("Có lỗi khi cập nhật thứ tự.", "error");
            } else {
                toast("Đã lưu thứ tự danh mục!", "success");
                setSortMode(false);
                setSortedCategories([]);
                fetchCategories();
                await revalidateStorefront();
            }
        } finally {
            setSaving(false);
        }
    }

    // Which list to display: sorted copy (sort mode) or server data
    const displayCategories = sortMode ? sortedCategories : categories;

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="relative pb-24">
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
                    {!sortMode && (
                        <>
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
                                onClick={enterSortMode}
                                disabled={loadingData || categories.length === 0}
                                className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40"
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                Sắp xếp
                            </button>
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm danh mục
                            </button>
                        </>
                    )}
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
                    categories={displayCategories}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    sortMode={sortMode}
                    onMove={handleMove}
                />
            )}

            {/* ── Sticky Save Bar (sort mode only) ──────────────────────── */}
            {sortMode && (
                <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-200 bg-white/95 px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-blue-700">Chế độ sắp xếp</span>
                            {" "}— Dùng nút ↑↓ trên bảng để điều chỉnh thứ tự danh mục.
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                onClick={cancelSortMode}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                                Huỷ
                            </button>
                            <button
                                onClick={handleSaveSort}
                                disabled={saving}
                                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Lưu thứ tự
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal — disabled in sort mode */}
            {!sortMode && (
                <>
                    <CategoryFormModal
                        open={formOpen}
                        onClose={() => {
                            setFormOpen(false);
                            setEditingCategory(null);
                        }}
                        onSubmit={editingCategory ? handleUpdate : handleCreate}
                        editingCategory={editingCategory}
                        allCategories={categories}
                    />

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
                </>
            )}
        </div>
    );
}
