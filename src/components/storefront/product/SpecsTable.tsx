import type { SpecItem } from "@/lib/types/database";
import { SlidersHorizontal, ChevronRight } from "lucide-react";

interface SpecsTableProps {
    specs: SpecItem[];
}

export default function SpecsTable({ specs }: SpecsTableProps) {
    if (specs.length === 0) return null;

    return (
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden relative transition-all duration-300 hover:shadow-md hover:border-amber-200/60">

            {/* ── Header ─────────────────────────────────── */}
            <div className="relative border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm border border-gray-100/80">
                    <SlidersHorizontal className="h-[22px] w-[22px]" />
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 tracking-tight uppercase">
                    Thông số kỹ thuật
                </h3>
            </div>

            {/* ── Content ────────────────────────────────── */}
            <div className="relative bg-white p-2 z-10">
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        {specs.map((spec, idx) => (
                            <tr
                                key={idx}
                                className="group transition-all duration-200 hover:bg-amber-50/60 even:bg-gray-50/50"
                            >
                                <td className="w-[45%] lg:w-2/5 px-4 py-3.5 align-top">
                                    <div className="flex items-start gap-2 text-gray-500 group-hover:text-amber-700 transition-colors">
                                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity text-amber-500" />
                                        <span className="font-medium whitespace-pre-wrap">{spec.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-gray-900 break-words">
                                    <span className="font-semibold text-gray-800 leading-relaxed">{spec.value}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
