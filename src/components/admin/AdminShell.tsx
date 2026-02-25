"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gray-50/50">
                {/* Sidebar */}
                <AdminSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main content area — offset by sidebar width on desktop */}
                <div className="lg:pl-64">
                    {/* Header */}
                    <AdminHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

                    {/* Page content */}
                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}

