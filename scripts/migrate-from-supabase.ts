/**
 * Migrate dữ liệu 6 bảng từ Supabase REST → Postgres mới (Drizzle).
 *
 * Idempotent: dùng INSERT ... ON CONFLICT DO NOTHING dựa trên id.
 *
 * Chạy: npm run db:migrate-data
 */

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Cần NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY trong env.");
}
if (!DATABASE_URL) {
    throw new Error("Cần DATABASE_URL trong env.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const pool = new Pool({ connectionString: DATABASE_URL });

const CHUNK_SIZE = 200;

// Cache cột hợp lệ của target table (lấy từ information_schema)
interface ColInfo { allowed: Set<string>; arrayText: Set<string>; jsonb: Set<string> }
const tableInfoCache: Record<string, ColInfo> = {};

async function getTableInfo(table: string): Promise<ColInfo> {
    if (tableInfoCache[table]) return tableInfoCache[table];
    const res = await pool.query(
        `SELECT column_name, data_type, udt_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [table]
    );
    const allowed = new Set<string>();
    const arrayText = new Set<string>(); // text[] columns
    const jsonb = new Set<string>();     // jsonb columns
    for (const r of res.rows as { column_name: string; data_type: string; udt_name: string }[]) {
        allowed.add(r.column_name);
        if (r.data_type === "ARRAY") arrayText.add(r.column_name);
        if (r.data_type === "jsonb") jsonb.add(r.column_name);
    }
    tableInfoCache[table] = { allowed, arrayText, jsonb };
    return tableInfoCache[table];
}

type AnyRow = Record<string, unknown>;

async function fetchAll(table: string): Promise<AnyRow[]> {
    const out: AnyRow[] = [];
    const PAGE = 1000;
    let from = 0;
    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select("*")
            .range(from, from + PAGE - 1);
        if (error) throw new Error(`Read ${table} fail: ${error.message}`);
        if (!data || data.length === 0) break;
        out.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
    }
    return out;
}

function buildInsertSQL(table: string, rows: AnyRow[], conflictColumn: string, info: ColInfo) {
    if (rows.length === 0) return null;
    const columns = Object.keys(rows[0]).filter((c) => info.allowed.has(c));
    const placeholders: string[] = [];
    const values: unknown[] = [];
    let p = 1;
    for (const row of rows) {
        const rowPlaceholders: string[] = [];
        for (const col of columns) {
            const v = row[col];
            if (v !== null && typeof v === "object" && !(v instanceof Date)) {
                if (info.arrayText.has(col)) {
                    // text[] — pass native JS array, pg driver handles it
                    values.push(v);
                } else {
                    // jsonb / plain object — must stringify
                    values.push(JSON.stringify(v));
                }
            } else {
                values.push(v);
            }
            rowPlaceholders.push(`$${p++}`);
        }
        placeholders.push(`(${rowPlaceholders.join(", ")})`);
    }
    const colList = columns.map((c) => `"${c}"`).join(", ");
    const sql = `INSERT INTO "${table}" (${colList}) VALUES ${placeholders.join(", ")} ON CONFLICT (${conflictColumn}) DO NOTHING`;
    return { sql, values };
}

// Rows cần loại bỏ trước khi insert (vi phạm NOT NULL hoặc FK constraint)
const ROW_FILTERS: Record<string, (row: AnyRow) => boolean> = {
    products: (r) => r.category_id != null,
};

async function migrateTable(table: string, conflictColumn = "id") {
    console.log(`\n=== ${table} ===`);
    let rows = await fetchAll(table);
    console.log(`Đọc từ Supabase: ${rows.length} rows`);

    if (rows.length === 0) {
        console.log("(empty)");
        return;
    }

    const filter = ROW_FILTERS[table];
    if (filter) {
        const before = rows.length;
        rows = rows.filter(filter);
        if (rows.length < before) console.log(`  Bỏ qua ${before - rows.length} rows vi phạm constraint`);
    }

    const info = await getTableInfo(table);
    const supabaseCols = rows.length > 0 ? Object.keys(rows[0]) : [];
    const skipped = supabaseCols.filter((c) => !info.allowed.has(c));
    if (skipped.length > 0) console.log(`  Bỏ qua cột không có trong schema: ${skipped.join(", ")}`);

    let inserted = 0;
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const built = buildInsertSQL(table, chunk, conflictColumn, info);
        if (!built) continue;
        const res = await pool.query(built.sql, built.values);
        inserted += res.rowCount ?? 0;
        process.stdout.write(`  ${i + chunk.length}/${rows.length}\r`);
    }
    console.log(`\nInserted: ${inserted}/${rows.length} (skipped đã tồn tại theo ${conflictColumn})`);
}

async function main() {
    console.log("→ Bắt đầu migrate Supabase → Postgres");
    console.log(`  Source: ${SUPABASE_URL}`);
    console.log(`  Target: ${DATABASE_URL!.replace(/:[^:@]+@/, ":***@")}`);

    // Thứ tự đảm bảo FK: brands, categories (self-ref ok do ON DELETE SET NULL),
    // products (FK category + brand), banners, posts, orders.
    await migrateTable("brands");
    await migrateTable("categories");
    await migrateTable("products");
    await migrateTable("banners");
    await migrateTable("posts");
    await migrateTable("orders");

    await pool.end();
    console.log("\n✓ Done.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
