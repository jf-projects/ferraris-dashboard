/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { db } from "@/app/db"
import { LotTransaction, Client } from "@/app/db/schema"
import { eq, and, isNull } from "drizzle-orm"

function round(value: number) {
    return Number(value.toFixed(2))
}

/*
|--------------------------------------------------------------------------
| NUMBER FORMAT
|--------------------------------------------------------------------------
*/

function formatNumber(value: number) {
    return value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

/*
|--------------------------------------------------------------------------
| DATE FORMAT
|--------------------------------------------------------------------------
*/

function formatContractDate(
    value: Date | string | null | undefined
) {
    if (!value) return ""

    const date = new Date(value)

    const day = date.getDate()

    let suffix = "th"

    if (day % 100 < 11 || day % 100 > 13) {
        if (day % 10 === 1) suffix = "st"
        else if (day % 10 === 2) suffix = "nd"
        else if (day % 10 === 3) suffix = "rd"
    }

    return `${day}${suffix} day of ${date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    )}`
}

/*
|--------------------------------------------------------------------------
| NUMBER TO WORDS
|--------------------------------------------------------------------------
*/

const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
]

const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
]

function numberToWordsLessThan1000(
    number: number
): string {
    let result = ""

    if (number >= 100) {
        result += `${ones[Math.floor(number / 100)]} HUNDRED`

        number %= 100

        if (number > 0) {
            result += " "
        }
    }

    if (number >= 20) {
        result += tens[Math.floor(number / 10)]

        number %= 10

        if (number > 0) {
            result += ` ${ones[number]}`
        }
    } else if (number > 0) {
        result += ones[number]
    }

    return result
}

function numberToWords(number: number): string {
    number = Math.floor(Math.abs(number))

    if (number === 0) {
        return "ZERO"
    }

    const scales = [
        {
            value: 1_000_000_000,
            name: "BILLION",
        },
        {
            value: 1_000_000,
            name: "MILLION",
        },
        {
            value: 1_000,
            name: "THOUSAND",
        },
    ]

    let remaining = number
    const parts: string[] = []

    for (const scale of scales) {
        if (remaining >= scale.value) {
            const count = Math.floor(
                remaining / scale.value
            )

            remaining %= scale.value

            parts.push(
                `${numberToWordsLessThan1000(count)} ${scale.name}`
            )
        }
    }

    if (remaining > 0) {
        parts.push(
            numberToWordsLessThan1000(
                remaining
            )
        )
    }

    return parts.join(" ")
}

/*
|--------------------------------------------------------------------------
| MONEY TO WORDS
|--------------------------------------------------------------------------
*/

function amountToWords(amount: number) {
    const pesos = Math.floor(amount)

    return numberToWords(pesos)
}

/*
|--------------------------------------------------------------------------
| GET INCREMENT VALUES
|--------------------------------------------------------------------------
*/

function getIncrementValues(
    transaction: any
): number[] {
    if (!transaction.incrementValues) {
        return []
    }

    try {
        const parsed = JSON.parse(
            transaction.incrementValues
        )

        if (!Array.isArray(parsed)) {
            return []
        }

        return parsed
            .map(Number)
            .filter(Number.isFinite)
            .map(round)
    } catch {
        return []
    }
}

/*
|--------------------------------------------------------------------------
| MONTHLY PAYMENT FALLBACK
|--------------------------------------------------------------------------
|
| If there are no increment values:
|
| (Total Amount - Downpayment)
| / (Payment Terms * 12)
|
|--------------------------------------------------------------------------
*/

function calculateMonthlyPayment(
    transaction: any
) {
    const totalAmount = Number(
        transaction.propertyTotalAmount || 0
    )

    const downpayment = Number(
        transaction.downpayment || 0
    )

    const paymentTerms = Number(
        transaction.paymentTerms || 0
    )

    if (
        !Number.isFinite(paymentTerms) ||
        paymentTerms <= 0
    ) {
        return 0
    }

    const financedAmount = Math.max(
        0,
        totalAmount - downpayment
    )

    return round(
        financedAmount /
        (paymentTerms * 12)
    )
}

/*
|--------------------------------------------------------------------------
| GET INSTALLMENT DISPLAY
|--------------------------------------------------------------------------
*/

function getAmountIncrement(
    transaction: any
) {
    const incrementValues =
        getIncrementValues(transaction)

    /*
    |--------------------------------------------------------------------------
    | AUTOCOMPUTE
    |--------------------------------------------------------------------------
    */

    if (
        transaction.autocompute &&
        incrementValues.length
    ) {
        return incrementValues
            .map(value =>
                formatNumber(value)
            )
            .join(" / ")
    }

    /*
    |--------------------------------------------------------------------------
    | MANUAL VALUES
    |--------------------------------------------------------------------------
    */

    if (incrementValues.length) {
        return incrementValues
            .map(value =>
                formatNumber(value)
            )
            .join(" / ")
    }

    /*
    |--------------------------------------------------------------------------
    | NO INCREMENT VALUES
    |--------------------------------------------------------------------------
    */

    return formatNumber(
        calculateMonthlyPayment(
            transaction
        )
    )
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{ id: string }>
    }
) {
    try {
        const { id } =
            await context.params

        const transactionId =
            Number(id)

        if (
            !transactionId ||
            Number.isNaN(transactionId)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid transaction ID.",
                },
                {
                    status: 400,
                }
            )
        }

        /*
        |--------------------------------------------------------------------------
        | GET TRANSACTION + CLIENT
        |--------------------------------------------------------------------------
        */

        const [result] =
            await db
                .select({
                    transaction:
                        LotTransaction,

                    client:
                        Client,
                })
                .from(
                    LotTransaction
                )
                .leftJoin(
                    Client,
                    eq(
                        LotTransaction.clientId,
                        Client.id
                    )
                )
                .where(
                    and(
                        eq(
                            LotTransaction.id,
                            transactionId
                        ),
                        isNull(
                            LotTransaction.deletedAt
                        )
                    )
                )
                .limit(1)

        if (!result) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Lot transaction not found.",
                },
                {
                    status: 404,
                }
            )
        }

        const {
            transaction,
            client,
        } = result

        /*
        |--------------------------------------------------------------------------
        | CLIENT
        |--------------------------------------------------------------------------
        */

        const clientName = [
            client?.firstName,
            client?.middleName,
            client?.lastName,
        ]
            .filter(Boolean)
            .join(" ")

        const clientAddress =
            client?.address || ""

        /*
        |--------------------------------------------------------------------------
        | TRANSACTION VALUES
        |--------------------------------------------------------------------------
        */

        const totalAmount =
            Number(
                transaction.propertyTotalAmount || 0
            )

        const downpayment =
            Number(
                transaction.downpayment || 0
            )
            
        const propertySize =
            Number(
                transaction.totalPropertySize || 0
            )

        const pricePerSqm =
            Number(
                transaction.sqm || 0
            )

        const interest =
            Number(
                transaction.interest || 0
            )

        const paymentTerms =
            String(
                transaction.paymentTerms || ""
            )

        /*
        |--------------------------------------------------------------------------
        | INCREMENT / MONTHLY PAYMENT
        |--------------------------------------------------------------------------
        */

        const amountIncrement =
            getAmountIncrement(
                transaction
            )

        /*
        |--------------------------------------------------------------------------
        | TEMPLATE DATA
        |--------------------------------------------------------------------------
        */

        const data = {
            /*
            |--------------------------------------------------------------------------
            | CLIENT
            |--------------------------------------------------------------------------
            */

            client_name:
                clientName,

            client_address:
                clientAddress,

            /*
            |--------------------------------------------------------------------------
            | PROPERTY SIZE
            |--------------------------------------------------------------------------
            */

            property_size_total:
                numberToWords(
                    propertySize
                ),

            property_size_number:
                formatNumber(
                    propertySize
                ),

            /*
            |--------------------------------------------------------------------------
            | PROPERTY AMOUNT
            |--------------------------------------------------------------------------
            */

            property_amount_total:
                amountToWords(
                    totalAmount
                ),

            property_amount_number:
                `P${formatNumber(
                    totalAmount
                )}`,

            /*
            |--------------------------------------------------------------------------
            | DOWNPAYMENT
            |--------------------------------------------------------------------------
            */

            downpayment:
                `P${formatNumber(
                    downpayment
                )}`,

            /*
            |--------------------------------------------------------------------------
            | INSTALLMENT
            |--------------------------------------------------------------------------
            */

            amount_increment:
                amountIncrement,

            /*
            |--------------------------------------------------------------------------
            | INTEREST
            |--------------------------------------------------------------------------
            */

            interest_word:
                numberToWords(
                    interest
                ),

            amount_interest:
                formatNumber(
                    interest
                ),

            /*
            |--------------------------------------------------------------------------
            | PRICE PER SQM
            |--------------------------------------------------------------------------
            */

            price_sqm:
                numberToWords(
                    pricePerSqm
                ),

            sqm_number:
                formatNumber(
                    pricePerSqm
                ),

            /*
            |--------------------------------------------------------------------------
            | PAYMENT TERMS
            |--------------------------------------------------------------------------
            */

            payment_terms_years:
                paymentTerms,

            /*
            |--------------------------------------------------------------------------
            | CONTRACT DATE
            |--------------------------------------------------------------------------
            */

            contract_date:
                formatContractDate(
                    transaction.transactionDate
                ),
        }

        /*
        |--------------------------------------------------------------------------
        | TEMPLATE
        |--------------------------------------------------------------------------
        */

        const templatePath =
            path.join(
                process.cwd(),
                "public",
                "template.docx"
            )

        const template =
            await readFile(
                templatePath
            )

        /*
        |--------------------------------------------------------------------------
        | DOCX
        |--------------------------------------------------------------------------
        */

        const zip =
            new PizZip(template)

        const doc =
            new Docxtemplater(
                zip,
                {
                    paragraphLoop: true,
                    linebreaks: true,
                }
            )

        /*
        |--------------------------------------------------------------------------
        | RENDER
        |--------------------------------------------------------------------------
        */

        doc.render(data)

        /*
        |--------------------------------------------------------------------------
        | OUTPUT
        |--------------------------------------------------------------------------
        */

        const output =
            doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            })

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | NextResponse expects a Web BodyInit.
        |
        |--------------------------------------------------------------------------
        */

        const body =
            new Uint8Array(output)

        return new NextResponse(
            body,
            {
                status: 200,

                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

                    "Content-Disposition":
                        `attachment; filename="Contract-to-Sell-${transactionId}.docx"`,

                    "Content-Length":
                        String(body.length),
                },
            }
        )
    } catch (error: any) {
        console.error(
            "Contract generation error:",
            error
        )

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ||
                    "Failed to generate contract.",
            },
            {
                status: 500,
            }
        )
    }
}