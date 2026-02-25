import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    /** Tailwind color class tùy biến */
    color?: "blue" | "emerald" | "amber" | "red";
    href?: string;
}

const COLOR_MAP = {
    blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        value: "text-blue-700",
        ring: "ring-blue-100",
    },
    emerald: {
        bg: "bg-emerald-50",
        icon: "text-emerald-600",
        value: "text-emerald-700",
        ring: "ring-emerald-100",
    },
    amber: {
        bg: "bg-amber-50",
        icon: "text-amber-600",
        value: "text-amber-700",
        ring: "ring-amber-100",
    },
    red: {
        bg: "bg-red-50",
        icon: "text-red-600",
        value: "text-red-700",
        ring: "ring-red-100",
    },
} as const;

export default function StatCard({
    title,
    value,
    icon: Icon,
    color = "blue",
}: StatCardProps) {
    const c = COLOR_MAP[color];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md",
                `ring-1 ${c.ring}`
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className={cn("mt-2 text-3xl font-bold", c.value)}>
                        {value.toLocaleString("vi-VN")}
                    </p>
                </div>
                <div className={cn("rounded-xl p-3", c.bg)}>
                    <Icon className={cn("h-6 w-6", c.icon)} />
                </div>
            </div>

            {/* Decorative gradient arc */}
            <div
                className={cn("absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-10", c.bg)}
                style={{ filter: "blur(16px)" }}
            />
        </div>
    );
}
