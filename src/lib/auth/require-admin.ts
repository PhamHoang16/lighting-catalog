import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAdmin(): Promise<{ userId: string; email: string }> {
    const session = await getSession();
    if (!session.userId) {
        redirect("/login");
    }
    return { userId: session.userId, email: session.email };
}
