import { NextResponse } from "next/server"
import { db } from "@/app/db"
import { Client } from "@/app/db/schema"
import { desc, isNull } from "drizzle-orm"

export async function GET() {
    try {
        const [client] = await db
            .select({
                clientId: Client.id,
            })
            .from(Client)
            .where(
                isNull(Client.deletedAt)
            )
            .orderBy(
                desc(Client.id)
            )
            .limit(1)

        if (!client) {
            return NextResponse.json({
                success: true,
                clientId: null,
            })
        }

        return NextResponse.json({
            success: true,
            clientId: client.clientId,
        })
    } catch (error) {
        console.error(
            "Failed to get last client ID:",
            error
        )

        return NextResponse.json(
            {
                success: false,
                message: "Failed to get last client ID.",
            },
            { status: 500 }
        )
    }
}