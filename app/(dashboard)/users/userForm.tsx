/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserFormProps {
    user?: any
}

export function UserForm({ user }: UserFormProps) {

    const router = useRouter()

    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        name: "",
        email: "",
        type: "",
        password: "",
    })

    useEffect(() => {
        const loadForm = () => {
            setForm({
                name: user.name ?? "",
                email: user.email ?? "",
                type: user.type ?? "",
                password: "",
            })
        }

        if (!user) return
        loadForm();
    }, [user])

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) {

        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value,
        }))

    }

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault()

        if (!form.name.trim()) {
            toast.error("Name is required.")
            return
        }

        if (!form.email.trim()) {
            toast.error("Email is required.")
            return
        }

        if (!form.type) {
            toast.error("User type is required.")
            return
        }

        if (!user && !form.password) {
            toast.error("Password is required.")
            return
        }

        setLoading(true)

        try {

            const payload: any = {
                name: form.name,
                email: form.email,
                type: form.type,
            }

            /*
            |--------------------------------------------------------------------------
            | PASSWORD
            |--------------------------------------------------------------------------
            |
            | Create:
            | password is required.
            |
            | Edit:
            | only send password if the user entered
            | a new one.
            |
            */

            if (form.password.trim()) {
                payload.password = form.password
            }

            const response = await fetch(
                user
                    ? `/api/users/${user.id}`
                    : "/api/users",
                {
                    method: user ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Failed to save user."
                )
            }

            toast.success(
                user
                    ? "User updated successfully."
                    : "User created successfully."
            )

            router.push("/users")
            router.refresh()

        } catch (error: any) {

            console.error(error)

            toast.error(
                error.message ||
                "Failed to save user."
            )

        } finally {

            setLoading(false)

        }
    }

    const input =
        "w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6"
        >

            {/* HEADER */}

            <div>
                <h2 className="text-xl font-semibold text-white">
                    User Information
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    {user
                        ? "Update the user's information."
                        : "Create a new system user."}
                </p>
            </div>


            {/* FORM */}

            <div className="grid gap-5 md:grid-cols-2">

                <Input
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                />

                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                />

                <SelectInput
                    label="Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    options={[
                        {
                            value: "Administrator",
                            label: "Administrator",
                        },
                        {
                            value: "Staff",
                            label: "Staff",
                        },
                    ]}
                />

                <Input
                    label={
                        user
                            ? "New Password"
                            : "Password"
                    }
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                        user
                            ? "Leave blank to keep current password"
                            : "Enter password"
                    }
                />

            </div>


            {/* ACTIONS */}

            <div className="flex items-center justify-end gap-3 border-t border-[#1f3a40] pt-6">

                <button
                    type="button"
                    onClick={() => router.push("/users")}
                    disabled={loading}
                    className="rounded-lg border border-[#1f3a40] bg-[#07191E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#16343B] disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-[#02F5A1] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00d98d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : user
                            ? "Update User"
                            : "Create User"}
                </button>

            </div>

        </form>
    )
}


function Input({
    label,
    ...props
}: any) {

    return (
        <div>

            <label className="mb-2 block text-sm text-slate-300">
                {label}
            </label>

            <input
                {...props}
                className="w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#02F5A1]"
            />

        </div>
    )
}


function SelectInput({
    label,
    options,
    ...props
}: any) {

    return (
        <div>

            <label className="mb-2 block text-sm text-slate-300">
                {label}
            </label>

            <select
                {...props}
                className="w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-white outline-none focus:border-[#02F5A1]"
            >

                <option value="">
                    Select {label}
                </option>

                {options.map((option: any) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}

            </select>

        </div>
    )
}