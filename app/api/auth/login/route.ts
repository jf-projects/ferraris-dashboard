import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/app/db";
import { User } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 401,
            }
        );
    }

    // Get user details from your User table
    const [user] = await db
        .select({
            id: User.id,
            name: User.name,
            email: User.email,
            type: User.type,
        })
        .from(User)
        .where(eq(User.id, data.user.id))
        .limit(1)

    const response = NextResponse.json({
        success: true,
        user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: {
                name: user.name,
                type: user.type,
            },
        },
        session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
        },
    });

    response.cookies.set("access_token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
    });

    response.cookies.set("refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });

    return response;
}