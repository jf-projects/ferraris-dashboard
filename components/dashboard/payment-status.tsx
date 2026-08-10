"use client"

import { useEffect, useState } from "react"
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
} from "recharts"

type PaymentStatus = {
    name: string
    value: number
}

export default function PaymentStatus() {
    const [data, setData] = useState<PaymentStatus[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStatus() {
            try {
                const response = await fetch(
                    "/api/dashboard/payment-status"
                )

                const result = await response.json()

                if (result.success) {
                    setData([
                        {
                            name: "Paid",
                            value: result.data.paid,
                        },
                        {
                            name: "Partial",
                            value: result.data.partial,
                        },
                        {
                            name: "Overdue",
                            value: result.data.overdue,
                        },
                    ])
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [])

    const total = data.reduce(
        (sum, item) => sum + item.value,
        0
    )

    const getPercentage = (value: number) => {
        if (!total) return 0

        return Math.round((value / total) * 100)
    }

    return (
        <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6">

            <p className="text-sm font-medium text-slate-400">
                Payment Status
            </p>

            <div className="relative mt-4 h-47.5">

                {!loading && (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={3}
                                stroke="none"
                            >
                                <Cell fill="#02F5A1" />
                                <Cell fill="#38BDF8" />
                                <Cell fill="#EF4444" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-white">
                        {total}
                    </span>

                    <span className="text-xs text-slate-500">
                        Accounts
                    </span>
                </div>

            </div>

            <div className="space-y-3">

                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">

                            <span
                                className={[
                                    "h-2.5 w-2.5 rounded-full",
                                    "bg-[#02F5A1]",
                                    "bg-[#38BDF8]",
                                    "bg-[#EF4444]",
                                ][index]}
                            />

                            <span className="text-sm text-slate-300">
                                {item.name}
                            </span>

                        </div>

                        <span className="text-sm font-medium text-white">
                            {getPercentage(item.value)}%
                        </span>
                    </div>
                ))}

            </div>

        </div>
    )
}