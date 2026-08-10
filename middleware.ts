import { NextRequest, NextResponse } from "next/server";

function getUserType(token: string) {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
        );

        return payload.user_metadata?.type ?? null;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;

    const { pathname } = request.nextUrl;
    const method = request.method;

    const isLogin = pathname === "/login";
    const isApi = pathname.startsWith("/api");
    const isPublicApi = pathname === "/api/auth/login";

    // Authentication
    if (!token && !isLogin && !isPublicApi) {
        if (isApi) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                { status: 401 }
            );
        }

        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    // Already logged in
    if (token && isLogin) {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    // Administrator-only API operations
    if (isApi && token) {
        const userType = getUserType(token);

        const isUpdateOrDelete = [
            "PUT",
            "PATCH",
            "DELETE",
        ].includes(method);

        const isCreateUser =
            pathname === "/api/users" &&
            method === "POST";

        if (
            (isUpdateOrDelete || isCreateUser) &&
            userType !== "Administrator"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Administrator access required.",
                },
                {
                    status: 403,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|images).*)",
    ],
};