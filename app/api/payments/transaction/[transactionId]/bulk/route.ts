/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { Payment, LotTransaction } from "@/app/db/schema";

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ transactionId: string }>;
    }
) {
    try {
        const { transactionId } = await params;

        const lotTransactionId = Number(transactionId);

        console.log("PARAMS:", { transactionId });
        console.log("LOT TRANSACTION ID:", lotTransactionId);

        if (
            !transactionId ||
            Number.isNaN(lotTransactionId) ||
            lotTransactionId <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid lot transaction ID.",
                },
                {
                    status: 400,
                }
            );
        }

        const body = await request.json();

        const {
            amount,
            bank,
            startDate,
            endDate,
            remarks,
        } = body;

        if (!amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!startDate || !endDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Start date and end date are required.",
                },
                {
                    status: 400,
                }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid start date or end date.",
                },
                {
                    status: 400,
                }
            );
        }

        if (start > end) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Start date cannot be later than end date.",
                },
                {
                    status: 400,
                }
            );
        }

        // Check if Lot Transaction exists
        const transaction = await db
            .select()
            .from(LotTransaction)
            .where(
                and(
                    eq(LotTransaction.id, lotTransactionId),
                    isNull(LotTransaction.deletedAt)
                )
            )
            .limit(1);

        if (!transaction.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lot Transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Monthly Payments
        |--------------------------------------------------------------------------
        |
        | Both the start month and end month are included.
        |
        | Example:
        | 2026-01-01 -> 2026-03-01
        |
        | Creates:
        | January
        | February
        | March
        |
        */

        const payments = [];

        const currentDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            1
        );

        const endMonth = new Date(
            end.getFullYear(),
            end.getMonth(),
            1
        );

        while (currentDate <= endMonth) {

            payments.push({
                lotTransactionId,
                amount,
                bank: bank || null,
                paymentDate: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                ),
                remarks: remarks || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );
        }

        if (!payments.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No payments were generated.",
                },
                {
                    status: 400,
                }
            );
        }

        // Insert all payments
        const createdPayments = await db
            .insert(Payment)
            .values(payments)
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: `${createdPayments.length} payment(s) created successfully.`,
                data: createdPayments,
            },
            {
                status: 201,
            }
        );

    } catch (error: any) {

        console.error("Bulk payment error:", error);

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