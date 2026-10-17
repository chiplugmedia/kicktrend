import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UserDetailPageClient } from "./UserDetailPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDossierPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    notFound();
  }

  const rawUser: any = await prisma.$queryRawUnsafe(
    `SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt, lastLoginAt, deletedAt
     FROM User WHERE id = ? LIMIT 1;`,
    userId
  );

  if (!rawUser || rawUser.length === 0) {
    notFound();
  }

  const u = rawUser[0];

  const [posts, comments, likesCount] = await Promise.all([
    prisma.post.findMany({
      where: { authorUsername: u.username },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        published: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.comment.findMany({
      where: { authorUsername: u.username },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: { title: true, slug: true },
        },
      },
    }),
    prisma.like.count({
      where: { authorUsername: u.username },
    }),
  ]);

  const userProfile = {
    id: Number(u.id),
    username: u.username,
    name: u.name || null,
    email: u.email,
    role: u.role || "user",
    status: u.status || "active",
    phone: u.phone || null,
    avatar: u.avatar || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt || null,
    deletedAt: u.deletedAt || null,
    stats: {
      postsCount: posts.length,
      commentsCount: comments.length,
      likesCount,
    },
    recentPosts: posts,
    recentComments: comments,
  };

  return <UserDetailPageClient initialUser={userProfile} />;
}
