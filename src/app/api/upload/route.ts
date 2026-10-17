import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

import { generateUniqueImageFilename } from "@/lib/imageHelper";

export async function POST(request: Request) {
  try {
    // Ensure only admins can upload video/image files
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedType = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = requestedType === "image" || file.type.startsWith("image/");

    if (isImage) {
      // 1. Rename to a unique filename (e.g. "ybsbhjd.png")
      const filename = generateUniqueImageFilename(file.name);

      // 2. Save in public/file/image/
      const imageDir = path.join(process.cwd(), "public", "file", "image");
      await mkdir(imageDir, { recursive: true });
      const filePath = path.join(imageDir, filename);
      await writeFile(filePath, buffer);

      // 3. Return both the bare filename (for database storage) and the display URL
      const displayUrl = `/file/image/${filename}`;
      return NextResponse.json({
        success: true,
        filename, // "ybsbhjd.png" -> Stored value in database
        url: displayUrl, // "/file/image/ybsbhjd.png" -> Full path for display
        displayUrl,
      });
    }

    // Otherwise handle general/video files
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${cleanName}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      filename,
      url: publicUrl,
      displayUrl: publicUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
