export const USER_LEVELS = {
    ADMIN: "Administration",
    STAFF: "Staff",
} as const

export type UserLevel =
    (typeof USER_LEVELS)[keyof typeof USER_LEVELS]

export function canUpdate(userType?: string | null) {
    return userType === USER_LEVELS.ADMIN
}

export function canDelete(userType?: string | null) {
    return userType === USER_LEVELS.ADMIN
}

export function canCreate(userType?: string | null) {
    return (
        userType === USER_LEVELS.ADMIN ||
        userType === USER_LEVELS.STAFF
    )
}