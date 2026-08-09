import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { Client } from "@/app/db/schema";
import { createAuditLog } from "../../logs/route";

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
        console.log(client);

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

        if (email) {
            const duplicate = await db
                .select()
                .from(Client)
                .where(
                    and(
                        eq(Client.email, email),
                        isNull(Client.deletedAt)
                    )
                )
                .limit(1)

            if (
                duplicate.length &&
                duplicate[0].id !== clientId
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already exists.",
                    },
                    {
                        status: 409,
                    }
                )
            }
        }

        const [updatedClient] = await db
            .update(Client)
            .set({
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
                updatedAt: new Date(),
            })
            .where(eq(Client.id, clientId))
            .returning()

        console.log("OLD:", oldClient)
        console.log("NEW:", updatedClient)

        await createAuditLog({
            userId: "74cd4a4b-3830-49e5-b3dd-083ba22ab23c",
            action: "UPDATE",
            entity: "Client",
            modelId: clientId,
            oldValue: oldClient,
            newValue: updatedClient,
        })

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
        const { id } = await params;

        const existingClient = await db
            .select()
            .from(Client)
            .where(
                and(
                    eq(Client.id, Number(id)),
                    isNull(Client.deletedAt)
                )
            )
            .limit(1);

        if (!existingClient.length) {
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

        await db
            .update(Client)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(Client.id, Number(id)));

        return NextResponse.json({
            success: true,
            message: "Client deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete client.",
            },
            {
                status: 500,
            }
        );
    }
}