/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { DataTable } from "@/components/table"
import { columns } from "./columns"
import { toast } from "sonner"

export default function LotTransactionsPage() {

    const [transactions, setTransactions] = useState<any[]>([])

    async function fetchTransactions() {

        const response = await fetch("/api/lot-transactions")
        const data = await response.json()

        setTransactions(data.data)

    }

    useEffect(() => {
        const loadData = () => {
            fetchTransactions()
        }
        loadData();
    }, [])


    async function handleDelete(id: number) {

        toast("Delete this transaction?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {

                    const res = await fetch(`/api/lot-transactions/${id}`, {
                        method: "DELETE",
                    })

                    const data = await res.json()

                    if (data.success) {
                        toast.success("Transaction deleted successfully.")
                        fetchTransactions()
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

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-semibold text-white">
                        Lot Transactions
                    </h1>

                    <p className="text-sm text-slate-400">
                        Manage lot transactions
                    </p>

                </div>

                <Link
                    href="/lot-transactions/create"
                    className="rounded-lg bg-[#02F5A1] px-4 py-2 text-black"
                >
                    Add Transaction
                </Link>

            </div>

            <DataTable
                columns={columns(handleDelete)}
                data={transactions}
                searchColumn="clientName"
                searchPlaceholder="Search transactions..."
                emptyMessage="No transactions found"
                exportFileName="LotTransactions.xlsx"
            />

        </div>

    )

} 