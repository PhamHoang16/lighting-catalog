"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Package, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import ProductTable from "@/components/admin/ProductTable";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ProductToolbar, {
    SORT_OPTIONS,
} from "@/components/admin/ProductToolbar";
import type { ProductWithCategory } from "@/lib/types/database";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminProductsPage() {
    const supabase = createClient();
    const { toast } = useToast();

    // ── Data state ──────────────────────────────────────────────
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductWithCategory | null>(null);

    // ── Pagination state ────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    // ── Search / Filter / Sort state ────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [sortIndex, setSortIndex] = useState(0); // default: "Mới nhất"
    const [filterCategoryId, setFilterCategoryId] = useState("");

    // ── Fetch products ──────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);

        const sort = SORT_OPTIONS[sortIndex];
        const from = currentPage * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from("products")
            .select("*, categories(name)", { count: "exact" });

        // Search
        if (searchTerm) {
            query = query.ilike("name", `%${searchTerm}%`);
        }

        // Filter by category
        if (filterCategoryId) {
            query = query.eq("category_id", filterCategoryId);
        }

        // Sort + pagination
        query = query
            .order(sort.column, { ascending: sort.ascending })
            .range(from, to);

        const { data, error, count } = await query;

        if (error) {
            toast("Không thể tải sản phẩm: " + error.message, "error");
        } else {
            setProducts((data as ProductWithCategory[]) ?? []);
            setTotalCount(count ?? 0);
        }
        setIsLoading(false);
    }, [supabase, toast, currentPage, pageSize, searchTerm, sortIndex, filterCategoryId]);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, searchTerm, sortIndex, filterCategoryId]);

    // ── Search / Filter / Sort handlers ─────────────────────────
    // Khi thay đổi bất kỳ filter nào → reset về trang 0
    function handleSearchChange(term: string) {
        setSearchTerm(term);
        setCurrentPage(0);
    }

    function handleSortChange(index: number) {
        setSortIndex(index);
        setCurrentPage(0);
    }

    function handleCategoryChange(catId: string) {
        setFilterCategoryId(catId);
        setCurrentPage(0);
    }

    // ── Pagination handlers ─────────────────────────────────────
    function handlePageChange(page: number) {
        setCurrentPage(page);
    }

    function handlePageSizeChange(size: number) {
        setPageSize(size);
        setCurrentPage(0);
    }

    // ── Create / Update ─────────────────────────────────────────
    async function handleSaveProduct(formData: {
        name: string;
        slug: string;
        price: number;
        category_id: string;
        image_url?: string | null;
        gallery?: string[] | null;
        description?: string | null;
        specs?: { name: string; value: string }[] | null;
    }) {
        if (selectedProduct) {
            const { error } = await supabase
                .from("products")
                .update(formData)
                .eq("id", selectedProduct.id);

            if (error) {
                if (error.code === "23505") {
                    toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
                } else {
                    toast("Lỗi khi cập nhật: " + error.message, "error");
                }
                throw error;
            }
            toast("Đã cập nhật sản phẩm thành công!", "success");
        } else {
            const { error } = await supabase.from("products").insert(formData);

            if (error) {
                if (error.code === "23505") {
                    toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
                } else {
                    toast("Lỗi khi thêm sản phẩm: " + error.message, "error");
                }
                throw error;
            }
            toast("Đã thêm sản phẩm thành công!", "success");
        }

        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchProducts();
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleDeleteProduct(id: string) {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            toast("Lỗi khi xóa: " + error.message, "error");
        } else {
            toast("Đã xóa sản phẩm thành công!", "success");
            if (products.length === 1 && currentPage > 0) {
                setCurrentPage((prev) => prev - 1);
            } else {
                fetchProducts();
            }
        }
    }

    // ── Open modals ─────────────────────────────────────────────
    function openCreate() {
        setSelectedProduct(null);
        setIsModalOpen(true);
    }

    function openEdit(product: ProductWithCategory) {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                        <p className="text-sm text-gray-500">
                            Quản lý danh sách sản phẩm của bạn
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchProducts()}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                        title="Tải lại"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm
                    </button>
                </div>
            </div>

            {/* Toolbar: Search + Sort + Filter */}
            <ProductToolbar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                sortIndex={sortIndex}
                onSortChange={handleSortChange}
                categoryId={filterCategoryId}
                onCategoryChange={handleCategoryChange}
            />

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500">Đang tải sản phẩm...</span>
                </div>
            ) : (
                <ProductTable
                    products={products}
                    onEdit={openEdit}
                    onDelete={handleDeleteProduct}
                    pagination={{
                        currentPage,
                        totalCount,
                        pageSize,
                        onPageChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange,
                    }}
                />
            )}

            {/* Create / Edit Modal */}
            <ProductFormModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleSaveProduct}
                editingProduct={selectedProduct}
            />
        </div>
    );
}
