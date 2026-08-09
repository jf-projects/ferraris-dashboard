import { cookies } from "next/headers"
import { UserForm } from "../../userForm"

async function getUser(id: string) {

    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/users/${id}`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader,
            },
        }
    )

    const data = await response.json()

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
            "Failed to load user."
        )
    }

    return data.data
}

export default async function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params

    const user = await getUser(id)

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Edit User
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Update user information
                </p>
            </div>

            <UserForm user={user} />

        </div>
    )
}