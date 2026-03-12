"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Download, UploadCloud, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/utils";

interface ProductImportModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface CSVRow {
    name: string;
    price: string;
    category_slug: string;
    brand_slug: string;
    image_url: string;
    gallery: string;
    description: string;
}

export default function ProductImportModal({ open, onClose, onSuccess }: ProductImportModalProps) {
    const supabase = createClient();
    const { toast } = useToast();

    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadTemplate = () => {
        const headers = ["name", "price", "category_slug", "brand_slug", "image_url", "gallery", "description"];
        // For CSV, columns containing commas must be wrapped in double quotes
        const demoRow = [
            "Đèn LED Âm Trần 9W",
            "150000",
            "den-am-tran",
            "rang-dong",
            "https://example.com/img1.jpg",
            '"https://example.com/img2.jpg,https://example.com/img3.jpg"',
            "Mô tả đèn LED..."
        ];

        const csvContent = [headers.join(","), demoRow.join(",")].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "template_san_pham.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processFile = (file: File) => {
        if (!file.name.endsWith(".csv")) {
            toast("Vui lòng chọn file .csv", "error");
            return;
        }

        setIsLoading(true);
        setStatus({ message: "Đang đọc file...", type: 'info' });

        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                await handleImportData(results.data);
            },
            error: (error) => {
                toast("Lỗi đọc file CSV: " + error.message, "error");
                setIsLoading(false);
            }
        });
    };

    const handleImportData = async (data: CSVRow[]) => {
        try {
            if (data.length === 0) {
                throw new Error("File CSV trống.");
            }

            setStatus({ message: "Đang kiểm tra hệ thống thư mục (Categories & Brands)...", type: 'info' });

            const categorySlugs = Array.from(new Set(data.map(r => r.category_slug).filter(Boolean)));
            const brandSlugs = Array.from(new Set(data.map(r => r.brand_slug).filter(Boolean)));

            // Fetch mappings
            const [categoriesRes, brandsRes] = await Promise.all([
                supabase.from("categories").select("id, slug").in("slug", categorySlugs),
                supabase.from("brands").select("id, slug").in("slug", brandSlugs)
            ]);

            const mapCategories = new Map(categoriesRes.data?.map(c => [c.slug, c.id]) ?? []);
            const mapBrands = new Map(brandsRes.data?.map(b => [b.slug, b.id]) ?? []);

            const productsToInsert = [];
            let errorCount = 0;

            for (const row of data) {
                if (!row.name || !row.price || !row.category_slug) {
                    errorCount++;
                    continue; // Skip invalid rows
                }

                const catId = mapCategories.get(row.category_slug);
                if (!catId) {
                    errorCount++;
                    continue; // Mandatory
                }

                const brandId = row.brand_slug ? mapBrands.get(row.brand_slug) : null;
                const numericPrice = parseFloat(row.price);

                if (isNaN(numericPrice)) {
                    errorCount++;
                    continue;
                }

                const itemSlug = `${toSlug(row.name)}-${Math.random().toString(36).slice(2, 6)}`;

                let galleryUrls: string[] | null = null;
                if (row.gallery) {
                    galleryUrls = row.gallery.split(",").map(url => url.trim()).filter(Boolean);
                }

                productsToInsert.push({
                    name: row.name.trim(),
                    slug: itemSlug,
                    price: numericPrice,
                    category_id: catId,
                    brand_id: brandId || null,
                    image_url: row.image_url?.trim() || null,
                    gallery: galleryUrls?.length ? galleryUrls : null,
                    description: row.description?.trim() || null,
                });
            }

            if (productsToInsert.length === 0) {
                throw new Error("Không có dữ liệu hợp lệ nào để import. Vui lòng kiểm tra lại file CSV.");
            }

            setStatus({ message: `Đang lưu ${productsToInsert.length} sản phẩm vào cơ sở dữ liệu...`, type: 'info' });

            const { error: insertError } = await supabase.from("products").insert(productsToInsert);

            if (insertError) {
                throw insertError;
            }

            setStatus({
                message: `Import thành công ${productsToInsert.length} sản phẩm! ${errorCount > 0 ? `(Bỏ qua ${errorCount} dòng lỗi)` : ""}`,
                type: 'success'
            });

            toast(`Đã import thành công ${productsToInsert.length} sản phẩm!`, "success");
            onSuccess();

            setTimeout(() => {
                if (open) handleClose();
            }, 2000);

        } catch (error: any) {
            setStatus({ message: `Lỗi: ${error.message}`, type: 'error' });
            toast(`Lỗi Import: ${error.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setStatus(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={handleClose} title="Import Sản phẩm (CSV)" maxWidth="max-w-xl">
            <div className="space-y-6">

                {/* Step 1: Download Template */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900">1. Tải File Mẫu (Template)</h3>
                            <p className="mt-1 text-sm text-blue-700/80">
                                Vui lòng tải file mẫu và điền dữ liệu theo đúng định dạng các cột.
                                Không đổi tên các cột (Header).
                            </p>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                            <Download className="h-4 w-4" />
                            File Mẫu
                        </button>
                    </div>
                </div>

                {/* Step 2: Upload Area */}
                <div>
                    <h3 className="mb-3 font-semibold text-gray-900">2. Upload File CSV đã điền</h3>

                    <div
                        className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors
                            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
                            ${isLoading ? "pointer-events-none opacity-60" : ""}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file) processFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className={`mb-3 h-10 w-10 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                        <p className="mb-1 text-sm font-medium text-gray-900">
                            Nhấn để chọn file hoặc kéo thả file vào đây
                        </p>
                        <p className="text-xs text-gray-500">Chỉ hỗ trợ file định dạng .csv</p>
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) processFile(file);
                                e.target.value = ""; // Reset input
                            }}
                        />
                    </div>
                </div>

                {/* Status Indicator */}
                {status && (
                    <div className={`flex items-center gap-3 rounded-lg p-4 text-sm font-medium ${status.type === 'info' ? "bg-amber-50 text-amber-700" :
                        status.type === 'success' ? "bg-emerald-50 text-emerald-700" :
                            "bg-red-50 text-red-700"
                        }`}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                            status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                                <AlertCircle className="h-5 w-5" />}
                        {status.message}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Đóng
                </button>
            </div>
        </Modal>
    );
}
