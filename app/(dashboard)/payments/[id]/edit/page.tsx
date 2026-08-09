/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers"
import { PaymentForm } from "@/app/(dashboard)/lot-transactions/[id]/payments/paymentsForm"

async function getPayment(id: number) {

    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/${id}`,
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

async function getPayments(transactionId: number) {

    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/transaction/${transactionId}`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader,
            },
        }
    )

    const data = await response.json()

    return data.data ?? []
}


export default async function EditPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params

    const payment = await getPayment(Number(id))

    const payments = await getPayments(
        payment.lotTransactionId
    )

    const totalPaid = payments.reduce(
        (total: number, payment: any) =>
            total + Number(payment.amount || 0),
        0
    )

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Edit Payment
                </h1>

                <p className="text-sm text-slate-400">
                    Update payment information
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                {/* 1/3 - FORM */}

                <div className="lg:col-span-1">

                    <PaymentForm
                        payment={payment}
                    />

                </div>


                {/* 2/3 - PAYMENT SUMMARY */}

                <div className="lg:col-span-2 space-y-6">

                    {/* SUMMARY */}

                    <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6">

                        <h2 className="text-lg font-semibold text-white">
                            Payment Summary
                        </h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">

                            <div className="rounded-xl bg-[#07191E] p-4">

                                <p className="text-sm text-slate-400">
                                    Total Payments
                                </p>

                                <p className="mt-1 text-xl font-semibold text-white">
                                    {payments.length}
                                </p>

                            </div>

                            <div className="rounded-xl bg-[#07191E] p-4">

                                <p className="text-sm text-slate-400">
                                    Total Paid
                                </p>

                                <p className="mt-1 text-xl font-semibold text-[#02F5A1]">
                                    ₱{totalPaid.toLocaleString(
                                        "en-PH",
                                        {
                                            minimumFractionDigits: 2,
                                        }
                                    )}
                                </p>

                            </div>

                            <div className="rounded-xl bg-[#07191E] p-4">

                                <p className="text-sm text-slate-400">
                                    Transaction
                                </p>

                                <p className="mt-1 text-xl font-semibold text-white">
                                    #{payment.lotTransactionId}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* PAYMENT HISTORY */}

                    <div className="overflow-hidden rounded-2xl border border-[#1f3a40] bg-[#10272D]">

                        <div className="border-b border-[#1f3a40] p-6">

                            <h2 className="text-lg font-semibold text-white">
                                Payment History
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                All payments for this transaction
                            </p>

                        </div>

                        <div className="max-h-100 overflow-y-auto">

                            <table className="w-full">

                                <thead className="sticky top-0 z-10 bg-[#07191E]">

                                    <tr>

                                        <th className="p-4 text-left text-sm font-semibold text-white">
                                            Date
                                        </th>

                                        <th className="p-4 text-left text-sm font-semibold text-white">
                                            Amount
                                        </th>

                                        <th className="p-4 text-left text-sm font-semibold text-white">
                                            Bank
                                        </th>

                                        <th className="p-4 text-left text-sm font-semibold text-white">
                                            Remarks
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {payments.map((item: any) => (

                                        <tr
                                            key={item.id}
                                            className="border-t border-[#1f3a40]"
                                        >

                                            <td className="p-4 text-sm text-white">
                                                {item.paymentDate
                                                    ? new Date(
                                                        item.paymentDate
                                                    ).toLocaleDateString()
                                                    : "-"
                                                }
                                            </td>

                                            <td className="p-4 text-sm font-semibold text-[#02F5A1]">
                                                ₱{Number(
                                                    item.amount
                                                ).toLocaleString(
                                                    "en-PH",
                                                    {
                                                        minimumFractionDigits: 2,
                                                    }
                                                )}
                                            </td>

                                            <td className="p-4 text-sm text-white">
                                                {item.bank || "-"}
                                            </td>

                                            <td className="p-4 text-sm text-slate-400">
                                                {item.remarks || "-"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}