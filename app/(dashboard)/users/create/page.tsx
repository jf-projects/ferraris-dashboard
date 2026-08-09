import { UserForm } from "../userForm"

export default function CreateUserPage() {

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-semibold text-white">
                    Create User
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Add a new system user
                </p>
            </div>

            <UserForm />

        </div>
    )
}