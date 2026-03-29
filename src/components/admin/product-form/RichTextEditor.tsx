"use client";

import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Link as LinkIcon, Upload, Image as ImageIcon } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

// Dynamic import react-quill-new (SSR incompatible)
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        const ForwardedQuill = function ForwardedQuill(props: any) {
            return <RQ {...props} />;
        };
        return ForwardedQuill;
    },
    {
        ssr: false,
        loading: () => (
            <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
        ),
    }
);

const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "link",
    "image",
    "video",
];

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    disabled?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    disabled = false,
}: RichTextEditorProps) {
    const quillRef = useRef<any>(null);
    const { toast } = useToast();
    const supabase = createClient();

    // ── Image Modal State ──────────────────────────────────────────
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageTab, setImageTab] = useState<"url" | "upload">("upload");
    const [inputUrl, setInputUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // ── Override Custom Image Handler ──────────────────────────────
    const imageHandler = useCallback(() => {
        setIsImageModalOpen(true);
        setInputUrl("");
    }, []);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [2, 3, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image", "video"],
                    ["clean"],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
        }),
        [imageHandler]
    );

    // ── Tooltips Injection ─────────────────────────────────────────
    useEffect(() => {
        // Tự động thêm Tooltip cho các nút công cụ trong toolbar
        const tooltipMap: Record<string, string> = {
            ".ql-header[value='2']": "Tiêu đề 2",
            ".ql-header[value='3']": "Tiêu đề 3",
            ".ql-header:not([value])": "Đoạn văn thường",
            ".ql-bold": "In đậm (Ctrl+B)",
            ".ql-italic": "In nghiêng (Ctrl+I)",
            ".ql-underline": "Gạch chân (Ctrl+U)",
            ".ql-list[value='ordered']": "Danh sách có số thứ tự",
            ".ql-list[value='bullet']": "Danh sách chấm tròn",
            ".ql-link": "Chèn liên kết (Link)",
            ".ql-image": "Chèn hình ảnh (Từ máy hoặc Link)",
            ".ql-video": "Chèn Video (YouTube, Vimeo)",
            ".ql-clean": "Xóa định dạng (Clean formatting)",
        };

        const timer = setTimeout(() => {
            Object.entries(tooltipMap).forEach(([selector, title]) => {
                const el = document.querySelector(`.quill-admin-wrapper ${selector}`);
                if (el) el.setAttribute("title", title);
            });
        }, 1000); // Đợi Toolbar mount xong

        return () => clearTimeout(timer);
    }, []);

    // ── Insert Image Logic ─────────────────────────────────────────
    const insertImageContent = (url: string) => {
        if (!url) return;
        const editor = typeof quillRef.current?.getEditor === "function"
                ? quillRef.current.getEditor()
                : null;
        if (editor) {
            const range = editor.getSelection(true); // true để focus
            // Nếu không có selection rõ ràng, lấy index cuối, hoặc 0
            const index = range ? range.index : 0;
            // Chèn image node
            editor.insertEmbed(index, "image", url);
            // Dịch con trỏ ra sau ảnh vừa chèn
            editor.setSelection(index + 1);
        }
    };

    const handleUrlSubmit = () => {
        if (!inputUrl) return;
        insertImageContent(inputUrl);
        setIsImageModalOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Validate size (< 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast("Kích thước file vượt quá 5MB. Vui lòng nén ảnh lại.", "error");
                return;
            }

            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const fileName = `editor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

            // Upload to Supabase bucket 'product-images' 
            // (dùng chung cho cả bài viết vì cấu hình cho phép public access ảnh dài hạn)
            const { error, data } = await supabase.storage
                .from("product-images")
                .upload(fileName, file, { cacheControl: "3600", upsert: false });

            if (error) {
                console.error("Upload error:", error);
                throw new Error("Lỗi khi tải ảnh. Vui lòng thử lại.");
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("product-images")
                .getPublicUrl(fileName);

            insertImageContent(publicUrl);
            setIsImageModalOpen(false);
            toast("Đã thêm ảnh thành công!", "success");
        } catch (error: any) {
            toast(error.message, "error");
        } finally {
            setUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nội dung chi tiết
            </label>
            <div className="quill-admin-wrapper">
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    formats={QUILL_FORMATS}
                    readOnly={disabled || uploading}
                    placeholder="Nhập nội dung vào đây..."
                />
            </div>

            {/* Custom Image Insert Modal */}
            <Modal
                open={isImageModalOpen}
                onClose={() => !uploading && setIsImageModalOpen(false)}
                title="Chèn Hình ảnh"
                maxWidth="max-w-md"
                closeOnClickOutside={false}
            >
                <div className="p-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={() => setImageTab("upload")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                imageTab === "upload"
                                    ? "bg-white text-blue-600 shadow-sm border border-gray-200/60"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Upload className="h-4 w-4" />
                            Tải ảnh lên
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageTab("url")}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                                imageTab === "url"
                                    ? "bg-white text-blue-600 shadow-sm border border-gray-200/60"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <LinkIcon className="h-4 w-4" />
                            Link (URL)
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <div className="pt-2 min-h-[140px]">
                        {imageTab === "upload" && (
                            <div className="flex flex-col items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                                                <p className="text-sm text-gray-500">Đang tải ảnh từ máy lên...</p>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-blue-600">Nhấn để chọn ảnh</span> hoặc kéo thả</p>
                                                <p className="text-xs text-gray-400">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/webp" 
                                        onChange={handleFileUpload} 
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        )}

                        {imageTab === "url" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn ảnh đã có trên mạng:</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm outline-none"
                                        value={inputUrl}
                                        onChange={(e) => setInputUrl(e.target.value)}
                                        disabled={uploading}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsImageModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUrlSubmit}
                                        disabled={!inputUrl}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Chèn Ảnh
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
