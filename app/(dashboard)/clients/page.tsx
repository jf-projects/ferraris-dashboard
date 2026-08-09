/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { ClientTable } from "./client-table"
import { columns } from "./columns"
import Link from "next/link"


export default function ClientsPage() {

  const [clients, setClients] = useState<any[]>([])

  async function fetchClients() {

    const response = await fetch("/api/clients")
    const data = await response.json()

    setClients(data.data)
  }


  useEffect(() => {
    const loadData = () => {
      fetchClients()
    }
    loadData()
  }, [])


  return (
    <div className="space-y-6">

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
        columns={columns}
        data={clients}
      />

    </div>
  )
}