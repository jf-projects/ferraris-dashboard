"use client"

import { useEffect, useState } from "react"
import {
    Users,
    Building2,
    Wallet,
    AlertCircle,
} from "lucide-react"

interface DashboardData {
    totalClients: number
    activeProperties: number
    totalCollection: number
    outstandingBalance: number
}

export default function DashboardStats() {

    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchDashboard() {
        try {
            const response = await fetch("/api/dashboard")
            const result = await response.json()

            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error("Failed to load dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadData = () => {
            fetchDashboard()
        }
        loadData();
    }, [])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0,
        }).format(value)
    }

    const stats = [
        {
            title: "Total Clients",
            value: data?.totalClients ?? 0,
            description: "Active clients",
            icon: Users,
        },
        {
            title: "Active Properties",
            value: data?.activeProperties ?? 0,
            description: "Active transactions",
            icon: Building2,
        },
        {
            title: "Total Collection",
            value: formatCurrency(
                data?.totalCollection ?? 0
            ),
            description: "Total payments received",
            icon: Wallet,
        },
        {
            title: "Outstanding Balance",
            value: formatCurrency(
                data?.outstandingBalance ?? 0
            ),
            description: "Remaining balance",
            icon: AlertCircle,
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => {

                const Icon = stat.icon

                return (
                    <div
                        key={stat.title}
                        className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-5"
                    >

                        <div className="flex items-start justify-between">

                            <div>

                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    {stat.title}
                                </p>

                                <div className="mt-3">

                                    {loading ? (
                                        <div className="h-8 w-28 animate-pulse rounded bg-[#16343B]" />
                                    ) : (
                                        <h2 className="text-2xl font-semibold text-white">
                                            {stat.value}
                                        </h2>
                                    )}

                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    {stat.description}
                                </p>

                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02F5A1]/10 text-[#02F5A1]">
                                <Icon className="h-5 w-5" />
                            </div>

                        </div>

                    </div>
                )
            })}

        </div>
    )
}