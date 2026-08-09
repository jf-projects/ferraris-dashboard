/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "@/app/db"
import { Logs } from "@/app/db/schema"

export function getChanges(
    oldValue: Record<string, any>,
    newValue: Record<string, any>
) {
    const changes: Record<string, any> = {}

    for (const key of Object.keys(newValue)) {
        if (key === "updatedAt") {
            continue
        }

        if (
            JSON.stringify(oldValue[key]) !==
            JSON.stringify(newValue[key])
        ) {
            changes[key] = {
                old: oldValue[key],
                new: newValue[key],
            }
        }
    }

    return changes
}

export async function createAuditLog({
    userId,
    action,
    entity,
    modelId,
    oldValue,
    newValue,
}: {
    userId: string
    action: "UPDATE" | "DELETE"
    entity: string
    modelId: number
    oldValue: Record<string, any>
    newValue?: Record<string, any> | null
}) {
    const changes =
        action === "UPDATE"
            ? getChanges(oldValue, newValue!)
            : {
                old: oldValue,
                new: null,
            }

    if (
        action === "UPDATE" &&
        Object.keys(changes).length === 0
    ) {
        return
    }

    await db.insert(Logs).values({
        userId,
        action,
        entity,
        modelId,
        changes,
    })
}