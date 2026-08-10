/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PaymentFormProps {
    lotTransactionId?: number
    payment?: any
}

export function PaymentForm({
    lotTransactionId,
    payment,
}: PaymentFormProps) {

    const router = useRouter()

    const isEdit = !!payment

    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        amount: "",
        bank: "",
        paymentDate: "",
        remarks: "",
    })

    useEffect(() => {
        const setPaymentForm = () => {
            setForm({
                amount: String(payment.amount ?? ""),
                bank: payment.bank ?? "",
                paymentDate:
                    payment.paymentDate?.substring(0, 10) ?? "",
                remarks: payment.remarks ?? "",
            })
        }


        if (!payment) return
        setPaymentForm()


    }, [payment])

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault()

        if (!form.amount) {
            toast.error("Payment amount is required.")
            return
        }

        if (Number(form.amount) <= 0) {
            toast.error("Payment amount must be greater than zero.")
            return
        }

        if (!form.paymentDate) {
            toast.error("Payment date is required.")
            return
        }

        setLoading(true)

        try {

            const url = payment
                ? `/api/payments/${payment.id}`
                : "/api/payments"

            const method = payment
                ? "PUT"
                : "POST"

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lotTransactionId:
                        payment?.lotTransactionId ??
                        lotTransactionId,

                    amount: Number(form.amount),

                    bank: form.bank || null,

                    paymentDate: form.paymentDate,

                    remarks: form.remarks || null,
                }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                    `Failed to ${isEdit ? "update" : "save"} payment.`
                )
            }

            toast.success(
                isEdit
                    ? "Payment updated successfully."
                    : "Payment added successfully."
            )

            if (payment?.lotTransactionId) {
                router.push("/payments")
            } else {
                router.push(
                    `/lot-transactions`
                )
            }

            router.refresh()

        } catch (error) {

            toast.error(
                error instanceof Error
                    ? error.message
                    : `Failed to ${isEdit ? "update" : "save"
                    } payment.`
            )

        } finally {

            setLoading(false)

        }
    }

    function handleCancel() {

        if (payment?.lotTransactionId) {
            router.push("/payments")
        } else {
            router.push(
                `/lot-transactions`
            )
        }
    }

    const input =
        "w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6"
        >

            <div className="mb-6">

                <h2 className="text-lg font-semibold text-white">
                    {isEdit
                        ? "Edit Payment"
                        : "Add Payment"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    {isEdit
                        ? "Update payment information."
                        : "Record a payment for this transaction."}
                </p>

            </div>


            <div className="space-y-5">

                {/* AMOUNT */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Amount
                    </label>

                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={input}
                    />

                </div>


                {/* BANK */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Bank
                    </label>

                    <input
                        name="bank"
                        value={form.bank}
                        onChange={handleChange}
                        placeholder="e.g. BDO/JJ"
                        className={input}
                    />

                </div>


                {/* PAYMENT DATE */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Payment Date
                    </label>

                    <input
                        name="paymentDate"
                        type="date"
                        value={form.paymentDate}
                        onChange={handleChange}
                        className={input}
                    />

                </div>


                {/* REMARKS */}

                <div>

                    <label className="mb-2 block text-sm text-slate-300">
                        Remarks
                    </label>

                    <textarea
                        name="remarks"
                        value={form.remarks}
                        onChange={handleChange}
                        placeholder="Optional"
                        rows={4}
                        className={input}
                    />

                </div>

            </div>


            {/* BUTTONS */}

            <div className="mt-6 flex gap-3">

                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#07191E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#16343B] disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#02F5A1] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#00d98f] disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : isEdit
                            ? "Update Payment"
                            : "Save Payment"}
                </button>

            </div>

        </form>
    )
}