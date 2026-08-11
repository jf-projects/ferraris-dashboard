/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "@/components/table/datatable"
import { toast } from "sonner"

export default function PaymentsPage() {

    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchPayments() {

        try {

            setLoading(true)

            const response = await fetch("/api/payments")

            const data = await response.json()

            if (data.success) {
                setPayments(data.data)
            }

        } catch (error) {

            console.error(error)

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        const loadPayments = () => {
            fetchPayments()
        }
        loadPayments()
    }, [])

    async function handleDelete(id: number) {

        toast("Delete this Payment?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {

                    const res = await fetch(`/api/payments/${id}`, {
                        method: "DELETE",
                    })

                    const data = await res.json()

                    if (data.success) {
                        toast.success("Transaction deleted successfully.")
                        fetchPayments()
                    } else {
                        toast.error(data.message)
                    }

                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
        })

    }

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Payments
                </h1>

                <p className="text-sm text-slate-400">
                    Manage all payments
                </p>
            </div>

            <DataTable
                columns={columns(handleDelete)}
                data={payments}
                searchColumn="clientName"
                searchPlaceholder="Search payments..."
                emptyMessage="No payments found"
                exportFileName="Payments.xlsx"
            />

        </div>
    )
}