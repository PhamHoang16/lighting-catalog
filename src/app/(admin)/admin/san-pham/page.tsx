"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { Plus, Loader2, Package, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ProductTable from "@/components/admin/ProductTable";
import ProductFormModal, { type ProductPayload } from "@/components/admin/ProductFormModal";
import ProductImportModal from "@/components/admin/ProductImportModal";
import ProductToolbar, {
    SORT_OPTIONS,
} from "@/components/admin/ProductToolbar";
import type { ProductWithCategory } from "@/lib/types/database";
import {
    getProductsForAdminAction,
    getProductByIdAction,
    saveProductAction,
    deleteProductAction,
    toggleBestSellerAction,
    updateProductSortOrderAction,
    bulkImportProductsAction,
} from "@/app/actions/admin";

const DEFAULT_PAGE_SIZE = 10;

export default function AdminProductsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    // ── Data state ──────────────────────────────────────────────
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductWithCategory | null>(null);

    // ── Pagination state ────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    // ── Search / Filter / Sort state ────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [sortIndex, setSortIndex] = useState(0);
    const [filterCategoryId, setFilterCategoryId] = useState("");
    const [bestSellerOnly, setBestSellerOnly] = useState(false);

    // ── Fetch products ──────────────────────────────────────────
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        const sort = SORT_OPTIONS[sortIndex];
        try {
            const result = await getProductsForAdminAction({
                searchTerm: searchTerm || undefined,
                categoryId: filterCategoryId || undefined,
                bestSellerOnly: bestSellerOnly || undefined,
                sortColumn: sort.column,
                sortAscending: sort.ascending,
                page: currentPage,
                pageSize,
            });
            setProducts(result.data as ProductWithCategory[]);
            setTotalCount(result.count);
        } catch (e) {
            toast("Không thể tải sản phẩm: " + (e as Error).message, "error");
        }
        setIsLoading(false);
    }, [toast, currentPage, pageSize, searchTerm, sortIndex, filterCategoryId, bestSellerOnly]);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize, searchTerm, sortIndex, filterCategoryId, bestSellerOnly]);

    // ── Search / Filter / Sort handlers ─────────────────────────
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

    function handleBestSellerChange(value: boolean) {
        setBestSellerOnly(value);
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
    async function handleSaveProduct(formData: ProductPayload) {
        const result = await saveProductAction(
            selectedProduct ? selectedProduct.id : null,
            formData
        );

        if (result?.error) {
            if (result.error.includes("Slug")) {
                toast("Slug đã tồn tại. Vui lòng đổi tên khác.", "error");
            } else {
                toast((selectedProduct ? "Lỗi khi cập nhật: " : "Lỗi khi thêm sản phẩm: ") + result.error, "error");
            }
            throw new Error(result.error);
        }

        toast(selectedProduct ? "Đã cập nhật sản phẩm thành công!" : "Đã thêm sản phẩm thành công!", "success");
        setIsModalOpen(false);
        setSelectedProduct(null);
        startTransition(() => { fetchProducts(); });
    }

    // ── Delete ──────────────────────────────────────────────────
    async function handleDeleteProduct(id: string) {
        const productToDelete = products.find(p => p.id === id);
        const slug = productToDelete?.slug ?? "";

        const result = await deleteProductAction(id, slug);

        if (result?.error) {
            toast("Lỗi khi xóa: " + result.error, "error");
        } else {
            toast("Đã xóa sản phẩm thành công!", "success");
            if (products.length === 1 && currentPage > 0) {
                setCurrentPage((prev) => prev - 1);
            } else {
                startTransition(() => { fetchProducts(); });
            }
        }
    }

    // ── Toggle best seller ──────────────────────────────────────
    async function handleToggleBestSeller(id: string, currentValue: boolean) {
        const result = await toggleBestSellerAction(id, !currentValue);

        if (result?.error) {
            toast("Lỗi khi cập nhật: " + result.error, "error");
        } else {
            toast(
                !currentValue
                    ? "Đã đánh dấu sản phẩm bán chạy!"
                    : "Đã bỏ đánh dấu bán chạy.",
                "success"
            );
            startTransition(() => { fetchProducts(); });
        }
    }

    // ── Update sort order ───────────────────────────────────────
    async function handleUpdateSortOrder(id: string, sortOrder: number) {
        const result = await updateProductSortOrderAction(id, sortOrder);

        if (result?.error) {
            toast("Lỗi khi cập nhật thứ tự: " + result.error, "error");
            throw new Error(result.error);
        }
        toast("Đã cập nhật thứ tự hiển thị!", "success");
        startTransition(() => { fetchProducts(); });
    }

    // ── Open modals ─────────────────────────────────────────────
    function openCreate() {
        setSelectedProduct(null);
        setIsModalOpen(true);
    }

    async function openEdit(product: ProductWithCategory) {
        setIsLoading(true);
        const data = await getProductByIdAction(product.id);
        setIsLoading(false);

        if (!data) {
            toast("Không thể lấy thông tin chi tiết sản phẩm.", "error");
            return;
        }

        setSelectedProduct(data as ProductWithCategory);
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
                        disabled={isLoading || isPending}
                        className="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                        title="Tải lại"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        Import CSV
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
                bestSellerOnly={bestSellerOnly}
                onBestSellerChange={handleBestSellerChange}
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
                    onToggleBestSeller={handleToggleBestSeller}
                    onUpdateSortOrder={handleUpdateSortOrder}
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

            {/* Import CSV Modal */}
            <ProductImportModal
                open={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => startTransition(() => { fetchProducts(); })}
            />
        </div>
    );
}
