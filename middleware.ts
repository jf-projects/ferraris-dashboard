import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token");

    const { pathname } = request.nextUrl;

    const isLogin = pathname === "/login";
    const isApi = pathname.startsWith("/api");
    const isPublicApi = pathname === "/api/auth/login";

    if (!token && !isLogin && !isPublicApi) {
        if (isApi) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && isLogin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|images).*)",
    ],
};