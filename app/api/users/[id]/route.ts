import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { User } from "@/app/db/schema";
import { supabaseAdmin } from "@/lib/superAdmin";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await db
            .select()
            .from(User)
            .where(and(eq(User.id, id), isNull(User.deletedAt)))
            .limit(1);

        if (!user.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: user[0],
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch user.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, email, type } = await request.json();

        if (!name || !email || !type) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, email and type are required.",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUser = await db
            .select()
            .from(User)
            .where(and(eq(User.id, id), isNull(User.deletedAt)))
            .limit(1);

        if (!existingUser.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
            email,
        });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 400,
                }
            );
        }

        const updatedUser = await db
            .update(User)
            .set({
                name,
                email,
                type,
                updatedAt: new Date(),
            })
            .where(eq(User.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            message: "User updated successfully.",
            data: updatedUser[0],
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update user.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existingUser = await db
            .select()
            .from(User)
            .where(and(eq(User.id, id), isNull(User.deletedAt)))
            .limit(1);

        if (!existingUser.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
            ban_duration: "876000h", // ~100 years
        });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                {
                    status: 400,
                }
            );
        }

        await db
            .update(User)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(User.id, id));

        return NextResponse.json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete user.",
            },
            {
                status: 500,
            }
        );
    }
}