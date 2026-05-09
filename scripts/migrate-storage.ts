/**
 * Tải file từ Supabase Storage bucket "product-images" → ghi vào UPLOAD_DIR.
 *
 * Giữ nguyên cấu trúc thư mục (products/, categories/, brands/, banners/, posts/).
 * Idempotent: nếu file đã có ở local thì skip.
 *
 * Chạy: npm run db:migrate-storage
 */

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const BUCKET = "product-images";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Cần NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY trong env.");
}
if (!UPLOAD_DIR) {
    throw new Error("Cần UPLOAD_DIR trong env.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exists(filepath: string) {
    try {
        await stat(filepath);
        return true;
    } catch {
        return false;
    }
}

async function listAll(prefix: string): Promise<string[]> {
    const out: string[] = [];
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
    });
    if (error) {
        console.warn(`  list ${prefix} fail: ${error.message}`);
        return [];
    }
    if (!data) return [];
    for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        // Folder nếu metadata null (Supabase quy ước)
        if (!item.metadata) {
            const sub = await listAll(fullPath);
            out.push(...sub);
        } else {
            out.push(fullPath);
        }
    }
    return out;
}

async function downloadOne(remotePath: string) {
    const localPath = path.join(UPLOAD_DIR!, remotePath);
    await mkdir(path.dirname(localPath), { recursive: true });

    if (await exists(localPath)) {
        return { skipped: true, localPath };
    }

    const { data, error } = await supabase.storage.from(BUCKET).download(remotePath);
    if (error || !data) {
        throw new Error(`download ${remotePath} fail: ${error?.message ?? "unknown"}`);
    }
    const buf = Buffer.from(await data.arrayBuffer());
    await writeFile(localPath, buf);
    return { skipped: false, localPath };
}

async function main() {
    console.log("→ Migrate storage Supabase → Local FS");
    console.log(`  Bucket: ${BUCKET}`);
    console.log(`  Target dir: ${UPLOAD_DIR}`);
    await mkdir(UPLOAD_DIR!, { recursive: true });

    // Liệt kê toàn bộ object trong bucket
    const all = await listAll("");
    console.log(`Tìm thấy ${all.length} file trong bucket.`);

    let downloaded = 0;
    let skipped = 0;
    for (let i = 0; i < all.length; i++) {
        const f = all[i];
        try {
            const r = await downloadOne(f);
            if (r.skipped) skipped++;
            else downloaded++;
            process.stdout.write(`  ${i + 1}/${all.length} (${downloaded} dl, ${skipped} skip)\r`);
        } catch (e) {
            console.warn(`\n  ! ${f}: ${(e as Error).message}`);
        }
    }
    console.log(`\n✓ Done. Downloaded: ${downloaded}, Skipped: ${skipped}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
