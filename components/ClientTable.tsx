"use client";

import { Search, Download } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    phone: "09171234567",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@email.com",
    phone: "09181234567",
    status: "Lead",
  },
  {
    id: 3,
    name: "Michael Cruz",
    email: "michael@email.com",
    phone: "09191234567",
    status: "Inactive",
  },
];

export default function ClientTable() {
  return (
    <div className="rounded-2xl border border-[#02F5A1]/10 bg-[#10272D]">

      {/* Toolbar */}

      <div className="flex flex-col gap-4 border-b border-[#02F5A1]/10 p-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="relative w-full max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            placeholder="Search clients..."
            className="h-12 w-full rounded-xl border border-[#02F5A1]/10 bg-[#07191E] pl-11 pr-4 text-white outline-none focus:border-[#02F5A1]"
          />

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-[#02F5A1]/10 bg-[#07191E] px-5 py-3 text-white transition hover:border-[#02F5A1]">

          <Download size={18} />

          Export

        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b border-[#02F5A1]/10 text-left">

              <th className="p-5 text-sm font-semibold text-slate-400">
                Name
              </th>

              <th className="p-5 text-sm font-semibold text-slate-400">
                Email
              </th>

              <th className="p-5 text-sm font-semibold text-slate-400">
                Phone
              </th>

              <th className="p-5 text-sm font-semibold text-slate-400">
                Status
              </th>

              <th className="p-5 text-sm font-semibold text-slate-400">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {clients.map((client) => (

              <tr
                key={client.id}
                className="border-b border-[#02F5A1]/5 transition hover:bg-[#07191E]"
              >

                <td className="p-5 font-medium text-white">
                  {client.name}
                </td>

                <td className="p-5 text-slate-300">
                  {client.email}
                </td>

                <td className="p-5 text-slate-300">
                  {client.phone}
                </td>

                <td className="p-5">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      client.status === "Active"
                        ? "bg-green-500/15 text-green-400"
                        : client.status === "Lead"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {client.status}
                  </span>

                </td>

                <td className="p-5">
                  <button className="rounded-lg px-3 py-2 text-slate-400 hover:bg-[#10272D] hover:text-white">
                    ⋮
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between p-6 text-sm text-slate-400">

        <span>
          Showing 1–3 of 3 clients
        </span>

        <div className="flex gap-2">

          <button className="h-10 w-10 rounded-lg bg-[#07191E] text-white">
            1
          </button>

        </div>

      </div>

    </div>
  );
}