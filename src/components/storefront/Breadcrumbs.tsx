import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <Link
                href="/"
                className="flex items-center gap-1 text-gray-400 transition-colors hover:text-amber-600"
            >
                <Home className="h-4 w-4" />
            </Link>

            {items.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-400 transition-colors hover:text-amber-600"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-700">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
