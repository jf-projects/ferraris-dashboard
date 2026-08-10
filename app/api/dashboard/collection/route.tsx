/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { db } from "@/app/db"

export async function GET() {
    try {
        const data = await db.execute(sql`
            SELECT
                TO_CHAR(DATE_TRUNC('month', "paymentDate"), 'Mon') AS month,
                TO_CHAR(DATE_TRUNC('month', "paymentDate"), 'YYYY-MM') AS month_key,
                COALESCE(SUM("amount"), 0) AS total
            FROM "Payment"
            WHERE "deletedAt" IS NULL
                AND "paymentDate" >= DATE_TRUNC(
                    'month',
                    CURRENT_DATE - INTERVAL '11 months'
                )
                AND "paymentDate" < DATE_TRUNC(
                    'month',
                    CURRENT_DATE + INTERVAL '1 month'
                )
            GROUP BY DATE_TRUNC('month', "paymentDate")
            ORDER BY DATE_TRUNC('month', "paymentDate")
        `)

        const result = data.map((item: any) => ({
            month: item.month,
            monthKey: item.month_key,
            total: Number(item.total),
        }))

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load collections.",
            },
            {
                status: 500,
            }
        )
    }
}