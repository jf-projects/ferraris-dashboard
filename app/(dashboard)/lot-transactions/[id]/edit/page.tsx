import { TransactionForm } from "../../transactionForm"
import { cookies } from "next/headers"

async function getTransaction(id: number) {

    const cookieStore = await cookies()

    const cookieHeader = cookieStore
        .getAll()
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join("; ")

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/lot-transactions/${id}`,
        {
            cache: "no-store",
            headers: {
                Cookie: cookieHeader,
            },
        }
    )

    const data = await response.json()

    console.log(data)

    return data.data
}

export default async function EditTransactionPage({
    params,
}: {
    params: Promise<{ id: number }>
}) {

    const { id } = await params

    const transaction = await getTransaction(id)

    console.log(transaction)

    return (
        <div className="space-y-6">

            <div>

                <h1 className="text-2xl font-semibold text-white">
                    Edit Transaction
                </h1>

                <p className="text-sm text-slate-400">
                    Update transaction information
                </p>

            </div>

            <TransactionForm transaction={transaction} />

        </div>
    )
}