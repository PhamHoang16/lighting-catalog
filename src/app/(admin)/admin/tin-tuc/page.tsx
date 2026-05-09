"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Plus, Loader2, Newspaper, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import PostTable from "@/components/admin/PostTable";
import PostFormModal, { type PostFormData } from "@/components/admin/PostFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Post } from "@/lib/types/database";
import {
    getPostsAction,
    savePostAction,
    deletePostAction,
} from "@/app/actions/admin";

export default function AdminPostsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    // ── State ───────────────────────────────────────────────────
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletingPost, setDeletingPost] = useState<Post | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch posts ─────────────────────────────────────────────
    const fetchPosts = useCallback(async () => {
        setLoadingData(true);
        try {
            const data = await getPostsAction();
            setPosts(data as Post[]);
        } catch (e) {
            toast("Không thể tải bài viết: " + (e as Error).message, "error");
        }
        setLoadingData(false);
    }, [toast]);

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Create ──────────────────────────────────────────────────
    async function handleCreate(formData: PostFormData) {
        const result = await savePostAction(null, {
            title: formData.title,
            slug: formData.slug,
            thumbnail_url: formData.thumbnail_url,
            summary: formData.summary,
            content: formData.content,
            is_published: formData.is_published,
            is_featured: formData.is_featured,
            is_popular: formData.is_popular,
        });

        if (result?.error) {
            toast("Lỗi khi thêm bài viết: " + result.error, "error");
            throw new Error(result.error);
        }

        toast("Đã thêm bài viết thành công!", "success");
        setFormOpen(false);
        startTransition(() => { fetchPosts(); });
    }

    // ── Update ──────────────────────────────────────────────────
    async function handleUpdate(formData: PostFormData) {
        if (!editingPost) return;

        const result = await savePostAction(editingPost.id, {
            title: formData.title,
            slug: formData.slug,
            thumbnail_url: formData.thumbnail_url,
            summary: formData.summary,
            content: formData.content,
            is_published: formData.is_published,
            is_featured: formData.is_featured,
            is_popular: formData.is_popular,
        });

        if (result?.error) {
            toast("Lỗi khi cập nhật bài viết: " + result.error, "error");
            throw new Error(result.error);
        }

        toast("Đã cập nhật bài viết thành công!", "success");
        setFormOpen(false);
        setEditingPost(null);
        startTransition(() => { fetchPosts(); });
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleConfirmDelete() {
        if (!deletingPost) return;

        setDeleting(true);
        const result = await deletePostAction(deletingPost.id, deletingPost.slug);

        if (result?.error) {
            toast("Lỗi khi xóa bài viết: " + result.error, "error");
        } else {
            toast("Đã xóa bài viết thành công!", "success");
            startTransition(() => { fetchPosts(); });
        }

        setDeleting(false);
        setConfirmOpen(false);
        setDeletingPost(null);
    }

    // ── UI handlers ─────────────────────────────────────────────
    function openCreateForm() {
        setEditingPost(null);
        setFormOpen(true);
    }

    async function openEditForm(post: Post) {
        // Post list already has full data (getAllPostsForAdmin returns all columns)
        setEditingPost(post);
        setFormOpen(true);
    }

    function openDeleteDialog(post: Post) {
        setDeletingPost(post);
        setConfirmOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    const publishedCount = posts.filter((p) => p.is_published).length;
    const draftCount = posts.length - publishedCount;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Newspaper className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý Tin tức
                        </h1>
                        <p className="text-sm text-gray-500">
                            Đăng bài viết, tin tức SEO và chia sẻ kiến thức
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchPosts}
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
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:from-indigo-600 hover:to-purple-700"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm bài viết
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
                <div className="flex items-center gap-4">
                    <Newspaper className="h-5 w-5 text-indigo-600" />
                    <p className="text-sm font-medium text-gray-700">
                        Tổng:{" "}
                        <span className="font-bold text-indigo-600">
                            {posts.length}
                        </span>
                        {" "}bài viết
                        {" · "}
                        Đã xuất bản: <span className="font-bold text-emerald-600">{publishedCount}</span>
                        {" · "}
                        Bản nháp: <span className="font-bold text-gray-500">{draftCount}</span>
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
                <PostTable
                    posts={posts}
                    onEdit={openEditForm}
                    onDelete={openDeleteDialog}
                />
            )}

            {/* Form Modal */}
            <PostFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditingPost(null);
                }}
                onSubmit={editingPost ? handleUpdate : handleCreate}
                editingPost={editingPost}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setDeletingPost(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa bài viết"
                message={`Bạn có chắc chắn muốn xóa bài viết "${deletingPost?.title ?? ""}"? Hành động này không thể hoàn tác.`}
                loading={deleting}
            />
        </div>
    );
}
