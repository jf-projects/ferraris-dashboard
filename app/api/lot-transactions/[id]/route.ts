/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { LotTransaction } from "@/app/db/schema";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transactionId = Number(id);

        if (Number.isNaN(transactionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction ID.",
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
                    eq(LotTransaction.id, transactionId),
                    isNull(LotTransaction.deletedAt)
                )
            )
            .limit(1);

        if (!transaction.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: transaction[0],
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch transaction.",
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
        const { id } = await params;
        const transactionId = Number(id);

        if (Number.isNaN(transactionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction ID.",
                },
                {
                    status: 400,
                }
            );
        }

        const existing = await db
            .select()
            .from(LotTransaction)
            .where(
                and(
                    eq(LotTransaction.id, transactionId),
                    isNull(LotTransaction.deletedAt)
                )
            )
            .limit(1);

        if (!existing.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            clientId,
            propertyUnit,
            totalPropertySize,
            type,
            unitBlock,
            unitLot,
            propertyUnitAddress,
            downpayment,
            paymentTerms,
            incrementValues,
            interest,
            sqm,
            incrementAmount,
            transactionDate,
            autocompute,
            propertyTotalAmount,
            dueDate,
            interestDate,
        } = await request.json();

        const updated = await db
            .update(LotTransaction)
            .set({
                clientId: Number(clientId),
                propertyUnit,
                totalPropertySize,
                type,
                unitBlock,
                unitLot,
                propertyUnitAddress,
                downpayment,
                paymentTerms,
                incrementValues,
                interest,
                sqm,
                incrementAmount,
                transactionDate: transactionDate ? new Date(transactionDate) : null,
                autocompute,
                propertyTotalAmount,
                dueDate: dueDate ? new Date(dueDate) : null,
                interestDate: interestDate ? new Date(interestDate) : null,
                updatedAt: new Date(),
            })
            .where(eq(LotTransaction.id, transactionId))
            .returning();

        return NextResponse.json({
            success: true,
            message: "Transaction updated successfully.",
            data: updated[0],
        });
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transactionId = Number(id);

        if (Number.isNaN(transactionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction ID.",
                },
                {
                    status: 400,
                }
            );
        }

        const existing = await db
            .select()
            .from(LotTransaction)
            .where(
                and(
                    eq(LotTransaction.id, transactionId),
                    isNull(LotTransaction.deletedAt)
                )
            )
            .limit(1);

        if (!existing.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                {
                    status: 404,
                }
            );
        }

        await db
            .update(LotTransaction)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(LotTransaction.id, transactionId));

        return NextResponse.json({
            success: true,
            message: "Transaction deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete transaction.",
            },
            {
                status: 500,
            }
        );
    }
}