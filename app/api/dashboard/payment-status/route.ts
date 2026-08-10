import { NextResponse } from "next/server"
import { db } from "@/app/db"
import { Payment, LotTransaction } from "@/app/db/schema"
import { eq, isNull } from "drizzle-orm"

export async function GET() {
    try {
        const payments = await db
            .select({
                paymentAmount: Payment.amount,
                totalAmount: LotTransaction.propertyTotalAmount,
                downpayment: LotTransaction.downpayment,
            })
            .from(Payment)
            .leftJoin(
                LotTransaction,
                eq(Payment.lotTransactionId, LotTransaction.id)
            )
            .where(isNull(Payment.deletedAt))

        let paid = 0
        let partial = 0
        let overdue = 0

        for (const payment of payments) {
            const paymentAmount = Number(payment.paymentAmount || 0)
            const totalAmount =
                Number(payment.totalAmount || 0) -
                Number(payment.downpayment || 0)

            if (totalAmount <= 0) {
                continue
            }

            if (paymentAmount >= totalAmount) {
                paid++
            } else if (paymentAmount > 0) {
                partial++
            } else {
                overdue++
            }
        }

        const total = paid + partial + overdue

        return NextResponse.json({
            success: true,
            data: {
                paid: total ? Math.round((paid / total) * 100) : 0,
                partial: total ? Math.round((partial / total) * 100) : 0,
                overdue: total ? Math.round((overdue / total) * 100) : 0,
            },
        })
    } catch (error) {
        console.error("Payment status error:", error)

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load payment status.",
            },
            { status: 500 }
        )
    }
}