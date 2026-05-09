"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { admin_users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "./session";

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
    const user = await db.query.admin_users.findFirst({
        where: eq(admin_users.email, email),
    });

    if (!user) {
        return { error: "Email hoặc mật khẩu không đúng. Vui lòng thử lại." };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return { error: "Email hoặc mật khẩu không đúng. Vui lòng thử lại." };
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    await session.save();

    return {};
}
