"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid email or password");
                return;
            }


            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            });
            // Save your database user information to the Supabase session
            await supabase.auth.updateUser({
                data: {
                    name: data.user.user_metadata.name,
                    type: data.user.user_metadata.type,
                },
            });

            router.replace("/dashboard");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex items-center justify-center p-10 lg:p-20">
            <div className="w-full max-w-md">
                <span className="text-sm font-medium uppercase tracking-widest text-[#02F5A1]">
                    Welcome Back
                </span>

                <h1 className="mt-4 text-5xl font-bold text-white">
                    Sign In
                </h1>

                <p className="mt-3 text-slate-400">
                    Login to access your admin dashboard.
                </p>

                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                    <AuthInput
                        label="Email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <AuthInput
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                className="accent-[#02F5A1]"
                            />
                            Remember me
                        </label>

                        <button
                            type="button"
                            className="text-sm text-[#02F5A1] hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 w-full rounded-xl bg-[#02F5A1] text-lg font-semibold text-[#07191E] transition hover:bg-[#00D68F] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </section>
    );
}