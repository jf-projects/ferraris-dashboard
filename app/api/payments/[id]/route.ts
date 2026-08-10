/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/app/db";
import { Payment, LotTransaction } from "@/app/db/schema";
import { supabase } from "@/lib/supabase";
import { createAuditLog } from "@/lib/audit-log";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const paymentId = Number(id);

        if (Number.isNaN(paymentId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment ID.",
                },
                {
                    status: 400,
                }
            );
        }

        const payment = await db
            .select()
            .from(Payment)
            .where(
                and(
                    eq(Payment.id, paymentId),
                    isNull(Payment.deletedAt)
                )
            )
            .limit(1);

        if (!payment.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment not found.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            data: payment[0],
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch payment.",
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
        const paymentId = Number(id);
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (Number.isNaN(paymentId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment ID.",
                },
                {
                    status: 400,
                }
            );
        }

        const existing = await db
            .select()
            .from(Payment)
            .where(
                and(
                    eq(Payment.id, paymentId),
                    isNull(Payment.deletedAt)
                )
            )
            .limit(1);

        if (!existing.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment not found.",
                },
                {
                    status: 404,
                }
            );
        }

        const body = await request.json();

        const {
            lotTransactionId,
            amount,
            bank,
            paymentDate,
            remarks,
        } = body;

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

        const updated = await db
            .update(Payment)
            .set({
                lotTransactionId: Number(lotTransactionId),
                amount,
                bank,
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                remarks,
                updatedAt: new Date(),
            })
            .where(eq(Payment.id, paymentId))
            .returning();

        if (user) {
            await createAuditLog({
                userId: user.id,
                action: "UPDATE",
                entity: "Payments",
                modelId: existing[0].id,
                oldValue: existing[0],
                newValue: updated[0],
            })
        }

        return NextResponse.json({
            success: true,
            message: "Payment updated successfully.",
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
        const { id } = await params
        const paymentId = Number(id)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (Number.isNaN(paymentId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment ID.",
                },
                {
                    status: 400,
                }
            )
        }

        const existing = await db
            .select()
            .from(Payment)
            .where(
                and(
                    eq(Payment.id, paymentId),
                    isNull(Payment.deletedAt)
                )
            )
            .limit(1)

        if (!existing.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment not found.",
                },
                {
                    status: 404,
                }
            )
        }

        await db
            .update(Payment)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(Payment.id, paymentId))

        if (user) {
            await createAuditLog({
                userId: user.id,
                action: "DELETE",
                entity: "Payments",
                modelId: existing[0].id,
                oldValue: existing[0],
                newValue: null,
            })
        }

        return NextResponse.json({
            success: true,
            message: "Payment deleted successfully.",
        })
    } catch (error: any) {
        console.error(error)

        return NextResponse.json(
            {
                success: false,
                message: error.message,
                cause: error.cause,
            },
            {
                status: 500,
            }
        )
    }
}