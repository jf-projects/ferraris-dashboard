/* eslint-disable @typescript-eslint/no-explicit-any */

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns = (
    handleDelete: (id: string) => void
): ColumnDef<any>[] => [

        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <span className="font-medium text-white">
                    {row.original.name}
                </span>
            ),
        },

        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-slate-300">
                    {row.original.email}
                </span>
            ),
        },

        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <span className="inline-flex rounded-full bg-[#02F5A1]/10 px-3 py-1 text-xs font-medium text-[#02F5A1]">
                    {row.original.type}
                </span>
            ),
        },

        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => (
                <span className="text-slate-400">
                    {new Date(
                        row.original.createdAt
                    ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>
            ),
        },

        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {

                const user = row.original

                return (
                    <div className="flex items-center gap-3">

                        <Link
                            href={`/users/${user.id}/edit`}
                            className="rounded-lg bg-[#02F5A1] px-3 py-1 text-sm text-black hover:bg-[#00d98f]"
                        >
                            Edit
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(user.id)
                            }
                            className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                        >
                            Delete
                        </button>

                    </div>
                )
            },
        },
    ]