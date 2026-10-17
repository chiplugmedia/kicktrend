import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagerClient } from "./UserManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();

  // 1. Fetch initial statistics & first page of users safely
  let statsResult: any = [];
  let initialUsersRaw: any = [];

  try {
    statsResult = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN LOWER(status) = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN LOWER(role) IN ('admin', 'manager') THEN 1 ELSE 0 END) as staff
      FROM User
      WHERE deletedAt IS NULL;
    `);

    initialUsersRaw = await prisma.$queryRawUnsafe(`
      SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt, lastLoginAt, deletedAt
      FROM User
      WHERE deletedAt IS NULL
      ORDER BY createdAt DESC
      LIMIT 10 OFFSET 0;
    `);
  } catch (err) {
    console.error("AdminUsersPage query error:", err);
  }

  const initialStats = {
    total: Number(statsResult[0]?.total || 0),
    active: Number(statsResult[0]?.active || 0),
    pending: Number(statsResult[0]?.pending || 0),
    suspended: Number(statsResult[0]?.suspended || 0),
    staff: Number(statsResult[0]?.staff || 0),
  };

  const usernames = initialUsersRaw.map((u: any) => u.username);
  const countsMap = new Map<string, { posts: number; comments: number; likes: number }>();

  if (usernames.length > 0) {
    const usersData = await prisma.user.findMany({
      where: { username: { in: usernames } },
      select: {
        username: true,
        _count: {
          select: { posts: true, comments: true, likes: true },
        },
      },
    });
    usersData.forEach((u) => countsMap.set(u.username, u._count));
  }

  const initialUsers = initialUsersRaw.map((u: any) => ({
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
    _count: countsMap.get(u.username) || { posts: 0, comments: 0, likes: 0 },
  }));

  const initialPagination = {
    page: 1,
    limit: 10,
    total: initialStats.total,
    totalPages: Math.ceil(initialStats.total / 10) || 1,
  };

  return (
    <UserManagerClient
      initialUsers={initialUsers}
      initialStats={initialStats}
      initialPagination={initialPagination}
    />
  );
}
