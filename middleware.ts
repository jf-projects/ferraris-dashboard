import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token");

    const isLogin = request.nextUrl.pathname === "/login";

    if (!token && !isLogin) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && isLogin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};