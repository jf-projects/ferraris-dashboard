"use client";
import { useUser } from "@/app/hooks/useUser";
import { Menu } from "lucide-react";

type NavbarProps = {
    title: string;
    onMenuClick: () => void;
};

export default function Navbar({
    title,
    onMenuClick,
}: NavbarProps) {
    const { name, type, loading } = useUser()

    if (loading) {
        return null
    }
    
    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#02F5A1]/10 bg-[#07191E]/90 px-6 backdrop-blur-xl">

            {/* Left */}

            <div className="flex items-center gap-4">

                <button
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-slate-300 transition hover:bg-[#10272D] lg:hidden"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {title}
                    </h1>

                    <p className="text-sm text-slate-500">
                        Welcome back.
                    </p>
                </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-3">

                {/* Search */}

                {/* <div className="hidden items-center gap-3 rounded-xl border border-[#02F5A1]/10 bg-[#10272D] px-4 py-3 md:flex">

                    <Search
                        size={18}
                        className="text-slate-500"
                    />

                    <input
                        placeholder="Search..."
                        className="w-56 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />

                </div> */}

                {/* Theme */}

                {/* <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#02F5A1]/10 bg-[#10272D] text-slate-300 transition hover:border-[#02F5A1]/30 hover:text-[#02F5A1]">

                    <Sun size={18} />

                </button> */}

                {/* Notifications */}

                {/* <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#02F5A1]/10 bg-[#10272D] text-slate-300 transition hover:border-[#02F5A1]/30 hover:text-[#02F5A1]">

                    <Bell size={18} />

                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#02F5A1]" />

                </button> */}

                {/* User */}

                <button className="flex items-center gap-3 rounded-xl border border-[#02F5A1]/10 bg-[#10272D] px-3 py-2 transition hover:border-[#02F5A1]/30">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#02F5A1] font-semibold text-[#07191E]">
                        F
                    </div>

                    <div className="hidden text-left lg:block">

                        <p className="text-sm font-semibold text-white">
                            {name}
                        </p>

                        <p className="text-xs text-slate-500">
                            {type}
                        </p>

                    </div>

                </button>

            </div>

        </header>
    );
}