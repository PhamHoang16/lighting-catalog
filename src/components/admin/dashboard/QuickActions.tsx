import Link from "next/link";
import {
    Plus,
    FileText,
    FolderOpen,
    ExternalLink,
} from "lucide-react";

const ACTIONS = [
    {
        label: "Thêm sản phẩm",
        href: "/admin/san-pham",
        icon: Plus,
        color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
        label: "Quản lý danh mục",
        href: "/admin/danh-muc",
        icon: FolderOpen,
        color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    },
    {
        label: "Xem báo giá",
        href: "/admin/yeu-cau-bao-gia",
        icon: FileText,
        color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    },
    {
        label: "Xem Storefront",
        href: "/",
        icon: ExternalLink,
        color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    },
] as const;

export default function QuickActions() {
    return (
        <div className="space-y-2">
            {ACTIONS.map((action) => (
                <Link
                    key={action.href}
                    href={action.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${action.color}`}
                >
                    <action.icon className="h-5 w-5" />
                    {action.label}
                </Link>
            ))}
        </div>
    );
}
