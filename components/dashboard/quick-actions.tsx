"use client"

import Link from "next/link"
import {
    UserPlus,
    FilePlus2,
    CreditCard,
    ArrowRight,
    User
} from "lucide-react"

const actions = [
    {
        title: "Add Client",
        description: "Create a new client",
        href: "/clients/create",
        icon: UserPlus,
    },
    {
        title: "Add Transaction",
        description: "Create a lot transaction",
        href: "/lot-transactions/create",
        icon: FilePlus2,
    },
    {
        title: "Add User",
        description: "Record a new user",
        href: "/users/create",
        icon: User,
    },
]

export default function QuickActions() {
    return (
        <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-5">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-white">
                    Quick Actions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Frequently used actions
                </p>
            </div>

            <div className="space-y-3">
                {actions.map((action) => {
                    const Icon = action.icon

                    return (
                        <Link
                            key={action.title}
                            href={action.href}
                            className="group flex items-center gap-3 rounded-xl border border-[#1f3a40] bg-[#07191E] p-3 transition hover:border-[#02F5A1]/40 hover:bg-[#16343B]"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#02F5A1]/10 text-[#02F5A1] transition group-hover:bg-[#02F5A1] group-hover:text-[#07191E]">
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white">
                                    {action.title}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {action.description}
                                </p>
                            </div>

                            <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-[#02F5A1]" />
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}