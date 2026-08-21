/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TransactionFormProps {
    transaction?: any
}

export function TransactionForm({
    transaction,
}: TransactionFormProps) {
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])

    const [form, setForm] = useState({
        clientId: "",
        propertyUnit: "",
        totalPropertySize: "",
        type: "",
        unitBlock: "",
        unitLot: "",
        propertyUnitAddress: "",
        downpayment: "",
        paymentTerms: "",
        incrementValues: "",
        interest: "",
        sqm: "",
        incrementAmount: 0,
        transactionDate: "",
        autocompute: 0,
        propertyTotalAmount: "",
        dueDate: "",
        interestDate: "",
    })

    /*
    |--------------------------------------------------------------------------
    | Auto Computed Payment Schedule
    |--------------------------------------------------------------------------
    */

    const incrementValues =
        form.autocompute &&
            Number(form.paymentTerms) >= 5
            ? calculateIncrementValues(
                Number(form.propertyTotalAmount),
                Number(form.downpayment),
                Number(form.paymentTerms),
                Number(form.incrementAmount)
            )
            : []

    /*
    |--------------------------------------------------------------------------
    | Fetch Clients
    |--------------------------------------------------------------------------
    */

    async function fetchClients() {
        try {
            const res = await fetch("/api/clients")

            if (!res.ok) {
                throw new Error("Failed to load clients.")
            }

            const data = await res.json()

            setClients(data.data ?? [])
        } catch (error) {
            console.error(error)

            toast.error("Failed to load clients.")
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    /*
    |--------------------------------------------------------------------------
    | Load Transaction For Edit
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!transaction) {
            return
        }

        setForm({
            clientId:
                transaction.clientId != null
                    ? String(transaction.clientId)
                    : "",

            propertyUnit:
                transaction.propertyUnit ?? "",

            totalPropertySize:
                transaction.totalPropertySize != null
                    ? String(transaction.totalPropertySize)
                    : "",

            type:
                transaction.type ?? "",

            unitBlock:
                transaction.unitBlock != null
                    ? String(transaction.unitBlock)
                    : "",

            unitLot:
                transaction.unitLot != null
                    ? String(transaction.unitLot)
                    : "",

            propertyUnitAddress:
                transaction.propertyUnitAddress ?? "",

            downpayment:
                transaction.downpayment != null
                    ? String(transaction.downpayment)
                    : "",

            paymentTerms:
                transaction.paymentTerms != null
                    ? String(transaction.paymentTerms)
                    : "",

            incrementValues:
                typeof transaction.incrementValues === "string"
                    ? transaction.incrementValues
                    : JSON.stringify(
                        transaction.incrementValues ?? []
                    ),

            interest:
                transaction.interest != null
                    ? String(transaction.interest)
                    : "",

            sqm:
                transaction.sqm != null
                    ? String(transaction.sqm)
                    : "",

            incrementAmount:
                transaction.incrementAmount != null
                    ? Number(transaction.incrementAmount)
                    : 0,

            transactionDate:
                transaction.transactionDate
                    ? String(transaction.transactionDate).substring(
                        0,
                        10
                    )
                    : "",

            autocompute:
                transaction.autocompute ? 1 : 0,

            propertyTotalAmount:
                transaction.propertyTotalAmount != null
                    ? String(transaction.propertyTotalAmount)
                    : "",

            dueDate:
                transaction.dueDate
                    ? String(transaction.dueDate).substring(0, 10)
                    : "",

            interestDate:
                transaction.interestDate
                    ? String(transaction.interestDate).substring(
                        0,
                        10
                    )
                    : "",
        })
    }, [transaction])

    /*
    |--------------------------------------------------------------------------
    | Handle Input Changes
    |--------------------------------------------------------------------------
    */

    function handleChange(e: any) {
        const {
            name,
            value,
            type,
            checked,
        } = e.target

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }))
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Submit
    |--------------------------------------------------------------------------
    */

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault()

        if (loading) {
            return
        }

        setLoading(true)

        try {
            /*
            |--------------------------------------------------------------------------
            | Payment Schedule
            |--------------------------------------------------------------------------
            */

            let paymentSchedule: number[] = []

            if (form.autocompute) {
                /*
                | Cash does not need a computed schedule.
                */

                if (form.paymentTerms === "cash") {
                    paymentSchedule = []
                } else {
                    const calculated =
                        calculateIncrementValues(
                            Number(form.propertyTotalAmount),
                            Number(form.downpayment),
                            Number(form.paymentTerms),
                            Number(form.incrementAmount)
                        )

                    if (!calculated) {
                        toast.error(
                            "Increment amount is too high for the selected payment terms."
                        )

                        setLoading(false)

                        return
                    }

                    paymentSchedule = calculated
                }
            } else {
                /*
                |--------------------------------------------------------------------------
                | Manually Entered Payment Schedule
                |--------------------------------------------------------------------------
                */

                try {
                    const parsed = JSON.parse(
                        form.incrementValues || "[]"
                    )

                    if (Array.isArray(parsed)) {
                        paymentSchedule = parsed
                            .map(Number)
                            .filter(Number.isFinite)
                    }
                } catch {
                    toast.error(
                        "Invalid payment schedule."
                    )

                    setLoading(false)

                    return
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Validate Required Fields
            |--------------------------------------------------------------------------
            */

            if (
                !required(
                    form.clientId,
                    "Client"
                )
            ) {
                setLoading(false)
                return
            }

            if (
                !required(
                    form.propertyUnit,
                    "Property Unit"
                )
            ) {
                setLoading(false)
                return
            }

            if (
                !required(
                    form.type,
                    "Type"
                )
            ) {
                setLoading(false)
                return
            }

            if (
                !required(
                    form.unitBlock,
                    "Block"
                )
            ) {
                setLoading(false)
                return
            }

            if (
                !required(
                    form.unitLot,
                    "Lot"
                )
            ) {
                setLoading(false)
                return
            }

            if (
                !required(
                    form.paymentTerms,
                    "Payment Terms"
                )
            ) {
                setLoading(false)
                return
            }

            /*
            |--------------------------------------------------------------------------
            | Validate Payment Schedule
            |--------------------------------------------------------------------------
            */

            if (
                form.paymentTerms !== "cash" &&
                !form.autocompute &&
                paymentSchedule.length === 0
            ) {
                toast.error(
                    "Please enter at least one payment schedule."
                )

                setLoading(false)

                return
            }

            /*
            |--------------------------------------------------------------------------
            | Build Database-Safe Payload
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | HTML inputs always return strings.
            |
            | We do NOT send:
            |
            |     totalPropertySize: ""
            |     sqm: ""
            |     dueDate: ""
            |
            | Instead:
            |
            |     number fields -> number | null
            |     date fields   -> string | null
            |
            |--------------------------------------------------------------------------
            */

            const payload = {
                /*
                |--------------------------------------------------------------------------
                | Required / basic fields
                |--------------------------------------------------------------------------
                */

                clientId: Number(form.clientId),

                propertyUnit:
                    form.propertyUnit || null,

                type:
                    form.type || null,

                /*
                |--------------------------------------------------------------------------
                | Numeric fields
                |--------------------------------------------------------------------------
                */

                totalPropertySize:
                    toNumberOrNull(
                        form.totalPropertySize
                    ),

                unitBlock:
                    toNumberOrNull(
                        form.unitBlock
                    ),

                unitLot:
                    toNumberOrNull(
                        form.unitLot
                    ),

                downpayment:
                    toNumberOrNull(
                        form.downpayment
                    ),

                interest:
                    toNumberOrNull(
                        form.interest
                    ),

                sqm:
                    toNumberOrNull(
                        form.sqm
                    ),

                incrementAmount:
                    toNumberOrNull(
                        form.incrementAmount
                    ),

                propertyTotalAmount:
                    toNumberOrNull(
                        form.propertyTotalAmount
                    ),

                /*
                |--------------------------------------------------------------------------
                | Address
                |--------------------------------------------------------------------------
                */

                propertyUnitAddress:
                    form.propertyUnitAddress ||
                    null,

                /*
                |--------------------------------------------------------------------------
                | Payment Terms
                |--------------------------------------------------------------------------
                |
                | "cash" cannot be converted to a number.
                | If LotTransaction.paymentTerms is numeric,
                | cash should be stored as NULL.
                |
                |--------------------------------------------------------------------------
                */

                paymentTerms:
                    form.paymentTerms === "cash"
                        ? null
                        : toNumberOrNull(
                            form.paymentTerms
                        ),

                /*
                |--------------------------------------------------------------------------
                | Payment Schedule
                |--------------------------------------------------------------------------
                */

                incrementValues:
                    JSON.stringify(
                        paymentSchedule
                    ),

                /*
                |--------------------------------------------------------------------------
                | Auto Compute
                |--------------------------------------------------------------------------
                */

                autocompute:
                    form.autocompute ? 1 : 0,

                /*
                |--------------------------------------------------------------------------
                | Dates
                |--------------------------------------------------------------------------
                */

                transactionDate:
                    toDateOrNull(
                        form.transactionDate
                    ),

                dueDate:
                    toDateOrNull(
                        form.dueDate
                    ),

                interestDate:
                    toDateOrNull(
                        form.interestDate
                    ),
            }

            console.log(
                "Submitting LotTransaction:",
                payload
            )

            /*
            |--------------------------------------------------------------------------
            | Save Transaction
            |--------------------------------------------------------------------------
            */

            const res = await fetch(
                transaction
                    ? `/api/lot-transactions/${transaction.id}`
                    : "/api/lot-transactions",
                {
                    method: transaction
                        ? "PUT"
                        : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        payload
                    ),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Failed saving transaction."
                )
            }

            /*
            |--------------------------------------------------------------------------
            | Create Downpayment Payment
            |--------------------------------------------------------------------------
            */

            if (
                !transaction &&
                Number(form.downpayment) > 0 &&
                data.data?.id
            ) {
                const paymentRes =
                    await fetch(
                        "/api/payments",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                lotTransactionId:
                                    data.data.id,

                                amount:
                                    Number(
                                        form.downpayment
                                    ),

                                paymentDate:
                                    toDateOrNull(
                                        form.transactionDate
                                    ),

                                type: "downpayment",
                            }),
                        }
                    )

                const paymentData =
                    await paymentRes.json()

                if (!paymentRes.ok) {
                    throw new Error(
                        paymentData.message ||
                        "Transaction saved but downpayment failed."
                    )
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            toast.success(
                transaction
                    ? "Transaction updated."
                    : "Transaction created."
            )

            router.push(
                "/lot-transactions"
            )

            router.refresh()
        } catch (err) {
            console.error(err)

            toast.error(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            )
        } finally {
            setLoading(false)
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Input Styles
    |--------------------------------------------------------------------------
    */

    const input =
        "w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6"
        >
            {/* -------------------------------------------------------------- */}
            {/* Transaction Information */}
            {/* -------------------------------------------------------------- */}

            <h2 className="text-xl font-semibold text-white">
                Transaction Information
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
                {/* Client */}

                <div>
                    <label className="mb-2 block text-sm text-slate-300">
                        Client
                    </label>

                    <select
                        name="clientId"
                        value={form.clientId}
                        onChange={handleChange}
                        className={input}
                    >
                        <option value="">
                            Select Client
                        </option>

                        {clients.map(
                            (client) => (
                                <option
                                    key={client.id}
                                    value={
                                        client.id
                                    }
                                >
                                    {
                                        client.firstName
                                    }{" "}
                                    {
                                        client.lastName
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <Input
                    label="Property Unit"
                    name="propertyUnit"
                    value={
                        form.propertyUnit
                    }
                    onChange={
                        handleChange
                    }
                />

                <SelectInput
                    label="Type"
                    name="type"
                    value={form.type}
                    onChange={
                        handleChange
                    }
                    options={[
                        {
                            value:
                                "with_property",
                            label:
                                "With Property",
                        },
                        {
                            value:
                                "vacant_lot",
                            label:
                                "Vacant Lot",
                        },
                    ]}
                />

                <Input
                    label="Block"
                    name="unitBlock"
                    type="number"
                    value={
                        form.unitBlock
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Lot"
                    name="unitLot"
                    type="number"
                    value={
                        form.unitLot
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Property Address"
                    name="propertyUnitAddress"
                    value={
                        form.propertyUnitAddress
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Property Size"
                    name="totalPropertySize"
                    type="number"
                    value={
                        form.totalPropertySize
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="SQM Price"
                    name="sqm"
                    type="number"
                    value={form.sqm}
                    onChange={
                        handleChange
                    }
                />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Dates */}
            {/* -------------------------------------------------------------- */}

            <h2 className="text-xl font-semibold text-white">
                Dates
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
                <Input
                    label="Transaction Date"
                    name="transactionDate"
                    type="date"
                    value={
                        form.transactionDate
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Interest Date"
                    name="interestDate"
                    type="date"
                    value={
                        form.interestDate
                    }
                    onChange={
                        handleChange
                    }
                />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Payment Information */}
            {/* -------------------------------------------------------------- */}

            <h2 className="text-xl font-semibold text-white">
                Payment Information
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
                <Input
                    label="Total Amount"
                    name="propertyTotalAmount"
                    type="number"
                    value={
                        form.propertyTotalAmount
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Downpayment"
                    name="downpayment"
                    type="number"
                    value={
                        form.downpayment
                    }
                    onChange={
                        handleChange
                    }
                />

                <SelectInput
                    label="Payment Terms"
                    name="paymentTerms"
                    value={
                        form.paymentTerms
                    }
                    onChange={
                        handleChange
                    }
                    options={[
                        {
                            value: "cash",
                            label: "Cash",
                        },
                        {
                            value: "2",
                            label: "2 Years",
                        },
                        {
                            value: "5",
                            label: "5 Years",
                        },
                        {
                            value: "10",
                            label: "10 Years",
                        },
                        {
                            value: "15",
                            label: "15 Years",
                        },
                        {
                            value: "20",
                            label: "20 Years",
                        },
                        {
                            value: "25",
                            label: "25 Years",
                        },
                    ]}
                />

                <Input
                    label="Interest"
                    name="interest"
                    type="number"
                    value={
                        form.interest
                    }
                    onChange={
                        handleChange
                    }
                />

                <Input
                    label="Increment Amount"
                    name="incrementAmount"
                    type="number"
                    value={
                        form.incrementAmount
                    }
                    onChange={
                        handleChange
                    }
                />
            </div>

            {/* -------------------------------------------------------------- */}
            {/* Auto Compute */}
            {/* -------------------------------------------------------------- */}

            <label className="flex items-center gap-3 text-white">
                <button
                    type="button"
                    onClick={() =>
                        setForm(
                            (prev) => ({
                                ...prev,
                                autocompute:
                                    prev.autocompute ===
                                        1
                                        ? 0
                                        : 1,
                            })
                        )
                    }
                    className={`relative h-7 w-12 rounded-full transition ${form.autocompute
                            ? "bg-[#02F5A1]"
                            : "bg-slate-600"
                        }`}
                >
                    <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${form.autocompute
                                ? "left-6"
                                : "left-1"
                            }`}
                    />
                </button>

                <span>
                    Auto Compute
                </span>
            </label>

            {/* -------------------------------------------------------------- */}
            {/* Auto Computed Schedule */}
            {/* -------------------------------------------------------------- */}

            {form.autocompute ? (
                incrementValues &&
                incrementValues.length >
                0 && (
                    <div className="rounded-xl border border-[#1f3a40] bg-[#07191E] p-4">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                            Auto Computed Payment
                            Schedule
                        </h3>

                        <div className="space-y-2">
                            {incrementValues.map(
                                (
                                    value,
                                    index
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="flex items-center justify-between rounded-lg bg-[#10272D] px-4 py-2"
                                    >
                                        <span className="text-slate-300">
                                            Years{" "}
                                            {index *
                                                5 +
                                                1}{" "}
                                            -{" "}
                                            {(index +
                                                1) *
                                                5}
                                        </span>

                                        <span className="font-semibold text-[#02F5A1]">
                                            ₱
                                            {value.toLocaleString()}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )
            ) : (
                Number(form.paymentTerms) >=
                5 && (
                    <div className="rounded-xl border border-[#1f3a40] bg-[#07191E] p-4">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                            Payment Schedule
                        </h3>

                        <div className="space-y-3">
                            {Array.from(
                                {
                                    length: Math.floor(
                                        Number(
                                            form.paymentTerms
                                        ) /
                                        5
                                    ),
                                },
                                (
                                    _,
                                    index
                                ) => {
                                    const values =
                                        parsePaymentSchedule(
                                            form.incrementValues
                                        )

                                    return (
                                        <div
                                            key={
                                                index
                                            }
                                            className="flex items-center justify-between rounded-lg bg-[#10272D] px-4 py-3"
                                        >
                                            <span className="text-sm text-slate-300">
                                                Years{" "}
                                                {index *
                                                    5 +
                                                    1}{" "}
                                                -{" "}
                                                {(index +
                                                    1) *
                                                    5}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400">
                                                    ₱
                                                </span>

                                                <input
                                                    type="number"
                                                    value={
                                                        values[
                                                        index
                                                        ] ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        e
                                                    ) => {
                                                        const updated =
                                                            [
                                                                ...values,
                                                            ]

                                                        updated[
                                                            index
                                                        ] =
                                                            e
                                                                .target
                                                                .value

                                                        setForm(
                                                            (
                                                                prev
                                                            ) => ({
                                                                ...prev,
                                                                incrementValues:
                                                                    JSON.stringify(
                                                                        updated
                                                                    ),
                                                            })
                                                        )
                                                    }}
                                                    className="w-40 rounded-lg border border-[#1f3a40] bg-[#07191E] px-3 py-2 text-right text-white outline-none focus:border-[#02F5A1]"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>
                )
            )}

            {/* -------------------------------------------------------------- */}
            {/* Submit */}
            {/* -------------------------------------------------------------- */}

            <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#02F5A1] px-6 py-3 font-semibold text-black transition hover:bg-[#00d98d] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Saving..."
                    : "Save Transaction"}
            </button>
        </form>
    )
}

/*
|--------------------------------------------------------------------------
| Input Component
|--------------------------------------------------------------------------
*/

function Input({
    label,
    ...props
}: any) {
    return (
        <div>
            <label className="mb-2 block text-sm text-slate-300">
                {label}
            </label>

            <input
                {...props}
                className="w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"
            />
        </div>
    )
}

/*
|--------------------------------------------------------------------------
| Select Component
|--------------------------------------------------------------------------
*/

function SelectInput({
    label,
    options,
    ...props
}: any) {
    return (
        <div>
            <label className="mb-2 block text-sm text-slate-300">
                {label}
            </label>

            <select
                {...props}
                className="w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"
            >
                <option value="">
                    Select {label}
                </option>

                {options.map(
                    (option: any) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {
                                option.label
                            }
                        </option>
                    )
                )}
            </select>
        </div>
    )
}

/*
|--------------------------------------------------------------------------
| Calculate Payment Schedule
|--------------------------------------------------------------------------
*/

function calculateIncrementValues(
    totalAmount: number,
    downpayment: number,
    paymentYears: number,
    increment: number
) {
    const financedAmount =
        totalAmount - downpayment

    const months =
        paymentYears * 12

    const blocks =
        paymentYears / 5

    const series =
        (blocks * (blocks - 1)) /
        2

    const startingPayment =
        (financedAmount -
            increment *
            60 *
            series) /
        months

    if (
        !Number.isFinite(
            startingPayment
        ) ||
        startingPayment < 0
    ) {
        return null
    }

    return Array.from(
        {
            length: blocks,
        },
        (_, i) =>
            Number(
                (
                    startingPayment +
                    increment * i
                ).toFixed(2)
            )
    )
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Converts an optional form value to a number.
 *
 * ""     -> null
 * "1000" -> 1000
 * "0"    -> 0
 */
function toNumberOrNull(
    value: unknown
): number | null {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null
    }

    const number = Number(value)

    return Number.isFinite(number)
        ? number
        : null
}

/**
 * Converts an optional date to a database-safe value.
 *
 * "" -> null
 * "2026-08-21" -> "2026-08-21"
 */
function toDateOrNull(
    value: unknown
): string | null {
    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null
    }

    return String(value)
}

/**
 * Safely parses the manually entered
 * payment schedule.
 */
function parsePaymentSchedule(
    value: string
): any[] {
    if (!value) {
        return []
    }

    try {
        const parsed =
            JSON.parse(value)

        return Array.isArray(parsed)
            ? parsed
            : []
    } catch {
        return []
    }
}

/*
|--------------------------------------------------------------------------
| Required Validation
|--------------------------------------------------------------------------
*/

function required(
    value: string,
    label: string
) {
    if (!value) {
        toast.error(
            `${label} is required.`
        )

        return false
    }

    return true
}