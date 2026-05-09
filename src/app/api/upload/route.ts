import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { saveUploadedFile, type UploadFolder } from "@/lib/storage/local";

const VALID_FOLDERS: UploadFolder[] = [
    "products",
    "categories",
    "brands",
    "banners",
    "posts",
];

export async function POST(req: NextRequest) {
    // ── Auth check ──────────────────────────────────────────────
    try {
        await requireAdmin();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";

        if (!file) {
            return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
        }

        if (!VALID_FOLDERS.includes(folder as UploadFolder)) {
            return NextResponse.json({ error: "Folder không hợp lệ" }, { status: 400 });
        }

        // Validate MIME whitelist (defense in depth)
        const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedMimes.includes(file.type)) {
            return NextResponse.json(
                { error: `Loại file không được phép: ${file.type}` },
                { status: 415 }
            );
        }

        const url = await saveUploadedFile(file, folder as UploadFolder);
        return NextResponse.json({ url });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload thất bại";
        console.error("[upload] error:", err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
