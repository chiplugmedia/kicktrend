import path from "path";

/**
 * Generate a unique filename for uploaded images (e.g. "ybsbhjd.png")
 */
export function generateUniqueImageFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || ".png";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${randomStr}${ext}`;
}

/**
 * Extract only the bare filename (e.g. "ybsbhjd.png") for database storage.
 *
 * Example conversions:
 * - "/file/image/ybsbhjd.png" -> "ybsbhjd.png"
 * - "http://localhost:3000/file/image/ybsbhjd.png" -> "ybsbhjd.png"
 * - "/uploads/ybsbhjd.png" -> "ybsbhjd.png"
 * - "ybsbhjd.png" -> "ybsbhjd.png"
 * - "https://images.unsplash.com/..." -> "https://images.unsplash.com/..." (preserves external URLs)
 */
export function extractCoverImageFilename(input: string | null | undefined): string | null {
  if (!input) return null;
  const clean = input.trim();
  if (!clean) return null;

  // Check if it contains /file/image/ or /uploads/
  const match = clean.match(/(?:\/file\/image\/|\/uploads\/)([^/?#]+)/i);
  if (match) {
    return match[1];
  }

  // If it's a full external URL not matching our /file/image/ path, retain as-is
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // If it's already just the filename (e.g. "ybsbhjd.png")
  const base = path.basename(clean);
  return base || clean;
}

/**
 * Convert a stored database value (e.g. "ybsbhjd.png") to the display URL:
 * "/file/image/ybsbhjd.png" (which the browser loads as domain/file/image/ybsbhjd.png).
 *
 * Example conversions:
 * - "ybsbhjd.png" -> "/file/image/ybsbhjd.png"
 * - "/file/image/ybsbhjd.png" -> "/file/image/ybsbhjd.png"
 * - "/uploads/ybsbhjd.png" -> "/file/image/ybsbhjd.png"
 * - "https://images.unsplash.com/..." -> "https://images.unsplash.com/..."
 */
export function formatCoverImageUrl(coverImage: string | null | undefined): string | null {
  if (!coverImage) return null;
  const clean = coverImage.trim();
  if (!clean) return null;

  // External URLs remain untouched
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // Already prefixed
  if (clean.startsWith("/file/image/")) {
    return clean;
  }

  // Legacy /uploads/ path mapped to /file/image/
  if (clean.startsWith("/uploads/")) {
    const filename = clean.replace("/uploads/", "");
    return `/file/image/${filename}`;
  }

  // Stored bare filename -> prepend /file/image/
  return `/file/image/${clean}`;
}

/**
 * Get the full absolute URL (e.g. "http://domain/file/image/ybsbhjd.png") for SEO/OpenGraph.
 */
export function getAbsoluteCoverImageUrl(
  coverImage: string | null | undefined,
  siteUrlOverride?: string
): string | null {
  const relativeUrl = formatCoverImageUrl(coverImage);
  if (!relativeUrl) return null;
  if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;

  const siteUrl = siteUrlOverride || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const cleanBase = siteUrl.replace(/\/$/, "");
  const cleanPath = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
  return `${cleanBase}${cleanPath}`;
}
