import { ORDER_STATUS_MAP, type OrderStatus } from "@/lib/types/database";

interface OrderStatusBadgeProps {
    status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = ORDER_STATUS_MAP[status as OrderStatus] ?? {
        label: status,
        bg: "bg-gray-50",
        text: "text-gray-700",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}
