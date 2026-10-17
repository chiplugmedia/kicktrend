import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCoverImageUrl } from "@/lib/imageHelper";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const where: any = {
      published: true,
    };

    if (q.trim()) {
      const query = q.trim();
      where.OR = [
        { title: { contains: query } },
        { slug: { contains: query } },
        { summary: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    const articles = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        category: true,
        authorUsername: true,
        createdAt: true,
      },
    });

    const formattedArticles = articles.map((a) => ({
      ...a,
      coverImage: formatCoverImageUrl(a.coverImage),
    }));

    return NextResponse.json({ success: true, articles: formattedArticles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch articles." },
      { status: 500 }
    );
  }
}
