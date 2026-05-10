// ── DB singleton ────────────────────────────────────────────────
// Dùng node-postgres + Drizzle. Pool được tái sử dụng cross-request
// trong cùng một Node process (PM2 worker).

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Tránh tạo nhiều pool khi dev hot-reload.
const globalForPg = globalThis as unknown as {
    __lightingPgPool?: Pool;
};

function buildPool() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL chưa được cấu hình trong env.");
    }
    
    // Giảm số lượng kết nối xuống 1-2 khi đang build tĩnh để tránh lỗi "too many clients"
    const isBuild = process.env.npm_lifecycle_event === "build";
    
    return new Pool({
        connectionString: url,
        max: isBuild ? 1 : 10,
        idleTimeoutMillis: 30_000,
    });
}

export const pgPool = globalForPg.__lightingPgPool ?? buildPool();
if (process.env.NODE_ENV !== "production") {
    globalForPg.__lightingPgPool = pgPool;
}

export const db = drizzle(pgPool, { schema });
export { schema };
