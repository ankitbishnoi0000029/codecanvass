import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode("token")

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value
    const { pathname } = request.nextUrl

    const isAdminRoute = pathname.startsWith("/adminPanel")
    const isLoginPage = pathname.startsWith("/login")

    // 🔐 Protect only admin routes
    if (isAdminRoute) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url), 308)
        }

        try {
            await jwtVerify(token, secret)
            return NextResponse.next()
        } catch {
            const response = NextResponse.redirect(new URL("/login", request.url), 308)
            response.cookies.delete("token")
            return response
        }
    }

    // 🚫 Prevent logged-in user from visiting login page
    if (isLoginPage && token) {
        try {
            await jwtVerify(token, secret)
            return NextResponse.redirect(new URL("/adminPanel", request.url), 308)
        } catch {
            return NextResponse.next()
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/adminPanel/:path*", "/login"],
}