/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

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
                row.client
                    ? `${row.client.firstName} ${row.client.lastName}`
                    : "-",
        },

        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) =>
                Number(row.original.amount).toLocaleString("en-PH", {
                    style: "currency",
                    currency: "PHP",
                }),
        },

        {
            accessorKey: "bank",
            header: "Bank",
            cell: ({ row }) =>
                row.original.bank || "-",
        },

        {
            accessorKey: "paymentDate",
            header: "Payment Date",
            cell: ({ row }) =>
                row.original.paymentDate
                    ? new Date(
                        row.original.paymentDate
                    ).toLocaleDateString()
                    : "-",
        },

        {
            accessorKey: "remarks",
            header: "Remarks",
            cell: ({ row }) =>
                row.original.remarks || "-",
        },

        {
            id: "actions",
            header: "Actions",

            cell: ({ row }) => {

                const payment = row.original

                return (
                    <div className="flex gap-2">

                        <Link
                            href={`/payments/${payment.id}/edit`}
                            className="rounded-lg bg-[#02F5A1] px-3 py-2 text-sm font-medium text-black hover:bg-[#00d98f]"
                        >
                            Edit
                        </Link>

                        <button
                            type="button"
                            onClick={() => onDelete(payment.id)}
                            className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                        >
                            Delete
                        </button>

                    </div>
                )
            },
        },
    ]