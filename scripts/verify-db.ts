import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function verify() {
  const tables = ["categories", "brands", "products", "banners", "posts", "orders"];
  console.log("=== THỐNG KÊ DỮ LIỆU LOCAL POSTGRESQL ===");
  for (const table of tables) {
    try {
      const res = await db.execute(sql.raw(`SELECT count(*) as count FROM ${table}`));
      const count = (res as any).rows ? (res as any).rows[0].count : (res as any)[0].count;
      console.log(`- Bảng ${table.padEnd(12)}: ${count} bản ghi`);
    } catch (e) {
      console.log(`- Bảng ${table.padEnd(12)}: Lỗi hoặc chưa có bảng`);
    }
  }
  
  // Lấy thử 1 hình ảnh sản phẩm xem URL đang lưu là gì
  try {
     const imgRes = await db.execute(sql.raw(`SELECT image_url FROM products WHERE image_url IS NOT NULL LIMIT 1`));
     const rows = (imgRes as any).rows || (imgRes as any);
     if (rows.length > 0) {
        console.log(`\n=> Ví dụ URL ảnh sản phẩm đang lưu: ${rows[0].image_url}`);
     }
  } catch (e) {}

  process.exit(0);
}

verify();
