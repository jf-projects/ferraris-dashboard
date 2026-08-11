"use client"

import { useEffect, useState } from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

type Collection = {
    month: string
    total: number
}

export default function CollectionsOverview() {
    const [data, setData] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCollections() {
            try {
                const response = await fetch(
                    "/api/dashboard/collection"
                )

                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchCollections()
    }, [])

    const total = data.reduce(
        (sum, item) => sum + item.total,
        0
    )

    const formatAmount = (amount: number) => {
        if (amount >= 1_000_000) {
            return `₱${(amount / 1_000_000).toFixed(1)}M`
        }

        if (amount >= 1_000) {
            return `₱${(amount / 1_000).toFixed(0)}K`
        }

        return `₱${amount.toLocaleString("en-PH")}`
    }

    return (
        <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6 mt-2">

            <div className="mb-6">
                <p className="text-sm font-medium text-slate-400">
                    Collections Overview
                </p>

                <h2 className="mt-2 text-3xl font-semibold text-white">
                    {loading ? "..." : formatAmount(total)}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Total collections this past 12 months
                </p>
            </div>

            <div className="h-65 w-full">
                {!loading && (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="collectionGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#02F5A1"
                                        stopOpacity={0.25}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#02F5A1"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#64748b",
                                    fontSize: 12,
                                }}
                            />

                            <YAxis hide />

                            <Tooltip
                                contentStyle={{
                                    background: "#07191E",
                                    border: "1px solid #1f3a40",
                                    borderRadius: "10px",
                                }}
                                labelStyle={{
                                    color: "#94a3b8",
                                }}
                                formatter={(value) => [
                                    `₱${Number(
                                        value
                                    ).toLocaleString("en-PH")}`,
                                    "Collections",
                                ]}
                            />

                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#02F5A1"
                                strokeWidth={2}
                                fill="url(#collectionGradient)"
                                dot={false}
                                activeDot={{
                                    r: 5,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}