/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Layers } from "lucide-react"
import { toast } from "sonner"

interface PaymentFormProps {
    lotTransactionId?: number
    payment?: any
}

type PaymentMode = "single" | "multiple"

export function PaymentForm({
    lotTransactionId,
    payment,
}: PaymentFormProps) {

    const router = useRouter()

    const isEdit = !!payment

    const [loading, setLoading] = useState(false)

    const [mode, setMode] = useState<PaymentMode>("single")

    const [form, setForm] = useState({
        amount: "",
        bank: "",
        paymentDate: "",
        startDate: "",
        endDate: "",
        remarks: "",
    })

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
            toast.error(
                "Payment amount must be greater than zero."
            )
            return
        }

        /*
        |--------------------------------------------------------------------------
        | SINGLE PAYMENT VALIDATION
        |--------------------------------------------------------------------------
        */

        if (mode === "single" && !form.paymentDate) {
            toast.error("Payment date is required.")
            return
        }

        /*
        |--------------------------------------------------------------------------
        | MULTIPLE PAYMENT VALIDATION
        |--------------------------------------------------------------------------
        */

        if (mode === "multiple") {

            if (!form.startDate) {
                toast.error("Start date is required.")
                return
            }

            if (!form.endDate) {
                toast.error("End date is required.")
                return
            }

            if (
                new Date(form.startDate) >
                new Date(form.endDate)
            ) {
                toast.error(
                    "Start date cannot be later than end date."
                )
                return
            }
        }

        setLoading(true)

        try {

            let url: string
            let method = "POST"

            /*
            |--------------------------------------------------------------------------
            | EDIT PAYMENT
            |--------------------------------------------------------------------------
            */

            if (isEdit) {

                url = `/api/payments/${payment.id}`
                method = "PUT"

            }

            /*
            |--------------------------------------------------------------------------
            | CREATE SINGLE PAYMENT
            |--------------------------------------------------------------------------
            */

            else if (mode === "single") {

                url = "/api/payments"

            }

            /*
            |--------------------------------------------------------------------------
            | CREATE MULTIPLE PAYMENTS
            |--------------------------------------------------------------------------
            */

            else {

                url = `/api/payments/transaction/${lotTransactionId}/bulk`

            }

            let body: any

            /*
            |--------------------------------------------------------------------------
            | EDIT
            |--------------------------------------------------------------------------
            */

            if (isEdit) {

                body = {
                    lotTransactionId:
                        payment.lotTransactionId ??
                        lotTransactionId,

                    amount: Number(form.amount),

                    bank: form.bank || null,

                    paymentDate: form.paymentDate,

                    remarks: form.remarks || null,
                }

            }

            /*
            |--------------------------------------------------------------------------
            | SINGLE CREATE
            |--------------------------------------------------------------------------
            */

            else if (mode === "single") {

                body = {
                    lotTransactionId,

                    amount: Number(form.amount),

                    bank: form.bank || null,

                    paymentDate: form.paymentDate,

                    remarks: form.remarks || null,
                }

            }

            /*
            |--------------------------------------------------------------------------
            | MULTIPLE CREATE
            |--------------------------------------------------------------------------
            */

            else {

                body = {
                    amount: Number(form.amount),

                    bank: form.bank || null,

                    startDate: form.startDate,

                    endDate: form.endDate,

                    remarks: form.remarks || null,
                }

            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                    `Failed to ${isEdit
                        ? "update"
                        : "save"
                    } payment.`
                )
            }

            /*
            |--------------------------------------------------------------------------
            | SUCCESS MESSAGE
            |--------------------------------------------------------------------------
            */

            if (isEdit) {

                toast.success(
                    "Payment updated successfully."
                )

            } else if (mode === "multiple") {

                toast.success(
                    data.message ||
                    "Payments created successfully."
                )

            } else {

                toast.success(
                    "Payment added successfully."
                )

            }

            /*
            |--------------------------------------------------------------------------
            | REDIRECT
            |--------------------------------------------------------------------------
            */

            if (isEdit) {

                router.push("/payments")

            } else {

                router.push(
                    `/lot-transactions/${lotTransactionId}/payments/create`
                )

            }

            router.refresh()

        } catch (error) {

            toast.error(
                error instanceof Error
                    ? error.message
                    : `Failed to ${isEdit
                        ? "update"
                        : "save"
                    } payment.`
            )

        } finally {

            setLoading(false)

        }
    }

    function handleCancel() {

        if (isEdit) {

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

            {/* HEADER */}

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


            {/* PAYMENT MODE */}

            {!isEdit && (

                <div className="mb-6 rounded-xl bg-[#07191E] p-1">

                    <div className="grid grid-cols-2 gap-1">

                        <button
                            type="button"
                            onClick={() =>
                                setMode("single")
                            }
                            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${mode === "single"
                                    ? "bg-[#02F5A1] text-[#07191E]"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <CreditCard className="h-4 w-4" />

                            Single Payment
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setMode("multiple")
                            }
                            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${mode === "multiple"
                                    ? "bg-[#02F5A1] text-[#07191E]"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            <Layers className="h-4 w-4" />

                            Multiple Payments
                        </button>

                    </div>

                </div>

            )}


            {/* FORM */}

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


                {/* SINGLE PAYMENT DATE */}

                {(isEdit || mode === "single") && (

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

                )}


                {/* MULTIPLE PAYMENT DATES */}

                {!isEdit && mode === "multiple" && (

                    <div className="grid grid-cols-2 gap-3">

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">
                                Start Date
                            </label>

                            <input
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                className={input}
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm text-slate-300">
                                End Date
                            </label>

                            <input
                                name="endDate"
                                type="date"
                                value={form.endDate}
                                onChange={handleChange}
                                className={input}
                            />

                        </div>

                    </div>

                )}


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
                            : mode === "multiple"
                                ? "Create Payments"
                                : "Save Payment"}
                </button>

            </div>

        </form>
    )
}