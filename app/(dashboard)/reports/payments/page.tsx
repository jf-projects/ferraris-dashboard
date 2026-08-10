/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import * as XLSX from "xlsx"

type Payment = {
    id: number
    lotTransactionId: number
    amount: number
    bank: string | null
    paymentDate: string
    remarks: string | null
    createdAt: string
    updatedAt: string
    client: {
        id: number
        name: string
    }
    property: {
        unit: string | null
        block: string | null
        lot: string | null
    }
}

type Report = {
    year: number
    month: number
    monthName: string
    summary: {
        total: number
        paymentCount: number
        average: number
        highest: number
    }
    payments: Payment[]
}

export default function PaymentReportPage() {
    const currentDate = new Date()

    const [year, setYear] = useState(currentDate.getFullYear())
    const [month, setMonth] = useState(currentDate.getMonth() + 1)

    const [report, setReport] = useState<Report | null>(null)
    const [loading, setLoading] = useState(false)

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const formatCurrency = (value: number) => {
        return value.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        })
    }

    const fetchReport = async () => {
        try {
            setLoading(true)

            const res = await fetch(
                `/api/reports/payments?year=${year}&month=${month}`
            )

            const result = await res.json()

            console.log("REPORT RESPONSE:", result)

            if (!res.ok || !result.success) {
                setReport(null)
                return
            }

            const payments: Payment[] = result.payments || []

            const highest = payments.length
                ? Math.max(
                    ...payments.map((payment) =>
                        Number(payment.amount || 0)
                    )
                )
                : 0

            setReport({
                year: result.period.year,
                month: result.period.month,
                monthName: months[result.period.month - 1],
                summary: {
                    total: Number(result.summary.total || 0),
                    paymentCount: Number(
                        result.summary.paymentCount || 0
                    ),
                    average: Number(
                        result.summary.averagePayment || 0
                    ),
                    highest,
                },
                payments,
            })
        } catch (error) {
            console.error("Failed to load report:", error)
            setReport(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const loadData = () => {
            fetchReport()
        }
        loadData();
    }, [year, month])

    const downloadReport = () => {
        if (!report) return

        const rows: any[][] = []

        // Company heading
        rows.push(["FERRARIS REALTY"])
        rows.push(["Real Estate & Property Services"])
        rows.push(["Angeles City, Pampanga"])
        rows.push([])

        // Report heading
        rows.push(["PAYMENT REPORT"])
        rows.push([
            `${report.monthName} ${report.year}`,
        ])
        rows.push([])

        // Summary
        rows.push(["SUMMARY"])

        rows.push([
            "Total Collections",
            report.summary.total,
        ])

        rows.push([
            "Number of Payments",
            report.summary.paymentCount,
        ])

        rows.push([
            "Average Payment",
            report.summary.average,
        ])

        rows.push([
            "Highest Payment",
            report.summary.highest,
        ])

        rows.push([])

        // Payment details
        rows.push(["PAYMENT DETAILS"])

        rows.push([
            "Payment ID",
            "Date",
            "Client Name",
            "Property",
            "Bank",
            "Amount",
            "Remarks",
        ])

        report.payments.forEach((payment) => {
            rows.push([
                payment.id,
                new Date(
                    payment.paymentDate
                ).toLocaleDateString("en-PH"),

                payment.client?.name || "-",

                `${payment.property?.unit || "-"} | Block ${payment.property?.block || "-"
                } | Lot ${payment.property?.lot || "-"}`,

                payment.bank || "-",

                Number(payment.amount),

                payment.remarks || "-",
            ])
        })

        rows.push([])

        rows.push([
            `Generated on: ${new Date().toLocaleString(
                "en-PH"
            )}`,
        ])

        const worksheet = XLSX.utils.aoa_to_sheet(rows)

        worksheet["!cols"] = [
            { wch: 14 },
            { wch: 16 },
            { wch: 30 },
            { wch: 40 },
            { wch: 20 },
            { wch: 18 },
            { wch: 30 },
        ]

        worksheet["!merges"] = [
            {
                s: { r: 0, c: 0 },
                e: { r: 0, c: 6 },
            },
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: 6 },
            },
            {
                s: { r: 2, c: 0 },
                e: { r: 2, c: 6 },
            },
            {
                s: { r: 4, c: 0 },
                e: { r: 4, c: 6 },
            },
            {
                s: { r: 5, c: 0 },
                e: { r: 5, c: 6 },
            },
        ]

        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Payment Report"
        )

        XLSX.writeFile(
            workbook,
            `Payment-Report-${year}-${String(month).padStart(
                2,
                "0"
            )}.xlsx`
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-widest text-[#02F5A1]">
                        Ferraris Realty
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Payment Report
                    </h1>

                    <p className="mt-1 text-slate-400">
                        View payment collections by month.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {/* Month */}
                    <select
                        value={month}
                        onChange={(e) =>
                            setMonth(Number(e.target.value))
                        }
                        className="rounded-lg border border-slate-700 bg-[#07191E] px-4 py-2 text-white"
                    >
                        {months.map((name, index) => (
                            <option
                                key={name}
                                value={index + 1}
                            >
                                {name}
                            </option>
                        ))}
                    </select>

                    {/* Year */}
                    <select
                        value={year}
                        onChange={(e) =>
                            setYear(Number(e.target.value))
                        }
                        className="rounded-lg border border-slate-700 bg-[#07191E] px-4 py-2 text-white"
                    >
                        {Array.from(
                            { length: 10 },
                            (_, index) =>
                                currentDate.getFullYear() -
                                index
                        ).map((value) => (
                            <option
                                key={value}
                                value={value}
                            >
                                {value}
                            </option>
                        ))}
                    </select>

                    {/* Download */}
                    <button
                        onClick={downloadReport}
                        disabled={!report || loading}
                        className="rounded-lg bg-[#02F5A1] px-4 py-2 font-medium text-[#07191E] hover:bg-[#00d98f] disabled:opacity-50"
                    >
                        Download Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="rounded-xl border border-slate-800 bg-[#07191E] p-10 text-center text-slate-400">
                    Loading report...
                </div>
            ) : report ? (
                <>
                    {/* Report Heading */}
                    <div className="rounded-xl border border-slate-800 bg-[#07191E] p-6">
                        <p className="text-sm font-medium uppercase tracking-widest text-[#02F5A1]">
                            Ferraris Realty
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Payment Report
                        </h2>

                        <p className="mt-1 text-slate-400">
                            {report.monthName}{" "}
                            {report.year}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Collections"
                            value={formatCurrency(
                                report.summary.total
                            )}
                        />

                        <SummaryCard
                            title="Number of Payments"
                            value={report.summary.paymentCount.toString()}
                        />

                        <SummaryCard
                            title="Average Payment"
                            value={formatCurrency(
                                report.summary.average
                            )}
                        />

                        <SummaryCard
                            title="Highest Payment"
                            value={formatCurrency(
                                report.summary.highest
                            )}
                        />
                    </div>

                    {/* Payment Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#07191E]">
                        <div className="border-b border-slate-800 px-6 py-4">
                            <h3 className="font-semibold text-white">
                                Payment Details
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                {report.summary.paymentCount}{" "}
                                payments recorded for{" "}
                                {report.monthName}{" "}
                                {report.year}.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-slate-400">
                                        <th className="px-6 py-4">
                                            Date
                                        </th>

                                        <th className="px-6 py-4">
                                            Client
                                        </th>

                                        <th className="px-6 py-4">
                                            Property
                                        </th>

                                        <th className="px-6 py-4">
                                            Bank
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.payments.length > 0 ? (
                                        report.payments.map(
                                            (payment) => (
                                                <tr
                                                    key={payment.id}
                                                    className="border-b border-slate-800 last:border-0"
                                                >
                                                    {/* Date */}
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {new Date(
                                                            payment.paymentDate
                                                        ).toLocaleDateString(
                                                            "en-PH"
                                                        )}
                                                    </td>

                                                    {/* Client */}
                                                    <td className="px-6 py-4 font-medium text-white">
                                                        {payment.client?.name ||
                                                            "-"}
                                                    </td>

                                                    {/* Property */}
                                                    <td className="px-6 py-4 text-slate-300">
                                                        <div className="font-medium">
                                                            {payment
                                                                .property
                                                                ?.unit ||
                                                                "-"}
                                                        </div>

                                                        <div className="text-xs text-slate-500">
                                                            Block{" "}
                                                            {payment
                                                                .property
                                                                ?.block ||
                                                                "-"}{" "}
                                                            • Lot{" "}
                                                            {payment
                                                                .property
                                                                ?.lot ||
                                                                "-"}
                                                        </div>
                                                    </td>

                                                    {/* Bank */}
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {payment.bank ||
                                                            "-"}
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-6 py-4 text-right font-medium text-[#02F5A1]">
                                                        {formatCurrency(
                                                            Number(
                                                                payment.amount
                                                            )
                                                        )}
                                                    </td>

                                                    {/* Remarks */}
                                                    <td className="px-6 py-4 text-slate-400">
                                                        {payment.remarks ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-10 text-center text-slate-400"
                                            >
                                                No payments found
                                                for this month.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* Total */}
                                {report.payments.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t border-slate-700">
                                            <td
                                                colSpan={4}
                                                className="px-6 py-4 text-right font-semibold text-white"
                                            >
                                                Total
                                            </td>

                                            <td className="px-6 py-4 text-right font-bold text-[#02F5A1]">
                                                {formatCurrency(
                                                    report.summary.total
                                                )}
                                            </td>

                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-slate-800 bg-[#07191E] p-10 text-center text-slate-400">
                    No report data available.
                </div>
            )}
        </div>
    )
}

function SummaryCard({
    title,
    value,
}: {
    title: string
    value: string
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#07191E] p-5">
            <p className="text-sm text-slate-400">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
                {value}
            </p>
        </div>
    )
}