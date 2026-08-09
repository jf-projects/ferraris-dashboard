import { NextResponse } from "next/server";
import { and, eq, isNull, asc } from "drizzle-orm";

import { db } from "@/app/db";
import { Client } from "@/app/db/schema";

export async function GET() {
    try {
        const clients = await db
            .select()
            .from(Client)
            .where(isNull(Client.deletedAt))
            .orderBy(asc(Client.id));

        return NextResponse.json({
            success: true,
            data: clients,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch clients.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

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
            clientId,
        } = body;

        if (!firstName || !lastName) {
            return NextResponse.json(
                {
                    success: false,
                    message: "First name and last name are required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (email) {
            const existingClient = await db
                .select()
                .from(Client)
                .where(
                    and(
                        eq(Client.email, email),
                        isNull(Client.deletedAt)
                    )
                )
                .limit(1);

            if (existingClient.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already exists.",
                    },
                    {
                        status: 409,
                    }
                );
            }
        }

        const insertedClient = await db
            .insert(Client)
            .values({
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
                clientId,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Client created successfully.",
                data: insertedClient[0],
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create client.",
            },
            {
                status: 500,
            }
        );
    }
}