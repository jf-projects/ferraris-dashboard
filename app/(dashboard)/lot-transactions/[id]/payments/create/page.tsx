{/* eslint-disable @typescript-eslint/no-explicit-any */ }

import { cookies } from "next/headers"
import { PaymentForm } from "../paymentsForm"

async function getPayments(lotTransactionId: number) {
    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/lot-transactions/${lotTransactionId}/payment-history`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader,
            },
        }
    )

    const data = await response.json()

    return data.data?.history ?? []
}

async function getTransaction(id: number) {
    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/lot-transactions/${id}`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader,
            },
        }
    )

    const data = await response.json()

    return data.data
}

export default async function CreatePaymentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const lotTransactionId = Number(id)

    const [transaction, payments] = await Promise.all([
        getTransaction(lotTransactionId),
        getPayments(lotTransactionId),
    ])

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION VALUES
    |--------------------------------------------------------------------------
    */

    const totalAmount = Number(
        transaction?.propertyTotalAmount ?? 0
    )

    const downpayment = Number(
        transaction?.downpayment ?? 0
    )

    const financedAmount = Math.max(
        0,
        totalAmount - downpayment
    )

    /*
    |--------------------------------------------------------------------------
    | PAYMENT TOTALS
    |--------------------------------------------------------------------------
    */

    const totalPaid = payments.reduce(
        (total: number, payment: any) =>
            total +
            Number(payment.actualPayment || 0),
        0
    )

    const paidInterest = payments.reduce(
        (total: number, payment: any) =>
            total +
            Number(payment.interest || 0),
        0
    )

    /*
    |--------------------------------------------------------------------------
    | REMAINING BALANCE
    |--------------------------------------------------------------------------
    |
    | Downpayment is already deducted from
    | totalAmount through financedAmount.
    |
    | So we don't subtract it again.
    |
    */

    const remainingBalance = Math.max(
        0,
        financedAmount - totalPaid
    )

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Add Payment
                </h1>

                <p className="text-sm text-slate-400">
                    Manage payments for this transaction
                </p>
            </div>


            {/* CONTENT */}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* LEFT - FORM */}

                <div className="lg:col-span-1">

                    <PaymentForm
                        lotTransactionId={lotTransactionId}
                    />

                </div>


                {/* RIGHT - SUMMARY */}

                <div className="space-y-6 lg:col-span-2">

                    {/* TRANSACTION SUMMARY */}

                    <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6">

                        <div className="mb-5">

                            <h2 className="text-lg font-semibold text-white">
                                Payment Summary
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Transaction #{lotTransactionId}
                            </p>

                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                            <SummaryCard
                                label="Total Amount"
                                value={totalAmount}
                            />

                            <SummaryCard
                                label="Downpayment"
                                value={downpayment}
                            />

                            <SummaryCard
                                label="Total Paid"
                                value={totalPaid}
                            />

                            <SummaryCard
                                label="Total Interest"
                                value={paidInterest}
                            />

                            <SummaryCard
                                label="Remaining"
                                value={remainingBalance}
                            />

                        </div>

                    </div>


                    {/* PAYMENT HISTORY */}

                    <div className="overflow-hidden rounded-2xl border border-[#1f3a40] bg-[#10272D]">

                        <div className="border-b border-[#1f3a40] p-6">

                            <h2 className="text-lg font-semibold text-white">
                                Payment History
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                {payments.filter(
                                    (payment: { actualPayment: any }) => Number(payment.actualPayment || 0) > 0
                                ).length}{" "}
                                payment
                                {payments.filter(
                                    (payment: { actualPayment: any }) => Number(payment.actualPayment || 0) > 0
                                ).length !== 1
                                    ? "s"
                                    : ""}{" "}
                                recorded
                            </p>

                        </div>


                        <div className="max-h-100 overflow-y-auto">

                            <table className="w-full table-fixed">

                                <thead className="sticky top-0 z-10 bg-[#07191E]">

                                    <tr>

                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Month/Term
                                        </th>

                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Date
                                        </th>
                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Amount Due
                                        </th>


                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Actual Payment
                                        </th>

                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Interest
                                        </th>

                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Total Amount Due
                                        </th>

                                        <th className="w-1/6 p-4 text-left text-sm font-semibold text-white">
                                            Remaining Balance
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {payments.length > 0 ? (

                                        payments.map(
                                            (payment: any) => (

                                                <tr
                                                    key={payment.month}
                                                    className={`border-t border-[#1f3a40] transition ${Number(payment.actualPayment || 0) > 0
                                                        ? "bg-[#0d2f28] hover:bg-[#123c33]"
                                                        : "bg-[#321f23] hover:bg-[#3d252a]"
                                                        }`}
                                                >

                                                    <td className="p-4 text-sm text-white">
                                                        {payment.month}
                                                    </td>


                                                    <td className="p-4 text-sm text-white">
                                                        {new Date(
                                                            payment.monthYear
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "long",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </td>

                                                    <td className="p-4 text-sm font-semibold text-[#02F5A1]">
                                                        {formatCurrency(
                                                            Number(
                                                                payment.dueAmount || 0
                                                            )
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm font-semibold text-[#02F5A1]">
                                                        {formatCurrency(
                                                            Number(
                                                                payment.actualPayment || 0
                                                            )
                                                        )}
                                                    </td>


                                                    <td className="p-4 text-sm text-slate-400">
                                                        {Number(
                                                            payment.interest || 0
                                                        ) > 0
                                                            ? formatCurrency(
                                                                Number(
                                                                    payment.interest
                                                                )
                                                            )
                                                            : "-"
                                                        }
                                                    </td>


                                                    <td className="p-4 text-sm text-slate-400">
                                                        {Number(
                                                            payment.totalAmountDue || 0
                                                        ) > 0
                                                            ? formatCurrency(
                                                                Number(
                                                                    payment.totalAmountDue
                                                                )
                                                            )
                                                            : "-"
                                                        }
                                                    </td>


                                                    <td className="p-4 text-sm text-white">
                                                        {Number(
                                                            payment.balance || 0
                                                        ) > 0
                                                            ? formatCurrency(
                                                                Number(
                                                                    payment.balance
                                                                )
                                                            )
                                                            : "-"
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="p-10 text-center"
                                            >

                                                <p className="text-sm font-medium text-white">
                                                    No payments found.
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    No payment history has been recorded for this transaction yet.
                                                </p>

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}


function SummaryCard({
    label,
    value,
}: {
    label: string
    value: number
}) {
    return (
        <div className="rounded-xl bg-[#07191E] p-4">

            <p className="text-sm text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-semibold text-[#02F5A1]">
                {formatCurrency(value)}
            </p>

        </div>
    )
}


function formatCurrency(value: number) {
    return value.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
    })
}