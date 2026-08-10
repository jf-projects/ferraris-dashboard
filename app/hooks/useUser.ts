"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (mounted) {
                setUser(user)
                setLoading(false)
            }
        }

        getUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (mounted) {
                    setUser(session?.user ?? null)
                    setLoading(false)
                }
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return {
        user,
        name: user?.user_metadata?.name ?? "",
        type: user?.user_metadata?.type ?? "",
        loading,
    }
}