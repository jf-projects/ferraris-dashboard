import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

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


export const columns: ColumnDef<Client>[] = [

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
                <div className="flex gap-2">

                    <Link
                        href={`/clients/${client.id}`}
                        className="rounded-lg bg-[#07191E] px-3 py-1 text-sm text-white hover:bg-[#16343B]"
                    >
                        View
                    </Link>

                    <Link
                        href={`/clients/${client.id}/edit`}
                        className="rounded-lg bg-[#02F5A1] px-3 py-1 text-sm text-black hover:bg-[#00d98f]"
                    >
                        Edit
                    </Link>

                    <button
                        onClick={() => console.log("Delete", client.id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    >
                        Delete
                    </button>

                </div>
            )
        },
    }

]