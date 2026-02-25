"use client";

import { Plus, Trash2 } from "lucide-react";
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

            <button
                type="button"
                onClick={addRow}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
            >
                <Plus className="h-3.5 w-3.5" />
                Thêm thông số
            </button>
        </div>
    );
}
