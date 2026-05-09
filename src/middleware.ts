import { getIronSession } from "iron-session";
import { NextResponse, type NextRequest } from "next/server";
import type { SessionData } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    if (request.nextUrl.pathname.startsWith("/admin")) {
        const session = await getIronSession<SessionData>(request, response, {
            cookieName: "lc_session",
            password: process.env.SESSION_SECRET!,
            cookieOptions: {
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
            },
        });

        if (!session.userId) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/login"],
};
