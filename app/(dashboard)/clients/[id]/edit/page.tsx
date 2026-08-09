import { ClientForm } from "../../clientForm"
import { cookies } from "next/headers"

async function getClient(id: number) {

    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/clients/${id}`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader
            }
        }
    )

    const data = await response.json()

    return data.data
}


export default async function EditClientPage({
    params
}: {
    params: Promise<{ id: number }>
}) {
    const { id } = await params

    const client = await getClient(id)

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Edit Client
                </h1>

                <p className="text-sm text-slate-400">
                    Update client information
                </p>
            </div>

            <ClientForm client={client} />

        </div>
    )
}