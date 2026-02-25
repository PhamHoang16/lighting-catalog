"use client";

import { useState, useRef } from "react";
import { Upload, Link2, X, ImageOff, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ImageMode = "upload" | "url";

// ── Một "pending image" có thể là File hoặc URL ────────────────
export interface PendingImage {
    id: string; // unique key for React
    type: "file" | "url";
    file?: File;
    url: string; // preview URL (objectURL hoặc external URL)
}

// ── Props ───────────────────────────────────────────────────────
interface ImageUploaderProps {
    /** Label hiển thị */
    label: string;
    /** Cho phép chọn nhiều ảnh */
    multiple?: boolean;
    /** Danh sách ảnh hiện tại (URLs từ DB — khi edit) */
    existingUrls: string[];
    /** Danh sách ảnh pending (file hoặc URL mới chưa submit) */
    pendingImages: PendingImage[];
    onPendingChange: (images: PendingImage[]) => void;
    onExistingRemove: (url: string) => void;
    disabled?: boolean;
}

export default function ImageUploader({
    label,
    multiple = false,
    existingUrls,
    pendingImages,
    onPendingChange,
    onExistingRemove,
    disabled = false,
}: ImageUploaderProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<ImageMode>("upload");
    const [urlInput, setUrlInput] = useState("");

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const valid: PendingImage[] = [];

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast(`"${file.name}" — Chỉ chấp nhận JPG, PNG, WebP.`, "error");
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                toast(`"${file.name}" — File vượt quá 5MB.`, "error");
                continue;
            }
            valid.push({
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                type: "file",
                file,
                url: URL.createObjectURL(file),
            });
        }

        if (valid.length === 0) return;

        if (multiple) {
            onPendingChange([...pendingImages, ...valid]);
        } else {
            // Single: replace
            pendingImages.forEach((img) => {
                if (img.type === "file") URL.revokeObjectURL(img.url);
            });
            onPendingChange(valid.slice(0, 1));
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleAddUrl() {
        const trimmed = urlInput.trim();
        if (!trimmed) return;

        const img: PendingImage = {
            id: `url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: "url",
            url: trimmed,
        };

        if (multiple) {
            onPendingChange([...pendingImages, img]);
        } else {
            pendingImages.forEach((i) => {
                if (i.type === "file") URL.revokeObjectURL(i.url);
            });
            onPendingChange([img]);
        }
        setUrlInput("");
    }

    function removePending(id: string) {
        const img = pendingImages.find((i) => i.id === id);
        if (img?.type === "file") URL.revokeObjectURL(img.url);
        onPendingChange(pendingImages.filter((i) => i.id !== id));
    }

    const allImages = [
        ...existingUrls.map((url) => ({ key: `existing-${url}`, url, isExisting: true })),
        ...pendingImages.map((img) => ({ key: img.id, url: img.url, isExisting: false })),
    ];

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>

            {/* Mode tabs */}
            <div className="mb-2 flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === "upload"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Upload className="h-3.5 w-3.5" />
                    Tải lên
                </button>
                <button
                    type="button"
                    onClick={() => setMode("url")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === "url"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Link2 className="h-3.5 w-3.5" />
                    Dán URL
                </button>
            </div>

            {/* Input area */}
            {mode === "upload" ? (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    disabled={disabled}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-blue-600 hover:file:bg-blue-100 disabled:opacity-60"
                />
            ) : (
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddUrl();
                            }
                        }}
                        disabled={disabled}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={handleAddUrl}
                        disabled={disabled || !urlInput.trim()}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            )}

            <p className="mt-1 text-xs text-gray-400">
                JPG, PNG, WebP — Tối đa 5MB
                {multiple && " — Có thể chọn nhiều ảnh"}
            </p>

            {/* Preview grid */}
            {allImages.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {allImages.map((img) => (
                        <div
                            key={img.key}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                        >
                            <ImagePreview src={img.url} />
                            <button
                                type="button"
                                onClick={() =>
                                    img.isExisting
                                        ? onExistingRemove(img.url)
                                        : removePending(img.key)
                                }
                                disabled={disabled}
                                className="absolute right-1 top-1 rounded-full bg-gray-900/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                aria-label="Xóa ảnh"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ImagePreview({ src }: { src: string }) {
    const [err, setErr] = useState(false);
    if (err) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <ImageOff className="h-5 w-5 text-gray-300" />
            </div>
        );
    }
    return (
        <img
            src={src}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setErr(true)}
        />
    );
}
