"use server";

import { getSession } from "./session";

export async function logoutAction(): Promise<void> {
    const session = await getSession();
    session.destroy();
}
