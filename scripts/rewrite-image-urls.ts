/**
 * Rewrite các URL Supabase Storage trong DB → URL public local.
 *
 * Supabase URL: https://<ref>.supabase.co/storage/v1/object/public/product-images/<path>
 * Sau khi rewrite: /uploads/<path>
 *
 * Áp dụng cho:
 *  - banners.image_url
 *  - categories.image_url
 *  - brands.logo_url
 *  - products.image_url
 *  - products.gallery (text[])
 *  - posts.thumbnail_url
 *  - posts.content (HTML chứa <img src="..."> hoặc URL trong text)
 *
 * Chạy: npm run db:rewrite-urls
 */

import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_PATH = process.env.NEXT_PUBLIC_UPLOAD_PATH ?? "/uploads";

if (!DATABASE_URL || !SUPABASE_URL) {
    throw new Error("Cần DATABASE_URL và NEXT_PUBLIC_SUPABASE_URL trong env.");
}

const BUCKET = "product-images";
const SUPABASE_PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

function rewriteUrl(url: string | null): string | null {
    if (!url) return url;
    if (url.startsWith(SUPABASE_PUBLIC_PREFIX)) {
        const rest = url.slice(SUPABASE_PUBLIC_PREFIX.length);
        return `${PUBLIC_PATH}/${rest}`;
    }
    return url;
}

function rewriteText(text: string | null): string | null {
    if (!text) return text;
    // Replace mọi occurrence
    return text.split(SUPABASE_PUBLIC_PREFIX).join(`${PUBLIC_PATH}/`);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function rewriteSimple(table: string, column: string) {
    console.log(`→ ${table}.${column}`);
    const { rows } = await pool.query<{ id: string; v: string | null }>(
        `SELECT id, "${column}" AS v FROM "${table}" WHERE "${column}" LIKE $1`,
        [`${SUPABASE_PUBLIC_PREFIX}%`]
    );
    let updated = 0;
    for (const row of rows) {
        const newVal = rewriteUrl(row.v);
        if (newVal !== row.v) {
            await pool.query(`UPDATE "${table}" SET "${column}" = $1 WHERE id = $2`, [newVal, row.id]);
            updated++;
        }
    }
    console.log(`  Updated ${updated}/${rows.length}`);
}

async function rewriteGallery() {
    console.log(`→ products.gallery (text[])`);
    const { rows } = await pool.query<{ id: string; gallery: string[] | null }>(
        `SELECT id, gallery FROM products WHERE gallery IS NOT NULL`
    );
    let updated = 0;
    for (const row of rows) {
        if (!row.gallery) continue;
        const newGallery = row.gallery.map((u) => rewriteUrl(u) ?? u);
        const changed = newGallery.some((u, i) => u !== row.gallery![i]);
        if (changed) {
            await pool.query(`UPDATE products SET gallery = $1 WHERE id = $2`, [newGallery, row.id]);
            updated++;
        }
    }
    console.log(`  Updated ${updated}/${rows.length}`);
}

async function rewriteContent() {
    console.log(`→ posts.content (HTML embedded URLs)`);
    const { rows } = await pool.query<{ id: string; content: string | null }>(
        `SELECT id, content FROM posts WHERE content LIKE $1`,
        [`%${SUPABASE_PUBLIC_PREFIX}%`]
    );
    let updated = 0;
    for (const row of rows) {
        const newContent = rewriteText(row.content);
        if (newContent !== row.content) {
            await pool.query(`UPDATE posts SET content = $1 WHERE id = $2`, [newContent, row.id]);
            updated++;
        }
    }
    console.log(`  Updated ${updated}/${rows.length}`);
}

async function main() {
    console.log("→ Rewrite Supabase URLs → local /uploads");
    console.log(`  From: ${SUPABASE_PUBLIC_PREFIX}`);
    console.log(`  To:   ${PUBLIC_PATH}/`);

    await rewriteSimple("banners", "image_url");
    await rewriteSimple("categories", "image_url");
    await rewriteSimple("brands", "logo_url");
    await rewriteSimple("products", "image_url");
    await rewriteGallery();
    await rewriteSimple("posts", "thumbnail_url");
    await rewriteContent();

    await pool.end();
    console.log("\n✓ Done.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
