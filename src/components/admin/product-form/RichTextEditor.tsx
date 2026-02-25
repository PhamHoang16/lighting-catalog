"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import react-quill-new (SSR incompatible)
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
    ),
});

const QUILL_MODULES = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const QUILL_FORMATS = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "link",
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
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mô tả chi tiết
            </label>
            <div className="quill-admin-wrapper">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    readOnly={disabled}
                    placeholder="Nhập mô tả sản phẩm..."
                />
            </div>
        </div>
    );
}
