"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#07191E]">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-1 flex-col">

                <Navbar
                    title="Dashboard"
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}