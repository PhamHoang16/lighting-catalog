import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for drizzle-kit (load from .env.local before running)");
}

export default {
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: databaseUrl,
    },
    verbose: true,
    strict: true,
} satisfies Config;
