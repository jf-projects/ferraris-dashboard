/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ClientFormProps {
    client?: any
}

export function ClientForm({ client }: ClientFormProps) {

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        gender: "",
        civilStatus: "",
        clientNumber: "",
        clientLandline: "",
        spouseFirstName: "",
        spouseMiddleName: "",
        spouseLastName: "",
        bday: "",
        email: "",
        clientId: "",
        image: "",
    })

    useEffect(() => {
        const loadClient = () => {
            setForm({
                firstName: client.firstName ?? "",
                middleName: client.middleName ?? "",
                lastName: client.lastName ?? "",
                address: client.address ?? "",

                gender: client.gender
                    ? client.gender.charAt(0).toUpperCase() +
                    client.gender.slice(1).toLowerCase()
                    : "",

                civilStatus: client.civilStatus
                    ? client.civilStatus.charAt(0).toUpperCase() +
                    client.civilStatus.slice(1).toLowerCase()
                    : "",

                clientNumber: client.clientNumber ?? "",
                clientLandline: client.clientLandline ?? "",

                spouseFirstName: client.spouseFirstName ?? "",
                spouseMiddleName: client.spouseMiddleName ?? "",
                spouseLastName: client.spouseLastName ?? "",

                bday: client.bday?.substring(0, 10) ?? "",

                email: client.email ?? "",
                clientId: client.clientId ?? "",
                image: client.image ?? "",
            })
        }
        if (client) {
            loadClient();
        }
    }, [client])

    const inputClass = "w-full rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-sm text-white outline-none focus:border-[#02F5A1]"

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleImage(
        e: React.ChangeEvent<HTMLInputElement>,
        field: "clientId" | "image"
    ) {
        const file = e.target.files?.[0]

        if (!file) return

        setUploading(true)

        try {
            const folder = field === "clientId" ? "client-id" : "profile"

            const fileName = `${folder}/${Date.now()}-${file.name}`

            const { error } = await supabase.storage
                .from("FerrarisClients")
                .upload(fileName, file)

            if (error) {
                console.error(error)
                return
            }

            const { data } = supabase.storage
                .from("FerrarisClients")
                .getPublicUrl(fileName)

            setForm(prev => ({
                ...prev,
                [field]: data.publicUrl
            }))
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(
                client
                    ? `/api/clients/${client.id}`
                    : "/api/clients",
                {
                    method: client ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(
                    data.message || "Failed to save client."
                )
            }

            toast.success(
                client
                    ? "Client updated successfully."
                    : "Client created successfully."
            )

            router.push("/clients")
            router.refresh()

        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save client."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_350px]">

            <div className="space-y-6 rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6">

                <SectionTitle title="Client Information" description="Basic client details" />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} />
                    <Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} className={inputClass} />
                    <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Field label="Email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
                    <Field label="Client Number" name="clientNumber" value={form.clientNumber} onChange={handleChange} className={inputClass} />
                    <Field label="Landline" name="clientLandline" value={form.clientLandline} onChange={handleChange} className={inputClass} />
                </div>

                <Field label="Address" name="address" value={form.address} onChange={handleChange} className={inputClass} />

                <SectionTitle title="Personal Information" description="" />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Field label="Birthday" name="bday" type="date" value={form.bday} onChange={handleChange} className={inputClass} />
                    <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} className={inputClass} options={["Male", "Female"]} />
                    <SelectField label="Civil Status" name="civilStatus" value={form.civilStatus} onChange={handleChange} className={inputClass} options={["Single", "Married", "Widowed"]} />
                </div>

                <SectionTitle title="Spouse Information" description="" />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <Field label="First Name" name="spouseFirstName" value={form.spouseFirstName} onChange={handleChange} className={inputClass} />
                    <Field label="Middle Name" name="spouseMiddleName" value={form.spouseMiddleName} onChange={handleChange} className={inputClass} />
                    <Field label="Last Name" name="spouseLastName" value={form.spouseLastName} onChange={handleChange} className={inputClass} />
                </div>

            </div>


            <div className="h-fit space-y-6 rounded-2xl border border-[#1f3a40] bg-[#10272D] p-6">

                <SectionTitle title="Images" description="Client identification" />

                <ImageUpload label="Client ID Image" value={form.clientId} loading={uploading} onChange={(e) => handleImage(e, "clientId")} />

                <ImageUpload label="Profile Image" value={form.image} loading={uploading} onChange={(e) => handleImage(e, "image")} />

                <div className="flex gap-3 border-t border-[#1f3a40] pt-6">

                    <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg bg-[#07191E] px-4 py-3 text-white">
                        Cancel
                    </button>

                    <button type="submit" disabled={loading || uploading} className="flex-1 rounded-lg bg-[#02F5A1] px-4 py-3 text-black disabled:opacity-50">
                        {loading ? "Saving..." : "Save"}
                    </button>

                </div>

            </div>

        </form>
    )

}


function SectionTitle({ title, description }: { title: string, description: string }) {

    return (
        <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
    )

}


function Field({ label, className, ...props }: any) {

    return (
        <div className="space-y-2">
            <label className="block text-sm text-slate-300">{label}</label>
            <input {...props} className={className} />
        </div>
    )

}


function SelectField({ label, options, className, ...props }: any) {

    return (
        <div className="space-y-2">
            <label className="block text-sm text-slate-300">{label}</label>
            <select {...props} className={className}>
                <option value="">Select {label}</option>
                {options.map((x: string) => <option key={x}>{x}</option>)}
            </select>
        </div>
    )

}


function ImageUpload({ label, value, loading, onChange }: { label: string, value: string, loading: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {

    return (
        <div className="space-y-3">

            <label className="block text-sm text-slate-300">{label}</label>

            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-[#1f3a40] bg-[#07191E] px-4 py-3 text-sm text-white transition hover:bg-[#16343B]">
                {loading ? "Uploading..." : "Choose Image"}
                <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            </label>

            {value && <div className="overflow-hidden rounded-xl border border-[#1f3a40]"><img src={value} alt={label} className="h-48 w-full object-cover" /></div>}

        </div>
    )

}