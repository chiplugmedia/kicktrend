import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

interface RouteProps {
  params: Promise<{ filename: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { filename } = await params;
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    // 1. Primary storage path: public/file/image/[filename]
    const primaryPath = path.join(process.cwd(), "public", "file", "image", filename);
    let filePath = primaryPath;

    try {
      await stat(primaryPath);
    } catch {
      // 2. Fallback path for legacy files: public/uploads/[filename]
      const fallbackPath = path.join(process.cwd(), "public", "uploads", filename);
      try {
        await stat(fallbackPath);
        filePath = fallbackPath;
      } catch {
        return new NextResponse("Image not found", { status: 404 });
      }
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Error reading file", { status: 500 });
  }
}
