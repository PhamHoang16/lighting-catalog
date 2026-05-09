/**
 * Tạo (hoặc cập nhật) admin user đầu tiên từ ENV ADMIN_INIT_EMAIL + ADMIN_INIT_PASSWORD.
 *
 * Idempotent: nếu email đã tồn tại thì giữ nguyên (KHÔNG ghi đè password) — muốn đổi
 * password hãy dùng admin UI sau hoặc query SQL trực tiếp.
 *
 * Chạy: npm run db:seed-admin
 */

import { Pool } from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_INIT_EMAIL = process.env.ADMIN_INIT_EMAIL;
const ADMIN_INIT_PASSWORD = process.env.ADMIN_INIT_PASSWORD;

if (!DATABASE_URL) throw new Error("DATABASE_URL trong env required.");
if (!ADMIN_INIT_EMAIL || !ADMIN_INIT_PASSWORD) {
    throw new Error("ADMIN_INIT_EMAIL và ADMIN_INIT_PASSWORD trong env required.");
}

async function main() {
    const pool = new Pool({ connectionString: DATABASE_URL });

    const { rows: existing } = await pool.query<{ id: string }>(
        `SELECT id FROM admin_users WHERE email = $1`,
        [ADMIN_INIT_EMAIL]
    );

    if (existing.length > 0) {
        console.log(`✓ Admin email "${ADMIN_INIT_EMAIL}" đã tồn tại (id ${existing[0].id}). Bỏ qua.`);
        await pool.end();
        return;
    }

    const hash = await bcrypt.hash(ADMIN_INIT_PASSWORD!, 10);
    const { rows } = await pool.query<{ id: string }>(
        `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) RETURNING id`,
        [ADMIN_INIT_EMAIL, hash]
    );

    console.log(`✓ Tạo admin user: ${ADMIN_INIT_EMAIL} (id ${rows[0].id})`);
    console.log("  Đổi password sau bằng cách: cập nhật trực tiếp DB hoặc admin UI.");
    await pool.end();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
