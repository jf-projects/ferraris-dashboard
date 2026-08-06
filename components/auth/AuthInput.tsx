type Props = {
    label: string;
    placeholder: string;
    type?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function AuthInput({
    label,
    placeholder,
    type = "text",
    value,
    onChange,
}: Props) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="h-14 w-full rounded-xl border border-[#02F5A1]/10 bg-[#14363E] px-5 text-white outline-none transition focus:border-[#02F5A1] focus:ring-2 focus:ring-[#02F5A1]/20"
            />
        </div>
    );
}