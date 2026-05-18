import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/lighting-uploads";

const MIME: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
};

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;
    const filePath = path.resolve(path.join(UPLOAD_DIR, ...segments));

    // Prevent directory traversal
    if (!filePath.startsWith(path.resolve(UPLOAD_DIR))) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const file = await readFile(filePath);
        const ext = segments[segments.length - 1].split(".").pop()?.toLowerCase() ?? "";
        const contentType = MIME[ext] ?? "application/octet-stream";

        return new NextResponse(file, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return new NextResponse("Not Found", { status: 404 });
    }
}
