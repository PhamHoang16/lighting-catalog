import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
    title: {
        default: "Admin Dashboard",
        template: "%s | Admin - Led Xinh",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <AdminShell>{children}</AdminShell>;
}
