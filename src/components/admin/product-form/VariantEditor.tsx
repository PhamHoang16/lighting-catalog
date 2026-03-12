"use client";

import { Plus, X, Layers, DollarSign, Package2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { VariantOption, VariantItem, VariantsData } from "@/lib/types/database";

interface VariantEditorProps {
    value: VariantsData | null;
    onChange: (data: VariantsData | null) => void;
    basePrice: number;
}

export default function VariantEditor({ value, onChange, basePrice }: VariantEditorProps) {
    const [enabled, setEnabled] = useState(!!value);
    const backupRef = useRef<VariantsData>({ options: [], variants: [] });

    useEffect(() => {
        if (value) {
            backupRef.current = value;
            setEnabled(true);
        } else {
            setEnabled(false);
        }
    }, [value]);

    const options = value?.options ?? [];
    const variants = value?.variants ?? [];

    function toggleEnabled() {
        if (enabled) {
            onChange(null);
        } else {
            onChange(backupRef.current);
        }
    }

    // ── Option groups ────────────────────────────────────────────
    function addOptionGroup() {
        const newOptions: VariantOption[] = [...options, { name: "", values: [] }];
        onChange({ options: newOptions, variants: generateVariants(newOptions, variants, basePrice) });
    }

    function updateOptionName(idx: number, name: string) {
        const newOptions = options.map((o, i) => (i === idx ? { ...o, name } : o));
        onChange({ options: newOptions, variants: generateVariants(newOptions, variants, basePrice) });
    }

    function removeOptionGroup(idx: number) {
        const newOptions = options.filter((_, i) => i !== idx);
        onChange({
            options: newOptions,
            variants: newOptions.length > 0 ? generateVariants(newOptions, [], basePrice) : [],
        });
    }

    function addOptionValue(groupIdx: number, val: string) {
        if (!val.trim()) return;
        const newOptions = options.map((o, i) =>
            i === groupIdx ? { ...o, values: [...o.values, val.trim()] } : o
        );
        onChange({ options: newOptions, variants: generateVariants(newOptions, variants, basePrice) });
    }

    function removeOptionValue(groupIdx: number, valueIdx: number) {
        const newOptions = options.map((o, i) =>
            i === groupIdx
                ? { ...o, values: o.values.filter((_, vi) => vi !== valueIdx) }
                : o
        );
        onChange({ options: newOptions, variants: generateVariants(newOptions, variants, basePrice) });
    }

    // ── Variant price/stock editing ──────────────────────────────
    function updateVariant(idx: number, field: "price" | "stock" | "sku", val: string) {
        const newVariants = variants.map((v, i) => {
            if (i !== idx) return v;
            if (field === "price") return { ...v, price: val === "" ? -1 : parseFloat(val) || 0 };
            if (field === "stock") return { ...v, stock: val === "" ? -1 : parseInt(val) || 0 };
            return { ...v, sku: val };
        });
        onChange({ options, variants: newVariants });
    }

    return (
        <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Biến thể sản phẩm</p>
                        <p className="text-xs text-gray-400">Công suất, Màu sắc, Kích thước...</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={toggleEnabled}
                    className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-blue-500" : "bg-gray-300"}`}
                >
                    <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`}
                    />
                </button>
            </div>

            {enabled && (
                <>
                    {/* ── Option Groups ──────────────────────────── */}
                    {options.map((opt, groupIdx) => (
                        <div key={groupIdx} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Tên nhóm (VD: Công suất)"
                                    value={opt.name}
                                    onChange={(e) => updateOptionName(groupIdx, e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOptionGroup(groupIdx)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Values */}
                            <div className="flex flex-wrap gap-2">
                                {opt.values.map((v, vi) => (
                                    <span
                                        key={vi}
                                        className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                    >
                                        {v}
                                        <button
                                            type="button"
                                            onClick={() => removeOptionValue(groupIdx, vi)}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                <AddValueInput onAdd={(val) => addOptionValue(groupIdx, val)} />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addOptionGroup}
                        className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm nhóm tùy chọn
                    </button>

                    {/* ── Variants Table ─────────────────────────── */}
                    {variants.length > 0 && (
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left">
                                            <th className="px-4 py-2.5 font-semibold text-gray-600">Tổ hợp</th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 w-32">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    Giá (₫)
                                                </div>
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 w-28">
                                                <div className="flex items-center gap-1">
                                                    <Package2 className="h-3.5 w-3.5" />
                                                    Tồn kho
                                                </div>
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold text-gray-600 w-28">SKU</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {variants.map((variant, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-1.5">
                                                        {variant.combination.map((c, ci) => (
                                                            <span
                                                                key={ci}
                                                                className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                                            >
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price === -1 ? "" : variant.price}
                                                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                                                        placeholder={String(basePrice)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.stock === -1 ? "" : variant.stock}
                                                        onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                                                        placeholder="0"
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.sku ?? ""}
                                                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                                        placeholder="—"
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ── Inline add value input ──────────────────────────────────────
function AddValueInput({ onAdd }: { onAdd: (val: string) => void }) {
    const [val, setVal] = useState("");

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (val.trim()) {
                onAdd(val);
                setVal("");
            }
        }
    }

    return (
        <input
            type="text"
            placeholder="+ Thêm giá trị"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                if (val.trim()) {
                    onAdd(val);
                    setVal("");
                }
            }}
            className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500 focus:border-blue-400 focus:outline-none w-28"
        />
    );
}

// ── Generate cartesian product of options ────────────────────────
function generateVariants(
    options: VariantOption[],
    existingVariants: VariantItem[],
    basePrice: number
): VariantItem[] {
    const validOptions = options.filter((o) => o.values.length > 0);
    if (validOptions.length === 0) return [];

    // Build cartesian product
    let combos: string[][] = validOptions[0].values.map((v) => [v]);
    for (let i = 1; i < validOptions.length; i++) {
        const newCombos: string[][] = [];
        for (const combo of combos) {
            for (const val of validOptions[i].values) {
                newCombos.push([...combo, val]);
            }
        }
        combos = newCombos;
    }

    // Map to VariantItems, preserving existing price/stock if combo matches
    return combos.map((combo) => {
        const existing = existingVariants.find(
            (v) => JSON.stringify(v.combination) === JSON.stringify(combo)
        );
        return existing ?? { combination: combo, price: basePrice, stock: 999, sku: "" };
    });
}
