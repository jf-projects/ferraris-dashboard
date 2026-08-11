/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import {
    // Eye,
    Pencil,
    Trash2,
} from "lucide-react"

export type Client = {
    id: number
    firstName: string
    middleName: string | null
    lastName: string
    email: string | null
    clientNumber: string | null
    address: string | null
    createdAt: string
}

export const columns = (
    onDelete: (id: number) => void
): ColumnDef<any>[] => [
        {
            id: "fullName",
            header: "Name",

            accessorFn: (row) =>
                `${row.firstName} ${row.lastName}`,

            cell: ({ row }) => (
                <span>
                    {row.original.firstName} {row.original.lastName}
                </span>
            ),
        },

        {
            accessorKey: "email",
            header: "Email",

            cell: ({ row }) => (
                <span>
                    {row.original.email || "-"}
                </span>
            ),
        },

        {
            accessorKey: "clientNumber",
            header: "Contact",

            cell: ({ row }) => (
                <span>
                    {row.original.clientNumber || "-"}
                </span>
            ),
        },

        {
            accessorKey: "address",
            header: "Address",

            cell: ({ row }) => (
                <span>
                    {row.original.address || "-"}
                </span>
            ),
        },

        {
            id: "actions",
            header: "Actions",

            cell: ({ row }) => {
                const client = row.original

                return (
                    <div className="flex items-center gap-1">
{/* 
                        <Link
                            href={`/clients/${client.id}`}
                            title="View Client"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#07191E] text-white transition hover:bg-[#16343B]"
                        >
                            <Eye className="h-4 w-4" />
                        </Link> */}

                        <Link
                            href={`/clients/${client.id}/edit`}
                            title="Edit Client"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#02F5A1] text-black transition hover:bg-[#00d98f]"
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => onDelete(client.id)}
                            title="Delete Client"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                    </div>
                )
            },
        },
    ]