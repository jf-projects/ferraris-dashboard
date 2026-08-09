/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import {
    CreditCard,
    FileText,
    Pencil,
    Trash2,
} from "lucide-react"

export const columns = (
    onDelete: (id: number) => void
): ColumnDef<any>[] => [
        {
            accessorKey: "id",
            header: "ID",
        },

        {
            id: "clientName",
            header: "Client",
            accessorFn: (row) =>
                `${row.client.firstName} ${row.client.lastName}`,
        },

        {
            accessorKey: "propertyUnit",
            header: "Property",
        },

        {
            accessorKey: "unitBlock",
            header: "Block",
        },

        {
            accessorKey: "unitLot",
            header: "Lot",
        },

        {
            accessorKey: "totalPropertySize",
            header: "Size (sqm)",
        },

        {
            accessorKey: "propertyTotalAmount",
            header: "Total Amount",
            cell: ({ row }) =>
                Number(
                    row.original.propertyTotalAmount
                ).toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                }),
        },

        {
            accessorKey: "downpayment",
            header: "Downpayment",
            cell: ({ row }) =>
                Number(
                    row.original.downpayment
                ).toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                }),
        },

        {
            accessorKey: "paymentTerms",
            header: "Terms",
            cell: ({ row }) =>
                row.original.paymentTerms === "cash"
                    ? "Cash"
                    : `${row.original.paymentTerms} yrs`,
        },

        {
            accessorKey: "transactionDate",
            header: "Transaction Date",
            cell: ({ row }) =>
                row.original.transactionDate
                    ? new Date(
                        row.original.transactionDate
                    ).toLocaleDateString()
                    : "-",
        },

        {
            id: "actions",
            header: "Actions",

            cell: ({ row }) => {
                const transaction = row.original

                return (
                    <div className="flex items-center gap-1">

                        <Link
                            href={`/lot-transactions/${transaction.id}/payments/create`}
                            title="Add Payment"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#38BDF8] text-black transition hover:bg-[#38A2F8]"
                        >
                            <CreditCard className="h-4 w-4" />
                        </Link>

                        <a
                            href={`/api/lot-transactions/${transaction.id}/contract`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Generate Contract"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A78BFA] text-white transition hover:bg-[#8B5CF6]"
                        >
                            <FileText className="h-4 w-4" />
                        </a>

                        <Link
                            href={`/lot-transactions/${transaction.id}/edit`}
                            title="Edit Transaction"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#02F5A1] text-black transition hover:bg-[#00d98f]"
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => onDelete(transaction.id)}
                            title="Delete Transaction"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                    </div>
                )
            },
        },
    ]