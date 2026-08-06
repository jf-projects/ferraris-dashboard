"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    CalendarDays,
    FileText,
    UserRound,
    ChartColumn,
    Bell,
    Settings,
    LogOut,
} from "lucide-react";

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const mainMenu = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Properties", href: "/properties", icon: Building2 },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Calendar", href: "/calendar", icon: CalendarDays },
    { title: "Documents", href: "/documents", icon: FileText },
];

const managementMenu = [
    { title: "Agents", href: "/agents", icon: UserRound },
    { title: "Reports", href: "/reports", icon: ChartColumn },
    { title: "Notifications", href: "/notifications", icon: Bell },
];

const accountMenu = [
    { title: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
    isOpen,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            onClose();

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const renderMenu = (
        items: {
            title: string;
            href: string;
            icon: React.ElementType;
        }[]
    ) =>
        items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex h-12 items-center gap-3 rounded-xl px-4 transition-all duration-200 ${active
                            ? "bg-[#02F5A1] text-[#07191E] shadow-lg shadow-[#02F5A1]/20"
                            : "text-slate-400 hover:bg-[#10272D] hover:text-white"
                        }`}
                >
                    <Icon size={20} />
                    <span className="text-sm font-medium">
                        {item.title}
                    </span>
                </Link>
            );
        });

    return (
        <>
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50
                    flex h-screen w-70 flex-col
                    border-r border-[#02F5A1]/10
                    bg-[#07191E]
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:static
                    lg:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="flex h-20 items-center border-b border-[#02F5A1]/10 px-6">
                    <div className="mr-3 h-3 w-3 rounded-full bg-[#02F5A1]" />

                    <div>
                        <h1 className="text-lg font-bold text-white">
                            JF Admin
                        </h1>

                        <p className="text-xs text-slate-500">
                            Dashboard
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Main
                    </p>

                    <div className="space-y-2">
                        {renderMenu(mainMenu)}
                    </div>

                    <div className="my-8 border-t border-[#02F5A1]/10" />

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Management
                    </p>

                    <div className="space-y-2">
                        {renderMenu(managementMenu)}
                    </div>

                    <div className="my-8 border-t border-[#02F5A1]/10" />

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Account
                    </p>

                    <div className="space-y-2">
                        {renderMenu(accountMenu)}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[#02F5A1]/10 p-4">
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#10272D] p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02F5A1] font-semibold text-[#07191E]">
                            JF
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-white">
                                Jayson
                            </p>

                            <p className="text-xs text-slate-500">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={20} />

                        <span className="text-sm font-medium">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}