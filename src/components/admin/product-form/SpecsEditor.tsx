"use client";

import { useState } from "react";
import { Plus, Trash2, ClipboardPaste, Check, X } from "lucide-react";
import type { SpecItem } from "@/lib/types/database";

interface SpecsEditorProps {
    specs: SpecItem[];
    onChange: (specs: SpecItem[]) => void;
    disabled?: boolean;
}

export default function SpecsEditor({
    specs,
    onChange,
    disabled = false,
}: SpecsEditorProps) {
    const [showPasteBox, setShowPasteBox] = useState(false);
    const [pasteText, setPasteText] = useState("");

    function handleQuickPaste() {
        if (!pasteText.trim()) return;

        const lines = pasteText.split(/\r?\n/);
        const newSpecs: SpecItem[] = [];

        for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.includes("\t")) {
                const parts = cleanLine.split("\t");
                newSpecs.push({
                    name: parts[0]?.trim() || "",
                    value: parts.slice(1).join(" ").trim() || "",
                });
            } else if (cleanLine.includes(":")) {
                const [key, ...rest] = cleanLine.split(":");
                newSpecs.push({
                    name: key?.trim() || "",
                    value: rest.join(":").trim() || "",
                });
            } else {
                newSpecs.push({ name: cleanLine, value: "" });
            }
        }

        if (newSpecs.length > 0) {
            onChange([...specs, ...newSpecs]);
        }
        setPasteText("");
        setShowPasteBox(false);
    }

    function addRow() {
        onChange([...specs, { name: "", value: "" }]);
    }

    function updateRow(index: number, field: keyof SpecItem, val: string) {
        const updated = specs.map((s, i) =>
            i === index ? { ...s, [field]: val } : s
        );
        onChange(updated);
    }

    function removeRow(index: number) {
        onChange(specs.filter((_, i) => i !== index));
    }

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Thông số kỹ thuật
            </label>

            {specs.length > 0 && (
                <div className="mb-2 space-y-2">
                    {specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Tên thông số"
                                value={spec.name}
                                onChange={(e) => updateRow(idx, "name", e.target.value)}
                                disabled={disabled}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                            />
                            <input
                                type="text"
                                placeholder="Giá trị"
                                value={spec.value}
                                onChange={(e) => updateRow(idx, "value", e.target.value)}
                                disabled={disabled}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(idx)}
                                disabled={disabled}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                aria-label="Xóa thông số"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={addRow}
                    disabled={disabled}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm thông số
                </button>

                <button
                    type="button"
                    onClick={() => setShowPasteBox(!showPasteBox)}
                    disabled={disabled}
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Nhập nhanh từ văn bản
                </button>
            </div>

            {showPasteBox && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
                    <label className="mb-2 block text-xs font-medium text-blue-700">
                        Dán nguyên khối văn bản copy từ web khác hoặc Excel (cách nhau bởi " : " hoặc Tab)
                    </label>
                    <textarea
                        rows={5}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder="Ví dụ:&#10;Hãng sản xuất : GX Lighting&#10;Công suất: 10W&#10;Bảo hành: 3 năm"
                        className="w-full rounded-md border border-gray-200 p-2.5 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowPasteBox(false);
                                setPasteText("");
                            }}
                            className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                        >
                            <X className="h-3.5 w-3.5" />
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleQuickPaste}
                            className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm shadow-blue-500/20"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Phân tích & Thêm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
