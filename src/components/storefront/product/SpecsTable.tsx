import type { SpecItem } from "@/lib/types/database";

interface SpecsTableProps {
    specs: SpecItem[];
}

export default function SpecsTable({ specs }: SpecsTableProps) {
    if (specs.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        <th
                            colSpan={2}
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                            Thông số kỹ thuật
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {specs.map((spec, idx) => (
                        <tr
                            key={idx}
                            className="transition-colors hover:bg-amber-50/50"
                        >
                            <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-600">
                                {spec.name}
                            </td>
                            <td className="px-5 py-3 text-gray-900">{spec.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
