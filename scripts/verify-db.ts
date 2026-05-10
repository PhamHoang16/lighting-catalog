import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function verify() {
  const tables = ["categories", "brands", "products", "banners", "posts", "orders"];
  console.log("=== THỐNG KÊ DỮ LIỆU LOCAL POSTGRESQL ===");
  for (const table of tables) {
    try {
      const res = await db.execute(sql.raw(`SELECT count(*) as count FROM ${table}`));
      console.log(`- Bảng ${table.padEnd(12)}: ${res[0].count} bản ghi`);
    } catch (e) {
      console.log(`- Bảng ${table.padEnd(12)}: Lỗi hoặc chưa có bảng`);
    }
  }
  
  // Lấy thử 1 hình ảnh sản phẩm xem URL đang lưu là gì
  try {
     const imgRes = await db.execute(sql.raw(`SELECT image_url FROM products WHERE image_url IS NOT NULL LIMIT 1`));
     if (imgRes.length > 0) {
        console.log(`\n=> Ví dụ URL ảnh sản phẩm đang lưu: ${imgRes[0].image_url}`);
     }
  } catch (e) {}

  process.exit(0);
}

verify();
