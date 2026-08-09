import { ClientForm } from "../clientForm"


export default function CreateClientPage() {

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Add Client
                </h1>

                <p className="text-sm text-slate-400">
                    Create a new client record
                </p>
            </div>


            <ClientForm />

        </div>
    )
}