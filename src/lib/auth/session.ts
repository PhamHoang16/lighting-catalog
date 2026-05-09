import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
    userId: string;
    email: string;
}

const SESSION_OPTIONS: SessionOptions = {
    cookieName: "lc_session",
    password: process.env.SESSION_SECRET!,
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}
