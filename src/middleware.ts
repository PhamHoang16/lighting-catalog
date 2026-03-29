import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match only /admin and /login paths (and their children)
         * to prevent storefront pages from being forced into dynamic rendering
         * by session management cookies.
         */
        "/admin/:path*",
        "/login",
    ],
};
