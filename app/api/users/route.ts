import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { User } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/superAdmin";
import { isNull } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { name, email, password, type } = await request.json();

        // Check if user already exists
        const existing = await db
            .select()
            .from(User)
            .where(eq(User.email, email))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email already exists.",
                },
                { status: 400 }
            );
        }

        // Create Supabase Auth user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: 400 }
            );
        }

        try {
            await db.insert(User).values({
                id: data.user.id,
                name,
                email,
                type,
            });

            return NextResponse.json({
                success: true,
                message: "User created successfully.",
            });
        } catch (err) {
            // Roll back auth user
            await supabaseAdmin.auth.admin.deleteUser(data.user.id);

            throw err;
        }
    } catch (err) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
            },
            {
                status: 500,
            }
        );
    }
}

export async function GET() {
    try {
        const users = await db
            .select()
            .from(User)
            .where(isNull(User.deletedAt));

        return NextResponse.json({
            success: true,
            data: users,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch users.",
            },
            {
                status: 500,
            }
        );
    }
}