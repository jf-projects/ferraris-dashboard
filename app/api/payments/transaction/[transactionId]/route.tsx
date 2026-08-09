import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/app/db"
import { Payment } from "@/app/db/schema"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ transactionId: string }> }
) {

    try {

        const { transactionId } = await params
        console.log(transactionId)
        const id = Number(transactionId)

        if (!Number.isInteger(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction ID.",
                },
                {
                    status: 400,
                }
            )
        }

        const payments = await db
            .select()
            .from(Payment)
            .where(
                eq(Payment.lotTransactionId, id)
            )

        return NextResponse.json({
            success: true,
            data: payments,
        })

    } catch (error) {

        console.error(error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch payments.",
            },
            {
                status: 500,
            }
        )
    }
}