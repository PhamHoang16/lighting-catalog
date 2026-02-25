import { cn } from "@/lib/utils";
import { QUOTE_STATUS_MAP, type QuoteStatus } from "@/lib/types/database";

interface QuoteStatusBadgeProps {
    status: string;
}

export default function QuoteStatusBadge({ status }: QuoteStatusBadgeProps) {
    const config = QUOTE_STATUS_MAP[status as QuoteStatus] ?? {
        label: status,
        bg: "bg-gray-100",
        text: "text-gray-600",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                config.bg,
                config.text
            )}
        >
            {config.label}
        </span>
    );
}
