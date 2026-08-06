import ClientTable from "@/components/ClientTable";

export default function ClientsPage() {
  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Clients
          </h1>

          <p className="mt-1 text-slate-400">
            Manage all your clients in one place.
          </p>
        </div>

        <button className="rounded-xl bg-[#02F5A1] px-5 py-3 font-semibold text-[#07191E] transition hover:bg-[#00d98f]">
          + Add Client
        </button>

      </div>

      <ClientTable />

    </div>
  );
}