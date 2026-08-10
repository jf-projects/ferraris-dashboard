/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { db } from "@/app/db"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const year = Number(searchParams.get("year"))
        const month = Number(searchParams.get("month"))

        if (!year || !month || month < 1 || month > 12) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Valid year and month are required.",
                },
                { status: 400 }
            )
        }

        // Get all payments for the selected month
        const payments = await db.execute(sql`
            SELECT
                p."id",
                p."lotTransactionId",
                p."amount",
                p."bank",
                p."paymentDate",
                p."remarks",
                p."createdAt",
                p."updatedAt",

                c."id" AS "clientId",

                CONCAT_WS(
                    ' ',
                    c."firstName",
                    c."middleName",
                    c."lastName"
                ) AS "clientName",

                lt."propertyUnit",
                lt."unitBlock",
                lt."unitLot"

            FROM "Payment" p

            LEFT JOIN "LotTransaction" lt
                ON lt."id" = p."lotTransactionId"

            LEFT JOIN "Client" c
                ON c."id" = lt."clientId"

            WHERE p."deletedAt" IS NULL
                AND p."paymentDate" >= MAKE_DATE(${year}, ${month}, 1)
                AND p."paymentDate" < MAKE_DATE(${year}, ${month}, 1) + INTERVAL '1 month'

            ORDER BY
                p."paymentDate" ASC,
                p."id" ASC
        `)

        // Get summary
        const summary = await db.execute(sql`
            SELECT
                COUNT(*)::integer AS "paymentCount",

                COALESCE(
                    SUM(p."amount"),
                    0
                ) AS "totalAmount",

                COALESCE(
                    AVG(p."amount"),
                    0
                ) AS "averagePayment",

                COUNT(
                    DISTINCT p."lotTransactionId"
                )::integer AS "transactionCount"

            FROM "Payment" p

            WHERE p."deletedAt" IS NULL
                AND p."paymentDate" >= MAKE_DATE(${year}, ${month}, 1)
                AND p."paymentDate" < MAKE_DATE(${year}, ${month}, 1) + INTERVAL '1 month'
        `)

        const summaryData = summary[0] as any

        const result = payments.map((payment: any) => ({
            id: payment.id,
            lotTransactionId: payment.lotTransactionId,

            client: {
                id: payment.clientId,
                name: payment.clientName,
            },

            property: {
                unit: payment.propertyUnit,
                block: payment.unitBlock,
                lot: payment.unitLot,
            },

            amount: Number(payment.amount || 0),
            bank: payment.bank,
            paymentDate: payment.paymentDate,
            remarks: payment.remarks,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        }))

        return NextResponse.json({
            success: true,

            period: {
                year,
                month,
            },

            summary: {
                total: Number(summaryData?.totalAmount || 0),
                paymentCount: Number(summaryData?.paymentCount || 0),
                transactionCount: Number(
                    summaryData?.transactionCount || 0
                ),
                averagePayment: Number(
                    summaryData?.averagePayment || 0
                ),
            },

            payments: result,
        })
    } catch (error) {
        console.error("Payment report error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate payment report.",
            },
            {
                status: 500,
            }
        )
    }
}