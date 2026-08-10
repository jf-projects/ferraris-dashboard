/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { ClientTable } from "./client-table"
import { columns } from "./columns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ClientsPage() {
  const router = useRouter()

  const [clients, setClients] = useState<any[]>([])

  async function fetchClients() {
    const response = await fetch("/api/clients")
    const data = await response.json()

    setClients(data.data)
  }
  async function handleDelete(id: number) {
    toast("Delete this client?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/clients/${id}`, {
              method: "DELETE",
            })

            const data = await res.json()

            if (data.success) {
              toast.success("Client deleted successfully.")
              fetchClients()
            } else {
              toast.error(data.message)
            }
          } catch (error) {
            console.error(error)
            toast.error("Failed to delete client.")
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => { },
      },
    })
  }

  useEffect(() => {
    const loadClietns = () => {
      fetchClients()

    }
    loadClietns();
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Clients
          </h1>

          <p className="text-sm text-slate-400">
            Manage your clients
          </p>
        </div>

        <Link
          href="/clients/create"
          className="rounded-lg bg-[#02F5A1] px-4 py-2 text-black transition hover:bg-[#00d98f]"
        >
          Add Client
        </Link>
      </div>

      <ClientTable
        columns={columns(handleDelete)}
        data={clients}
      />
    </div>
  )
}