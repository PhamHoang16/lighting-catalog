import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/lighting-uploads";
const UPLOAD_PATH = process.env.NEXT_PUBLIC_UPLOAD_PATH ?? "/uploads";

export type UploadFolder = "products" | "categories" | "brands" | "banners" | "posts";

// Allowed MIME types and their magic bytes
const ALLOWED_MIMES: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF....WEBP
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],
};

const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

/**
 * Validate file magic bytes against expected MIME type
 */
async function checkMagicBytes(buffer: Buffer, mime: string): Promise<boolean> {
    const signatures = ALLOWED_MIMES[mime];
    if (!signatures) return false;
    return signatures.some((sig) =>
        sig.every((byte, i) => buffer[i] === byte)
    );
}

/**
 * Save an uploaded file to local filesystem.
 * Returns the public URL path (e.g. /uploads/products/uuid.jpg)
 */
export async function saveUploadedFile(
    file: File,
    folder: UploadFolder
): Promise<string> {
    const mime = file.type;

    if (!ALLOWED_MIMES[mime]) {
        throw new Error(`Loại file không được phép: ${mime}`);
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước file vượt quá 5MB");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic byte check
    const valid = await checkMagicBytes(buffer, mime);
    if (!valid) {
        throw new Error("File không hợp lệ (magic bytes không khớp với MIME type)");
    }

    const ext = MIME_TO_EXT[mime] ?? "jpg";
    const fileName = `${randomUUID()}.${ext}`;
    const folderPath = path.join(UPLOAD_DIR, folder);
    const filePath = path.join(folderPath, fileName);

    // Ensure folder exists
    await mkdir(folderPath, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    return `${UPLOAD_PATH}/${folder}/${fileName}`;
}

/**
 * Delete an uploaded file (best-effort, no throw on missing)
 */
export async function deleteUploadedFile(url: string): Promise<void> {
    try {
        // Extract relative path from URL: /uploads/products/uuid.jpg
        if (!url.startsWith(UPLOAD_PATH)) return;
        const relative = url.slice(UPLOAD_PATH.length); // /products/uuid.jpg
        const filePath = path.join(UPLOAD_DIR, relative);
        const { unlink } = await import("fs/promises");
        await unlink(filePath);
    } catch {
        // best-effort
    }
}
