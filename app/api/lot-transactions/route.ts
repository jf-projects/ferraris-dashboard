/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { isNull, eq, asc } from "drizzle-orm";

import { db } from "@/app/db";
import { LotTransaction, Client } from "@/app/db/schema";

export async function GET() {
    try {
        const result = await db
            .select({
                transaction: LotTransaction,
                client: Client,
            })
            .from(LotTransaction)
            .leftJoin(
                Client,
                eq(LotTransaction.clientId, Client.id)
            )
            .where(isNull(LotTransaction.deletedAt))
            .orderBy(asc(LotTransaction.id))

        const transactions = result.map(({ transaction, client }) => ({
            ...transaction,
            client,
        }))

        return NextResponse.json({
            success: true,
            data: transactions,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch transactions.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

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
        } = body;

        if (!clientId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Client is required.",
                },
                {
                    status: 400,
                }
            );
        }

        const inserted = await db
            .insert(LotTransaction)
            .values({
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
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Transaction created successfully.",
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