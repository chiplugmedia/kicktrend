import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wanblog.internal";

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic post routes
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    postRoutes = posts.map((p) => ({
      url: `${baseUrl}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch {
    postRoutes = [];
  }

  // Dynamic category routes
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { name: true },
    });

    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/?cat=${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    categoryRoutes = [];
  }

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
