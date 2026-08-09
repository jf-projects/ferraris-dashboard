/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { columns } from "./columns"
import { DataTable } from "@/components/table/datatable"
import { toast } from "sonner"

export default function UsersPage() {

    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchUsers() {

        try {

            setLoading(true)

            const response = await fetch("/api/users")

            const data = await response.json()

            if (data.success) {
                setUsers(data.data)
            }

        } catch (error) {

            console.error(error)
            toast.error("Failed to load users.")

        } finally {

            setLoading(false)

        }

    }

    useEffect(() => {
        const loadUsers = () => {
            fetchUsers()
        }

        loadUsers()
    }, [])

    async function handleDelete(id: string) {

        toast("Delete this User?", {
            description: "This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {

                    try {

                        const res = await fetch(
                            `/api/users/${id}`,
                            {
                                method: "DELETE",
                            }
                        )

                        const data = await res.json()

                        if (data.success) {

                            toast.success(
                                "User deleted successfully."
                            )

                            fetchUsers()

                        } else {

                            toast.error(
                                data.message ||
                                "Failed to delete user."
                            )

                        }

                    } catch (error) {

                        console.error(error)

                        toast.error(
                            "Failed to delete user."
                        )

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

            {/* HEADER */}

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Users
                    </h1>

                    <p className="text-sm text-slate-400">
                        Manage all users
                    </p>
                </div>

                <Link
                    href="/users/create"
                    className="rounded-lg bg-[#02F5A1] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#00d98d]"
                >
                    + Add User
                </Link>

            </div>


            {/* TABLE */}

            {loading ? (

                <div className="rounded-2xl border border-[#1f3a40] bg-[#10272D] p-10 text-center text-slate-400">
                    Loading users...
                </div>

            ) : (

                <DataTable
                    columns={columns(handleDelete)}
                    data={users}
                    searchColumn="name"
                    searchPlaceholder="Search users..."
                    emptyMessage="No users found"
                    exportFileName="Users.xlsx"
                />

            )}

        </div>
    )
}