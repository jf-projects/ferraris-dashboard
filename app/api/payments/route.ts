/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { and, eq, isNull, asc } from "drizzle-orm";

import { db } from "@/app/db";
import { Payment, LotTransaction, Client } from "@/app/db/schema";

export async function GET() {

    try {

        const payments = await db
            .select({
                id: Payment.id,
                lotTransactionId: Payment.lotTransactionId,
                amount: Payment.amount,
                bank: Payment.bank,
                paymentDate: Payment.paymentDate,
                remarks: Payment.remarks,
                createdAt: Payment.createdAt,
                updatedAt: Payment.updatedAt,
                deletedAt: Payment.deletedAt,

                client: {
                    id: Client.id,
                    firstName: Client.firstName,
                    middleName: Client.middleName,
                    lastName: Client.lastName,
                },
            })
            .from(Payment)
            .leftJoin(
                LotTransaction,
                eq(Payment.lotTransactionId, LotTransaction.id)
            )
            .leftJoin(
                Client,
                eq(LotTransaction.clientId, Client.id)
            )
            .where(
                isNull(Payment.deletedAt)
            )
            .orderBy(
                asc(Payment.id)
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

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            lotTransactionId,
            amount,
            bank,
            paymentDate,
            remarks,
        } = body;

        if (!lotTransactionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lot Transaction is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const transaction = await db
            .select()
            .from(LotTransaction)
            .where(
                and(
                    eq(LotTransaction.id, Number(lotTransactionId)),
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

        const inserted = await db
            .insert(Payment)
            .values({
                lotTransactionId: Number(lotTransactionId),
                amount,
                bank,
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                remarks,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Payment created successfully.",
                data: inserted[0],
            },
            {
                status: 201,
            }
        );
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