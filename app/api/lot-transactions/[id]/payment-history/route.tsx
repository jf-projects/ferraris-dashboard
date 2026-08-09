/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/db"
import { LotTransaction, Payment } from "@/app/db/schema"
import { eq, and, isNull, asc } from "drizzle-orm"

const round = (n: number) => Number(n.toFixed(2))

function parseDate(value: Date | string | null | undefined) {
    if (!value) return null

    const d = new Date(value)
    d.setHours(0, 0, 0, 0)

    return d
}

function addMonths(date: Date, months: number) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
}

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`
}

function getMonthYear(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    })
}

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } = await context.params
        const transactionId = Number(id)

        if (!transactionId || Number.isNaN(transactionId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid transaction ID."
                },
                { status: 400 }
            )
        }

        /*
        |--------------------------------------------------------------------------
        | GET TRANSACTION
        |--------------------------------------------------------------------------
        */

        const [transaction] = await db
            .select()
            .from(LotTransaction)
            .where(
                and(
                    eq(LotTransaction.id, transactionId),
                    isNull(LotTransaction.deletedAt)
                )
            )
            .limit(1)

        if (!transaction) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lot transaction not found."
                },
                { status: 404 }
            )
        }

        /*
        |--------------------------------------------------------------------------
        | CASH
        |--------------------------------------------------------------------------
        */

        if (
            !transaction.paymentTerms ||
            transaction.paymentTerms.toLowerCase() === "cash"
        ) {
            return NextResponse.json({
                success: true,
                data: {
                    transactionId,
                    paymentTerms: "cash",
                    totalAmount: Number(
                        transaction.propertyTotalAmount || 0
                    ),
                    downpayment: Number(
                        transaction.downpayment || 0
                    ),
                    history: []
                }
            })
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT TERMS
        |--------------------------------------------------------------------------
        */

        const paymentYears = Number(
            transaction.paymentTerms
        )

        if (
            !Number.isFinite(paymentYears) ||
            paymentYears <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment terms."
                },
                { status: 400 }
            )
        }

        const totalMonths = paymentYears * 12

        /*
        |--------------------------------------------------------------------------
        | INCREMENT VALUES
        |--------------------------------------------------------------------------
        */

        let incrementValues: number[] = []

        try {
            const parsed = JSON.parse(
                transaction.incrementValues || "[]"
            )

            if (Array.isArray(parsed)) {
                incrementValues = parsed
                    .map(Number)
                    .filter(Number.isFinite)
            }
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid increment values."
                },
                { status: 400 }
            )
        }

        /*
        |--------------------------------------------------------------------------
        | AMOUNTS
        |--------------------------------------------------------------------------
        */

        const totalAmount = Number(
            transaction.propertyTotalAmount || 0
        )

        const downpayment = Number(
            transaction.downpayment || 0
        )

        const financedAmount = Math.max(
            0,
            totalAmount - downpayment
        )

        /*
        |--------------------------------------------------------------------------
        | DEFAULT MONTHLY PAYMENT
        |--------------------------------------------------------------------------
        |
        | If there are no increment values:
        |
        | (total amount - downpayment) / total months
        |
        */

        const defaultMonthlyDue = round(
            financedAmount / totalMonths
        )

        /*
        |--------------------------------------------------------------------------
        | INTEREST
        |--------------------------------------------------------------------------
        |
        | interestDate is the AGREED START DATE.
        |
        | Example:
        |
        | interestDate = December 31, 2025
        |
        | January 2026 = unpaid month 1
        | February 2026 = unpaid month 2
        | March 2026 = unpaid month 3
        | April 2026 = unpaid month 4 -> interest
        |
        */

        const interestRate = Number(
            transaction.interest || 0
        )

        const interestDate = parseDate(
            transaction.interestDate
        )

        /*
        |--------------------------------------------------------------------------
        | GET ACTIVE PAYMENTS
        |--------------------------------------------------------------------------
        */

        const payments = await db
            .select()
            .from(Payment)
            .where(
                and(
                    eq(
                        Payment.lotTransactionId,
                        transactionId
                    ),
                    isNull(Payment.deletedAt)
                )
            )
            .orderBy(
                asc(Payment.paymentDate),
                asc(Payment.id)
            )

        /*
        |--------------------------------------------------------------------------
        | START DATE
        |--------------------------------------------------------------------------
        */

        const transactionDate = parseDate(
            transaction.transactionDate
        )

        const firstPaymentDate =
            payments.length
                ? parseDate(
                    payments[0].paymentDate
                )
                : null

        const possibleDates = [
            transactionDate,
            firstPaymentDate
        ].filter(Boolean) as Date[]

        if (!possibleDates.length) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Transaction date or payment date is required."
                },
                { status: 400 }
            )
        }

        const startDate = new Date(
            Math.min(
                ...possibleDates.map(
                    date => date.getTime()
                )
            )
        )

        startDate.setHours(0, 0, 0, 0)

        /*
        |--------------------------------------------------------------------------
        | GROUP PAYMENTS BY MONTH
        |--------------------------------------------------------------------------
        */

        const paymentsByMonth =
            new Map<string, number>()

        for (const payment of payments) {
            const paymentDate = parseDate(
                payment.paymentDate
            )

            if (!paymentDate) continue

            const key = getMonthKey(
                paymentDate
            )

            const current =
                paymentsByMonth.get(key) || 0

            paymentsByMonth.set(
                key,
                round(
                    current +
                    Number(payment.amount || 0)
                )
            )
        }

        /*
        |--------------------------------------------------------------------------
        | CURRENT MONTH
        |--------------------------------------------------------------------------
        */

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        let currentMonth =
            (
                today.getFullYear() -
                startDate.getFullYear()
            ) * 12 +
            (
                today.getMonth() -
                startDate.getMonth()
            ) +
            1

        currentMonth = Math.max(
            0,
            Math.min(
                currentMonth,
                totalMonths
            )
        )

        /*
        |--------------------------------------------------------------------------
        | HISTORY
        |--------------------------------------------------------------------------
        */

        const history: any[] = []

        let totalPaid = 0
        let totalInterest = 0
        let principalPaid = 0

        /*
        |--------------------------------------------------------------------------
        | GENERAL UNPAID MONTH COUNTER
        |--------------------------------------------------------------------------
        */

        let consecutiveUnpaid = 0

        /*
        |--------------------------------------------------------------------------
        | INTEREST UNPAID MONTH COUNTER
        |--------------------------------------------------------------------------
        */

        let interestUnpaidMonths = 0

        /*
        |--------------------------------------------------------------------------
        | OUTSTANDING PRINCIPAL DUE
        |--------------------------------------------------------------------------
        */

        let outstandingUnpaid = 0

        /*
        |--------------------------------------------------------------------------
        | PAYMENT CREDIT
        |--------------------------------------------------------------------------
        */

        let credit = 0

        /*
        |--------------------------------------------------------------------------
        | PREVIOUS TOTAL AMOUNT DUE
        |--------------------------------------------------------------------------
        |
        | Used as the base for cumulative interest.
        |
        */

        let previousTotalAmountDue = 0

        /*
        |--------------------------------------------------------------------------
        | GENERATE HISTORY
        |--------------------------------------------------------------------------
        */

        for (
            let index = 0;
            index < currentMonth;
            index++
        ) {
            const month = index + 1

            const currentDate = addMonths(
                startDate,
                index
            )

            const monthKey =
                getMonthKey(currentDate)

            /*
            |--------------------------------------------------------------------------
            | MONTHLY DUE
            |--------------------------------------------------------------------------
            |
            | If incrementValues exist:
            |     Use the configured increment schedule.
            |
            | If no incrementValues exist:
            |     Use financedAmount / totalMonths.
            |
            */

            let dueAmount = 0

            if (incrementValues.length > 0) {
                const block = Math.floor(
                    index / 60
                )

                dueAmount = round(
                    Number(
                        incrementValues[
                            Math.min(
                                block,
                                incrementValues.length - 1
                            )
                        ] || 0
                    )
                )
            } else {
                dueAmount = defaultMonthlyDue
            }

            /*
            |--------------------------------------------------------------------------
            | ACTUAL PAYMENT
            |--------------------------------------------------------------------------
            */

            const actualPayment =
                paymentsByMonth.get(
                    monthKey
                ) || 0

            /*
            |--------------------------------------------------------------------------
            | AVAILABLE PAYMENT
            |--------------------------------------------------------------------------
            */

            let availablePayment = round(
                credit +
                actualPayment
            )

            /*
            |--------------------------------------------------------------------------
            | FIRST PAYMENT / DOWNPAYMENT
            |--------------------------------------------------------------------------
            */

            if (
                month === 1 &&
                downpayment > 0 &&
                availablePayment > 0
            ) {
                const downpaymentApplied =
                    Math.min(
                        availablePayment,
                        downpayment
                    )

                availablePayment = round(
                    availablePayment -
                    downpaymentApplied
                )
            }

            /*
            |--------------------------------------------------------------------------
            | ADD CURRENT MONTH DUE
            |--------------------------------------------------------------------------
            */

            outstandingUnpaid = round(
                outstandingUnpaid +
                dueAmount
            )

            /*
            |--------------------------------------------------------------------------
            | APPLY PAYMENT
            |--------------------------------------------------------------------------
            */

            const paymentApplied = Math.min(
                availablePayment,
                outstandingUnpaid
            )

            outstandingUnpaid = round(
                outstandingUnpaid -
                paymentApplied
            )

            /*
            |--------------------------------------------------------------------------
            | CREDIT
            |--------------------------------------------------------------------------
            */

            credit = round(
                Math.max(
                    0,
                    availablePayment -
                    paymentApplied
                )
            )

            /*
            |--------------------------------------------------------------------------
            | MONTHLY AMOUNT PAID
            |--------------------------------------------------------------------------
            */

            const amountPaid = round(
                paymentApplied
            )

            /*
            |--------------------------------------------------------------------------
            | GENERAL CONSECUTIVE UNPAID
            |--------------------------------------------------------------------------
            */

            if (
                amountPaid < dueAmount
            ) {
                consecutiveUnpaid++
            } else {
                consecutiveUnpaid = 0
            }

            /*
            |--------------------------------------------------------------------------
            | INTEREST PERIOD
            |--------------------------------------------------------------------------
            */

            let interestStarted = false

            if (interestDate) {
                const interestMonth =
                    new Date(
                        interestDate
                    )

                interestMonth.setDate(1)
                interestMonth.setHours(
                    0,
                    0,
                    0,
                    0
                )

                const currentInterestMonth =
                    new Date(
                        currentDate
                    )

                currentInterestMonth.setDate(
                    1
                )

                currentInterestMonth.setHours(
                    0,
                    0,
                    0,
                    0
                )

                interestStarted =
                    currentInterestMonth >=
                    interestMonth
            } else {
                /*
                |--------------------------------------------------------------------------
                | If no interestDate exists, interest
                | can start based on normal unpaid rule.
                |--------------------------------------------------------------------------
                */

                interestStarted = true
            }

            /*
            |--------------------------------------------------------------------------
            | INTEREST UNPAID COUNTER
            |--------------------------------------------------------------------------
            */

            if (
                interestStarted &&
                amountPaid < dueAmount
            ) {
                interestUnpaidMonths++
            } else if (
                interestStarted &&
                amountPaid >= dueAmount
            ) {
                interestUnpaidMonths = 0
            }

            /*
            |--------------------------------------------------------------------------
            | INTEREST
            |--------------------------------------------------------------------------
            |
            | Interest starts after 3 complete
            | unpaid months.
            |
            | Interest is based ONLY on the
            | previous totalAmountDue.
            |
            */

            let interest = 0

            const interestEligible =
                interestStarted &&
                interestUnpaidMonths >= 3 &&
                outstandingUnpaid > 0 &&
                interestRate > 0 &&
                previousTotalAmountDue > 0

            if (interestEligible) {
                const interestBase = round(
                    previousTotalAmountDue
                )

                interest = round(
                    interestBase *
                    (interestRate / 100)
                )
            }

            /*
            |--------------------------------------------------------------------------
            | TOTAL AMOUNT DUE
            |--------------------------------------------------------------------------
            */

            const totalAmountDue = round(
                outstandingUnpaid +
                interest
            )

            /*
            |--------------------------------------------------------------------------
            | UPDATE PREVIOUS TOTAL DUE
            |--------------------------------------------------------------------------
            */

            previousTotalAmountDue =
                totalAmountDue

            /*
            |--------------------------------------------------------------------------
            | PRINCIPAL / BALANCE
            |--------------------------------------------------------------------------
            */

            principalPaid = round(
                principalPaid +
                amountPaid
            )

            const balance = round(
                Math.max(
                    0,
                    financedAmount -
                    principalPaid
                )
            )

            /*
            |--------------------------------------------------------------------------
            | TOTALS
            |--------------------------------------------------------------------------
            */

            totalPaid = round(
                totalPaid +
                amountPaid
            )

            totalInterest = round(
                totalInterest +
                interest
            )

            /*
            |--------------------------------------------------------------------------
            | HISTORY
            |--------------------------------------------------------------------------
            */

            history.push({
                month,

                monthYear:
                    getMonthYear(
                        currentDate
                    ),

                dueDate:
                    currentDate.toISOString(),

                dueAmount,

                actualPayment:
                    round(actualPayment),

                amountPaid,

                unpaidAmount:
                    round(
                        outstandingUnpaid
                    ),

                consecutiveUnpaid,

                interestUnpaidMonths,

                interest,

                balance,

                totalAmountDue
            })
        }

        /*
        |--------------------------------------------------------------------------
        | TOTALS
        |--------------------------------------------------------------------------
        */

        const totalUnpaid = round(
            outstandingUnpaid
        )

        const balance =
            history.length
                ? history[
                    history.length - 1
                ].balance
                : financedAmount

        const totalAmountDue = round(
            history.length
                ? history[
                    history.length - 1
                ].totalAmountDue
                : 0
        )

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return NextResponse.json({
            success: true,

            data: {
                transactionId,

                startDate:
                    startDate.toISOString(),

                paymentTerms:
                    paymentYears,

                totalMonths,

                currentMonth,

                totalAmount:
                    round(totalAmount),

                downpayment:
                    round(downpayment),

                financedAmount:
                    round(financedAmount),

                interestRate,

                interestDate:
                    interestDate
                        ? interestDate.toISOString()
                        : null,

                totalPaid:
                    round(totalPaid),

                totalUnpaid,

                totalInterest,

                balance:
                    round(balance),

                totalAmountDue,

                history
            }
        })
    } catch (error) {
        console.error(
            "Payment history error:",
            error
        )

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to generate payment history."
            },
            { status: 500 }
        )
    }
}