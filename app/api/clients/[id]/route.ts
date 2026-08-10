/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { Client } from "@/app/db/schema";
import { createAuditLog } from "@/lib/audit-log";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const client = await db
            .select()
            .from(Client)
            .where(
                and(
                    eq(Client.id, Number(id)),
                    isNull(Client.deletedAt)
                )
            )
            .limit(1);

        if (!client.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: client[0],
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch client.",
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
        const { id } = await params
        const clientId = Number(id)
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const body = await request.json()

        const {
            firstName,
            middleName,
            lastName,
            address,
            gender,
            civilStatus,
            clientNumber,
            clientLandline,
            spouseFirstName,
            spouseMiddleName,
            spouseLastName,
            bday,
            image,
            email,
            clientId: clientIdValue,
        } = body

        const existingClient = await db
            .select()
            .from(Client)
            .where(
                and(
                    eq(Client.id, clientId),
                    isNull(Client.deletedAt)
                )
            )
            .limit(1)

        if (!existingClient.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client not found.",
                },
                {
                    status: 404,
                }
            )
        }

        const oldClient = existingClient[0]

        const [updatedClient] = await db
            .update(Client)
            .set({
                firstName,
                middleName: middleName || null,
                lastName,
                address: address || null,
                gender: gender || null,
                civilStatus: civilStatus || null,
                clientNumber: clientNumber || null,
                clientLandline: clientLandline || null,
                spouseFirstName: spouseFirstName || null,
                spouseMiddleName: spouseMiddleName || null,
                spouseLastName: spouseLastName || null,
                bday: bday || null,
                image: image || null,
                email: email || null,
                clientId: clientIdValue || null,
                updatedAt: new Date(),
            })
            .where(
                eq(Client.id, clientId)
            )
            .returning()

        if (user) {
            await createAuditLog({
                userId: user.id,
                action: "UPDATE",
                entity: "Client",
                modelId: clientId,
                oldValue: oldClient,
                newValue: updatedClient,
            })
        }


        return NextResponse.json({
            success: true,
            message: "Client updated successfully.",
            data: updatedClient,
        })
    } catch (error) {
        console.error("Update client error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update client.",
                error: error
            },
            {
                status: 500,
            }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const clientId = Number(id)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (Number.isNaN(clientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid client ID.",
                },
                {
                    status: 400,
                }
            )
        }

        const existingClient = await db
            .select()
            .from(Client)
            .where(
                and(
                    eq(Client.id, clientId),
                    isNull(Client.deletedAt)
                )
            )
            .limit(1)

        if (!existingClient.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client not found.",
                },
                {
                    status: 404,
                }
            )
        }

        await db
            .update(Client)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(Client.id, clientId))

        if (user) {
            await createAuditLog({
                userId: user.id,
                action: "DELETE",
                entity: "Client",
                modelId: existingClient[0].id,
                oldValue: existingClient[0],
                newValue: null,
            })
        }

        return NextResponse.json({
            success: true,
            message: "Client deleted successfully.",
        })
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
                cause: error.cause,
            },
            {
                status: 500,
            }
        );
    }
}