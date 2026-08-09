import { TransactionForm } from "../transactionForm"

export default function CreateTransactionPage() {
    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Add Lot Transaction
                </h1>

                <p className="text-sm text-slate-400">
                    Create a new lot transaction
                </p>
            </div>

            <TransactionForm />

        </div>
    )
}