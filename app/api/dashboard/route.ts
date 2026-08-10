import { NextResponse } from "next/server"
import { isNull, sql } from "drizzle-orm"

import { db } from "@/app/db"
import {
    Client,
    LotTransaction,
    Payment,
} from "@/app/db/schema"

export async function GET() {
    try {
        const [
            clientsResult,
            propertiesResult,
            collectionsResult,
            outstandingResult,
        ] = await Promise.all([
            db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(Client)
                .where(isNull(Client.deletedAt)),

            db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(LotTransaction)
                .where(isNull(LotTransaction.deletedAt)),

            db
                .select({
                    total: sql<string>`
                        coalesce(
                            sum(${Payment.amount}),
                            0
                        )
                    `,
                })
                .from(Payment)
                .where(isNull(Payment.deletedAt)),

            db
                .select({
                    outstanding: sql<string>`
                        coalesce(
                            sum(
                                coalesce(
                                    ${LotTransaction.propertyTotalAmount},
                                    0
                                )
                                -
                                coalesce(
                                    (
                                        select sum(${Payment.amount})
                                        from ${Payment}
                                        where
                                            ${Payment.lotTransactionId}
                                            =
                                            ${LotTransaction.id}
                                            and ${Payment.deletedAt} is null
                                    ),
                                    0
                                )
                            ),
                            0
                        )
                    `,
                })
                .from(LotTransaction)
                .where(isNull(LotTransaction.deletedAt)),
        ])

        const totalClients = Number(
            clientsResult[0]?.count ?? 0
        )

        const activeProperties = Number(
            propertiesResult[0]?.count ?? 0
        )

        const totalCollection = Number(
            collectionsResult[0]?.total ?? 0
        )

        const outstandingBalance = Number(
            outstandingResult[0]?.outstanding ?? 0
        )

        return NextResponse.json({
            success: true,
            data: {
                totalClients,
                activeProperties,
                totalCollection,
                outstandingBalance,
            },
        })
    } catch (error) {
        console.error("Dashboard API error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load dashboard data.",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            }
        )
    }
}