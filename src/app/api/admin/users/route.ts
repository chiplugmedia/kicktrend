import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Base conditions
    const conditions: string[] = [];
    if (!includeDeleted) {
      conditions.push("deletedAt IS NULL");
    }

    if (role && role !== "all") {
      conditions.push(`LOWER(role) = '${role.toLowerCase().replace(/['"\\]/g, "")}'`);
    }

    if (status && status !== "all") {
      conditions.push(`LOWER(status) = '${status.toLowerCase().replace(/['"\\]/g, "")}'`);
    }

    if (search) {
      const sanitized = search.toLowerCase().replace(/['"\\]/g, "");
      conditions.push(
        `(LOWER(username) LIKE '%${sanitized}%' OR LOWER(email) LIKE '%${sanitized}%' OR LOWER(COALESCE(name, '')) LIKE '%${sanitized}%')`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 1. Fetch total count matching current query
    const countQuery = `SELECT COUNT(*) as total FROM User ${whereClause};`;
    const countResult: any = await prisma.$queryRawUnsafe(countQuery);
    const totalUsers = Number(countResult[0]?.total || 0);

    // 2. Fetch paginated users
    const offset = (page - 1) * limit;
    const usersQuery = `
      SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt, lastLoginAt, deletedAt
      FROM User
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset};
    `;
    const users: any = await prisma.$queryRawUnsafe(usersQuery);

    // Fetch counts of posts, comments, likes for these users
    const usernames = users.map((u: any) => u.username);
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

    // Format output
    const formattedUsers = users.map((u: any) => ({
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

    // 3. Compute top overview telemetry stats (all non-deleted users)
    const statsResult: any = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN LOWER(status) = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN LOWER(role) IN ('admin', 'manager') THEN 1 ELSE 0 END) as staff
      FROM User
      WHERE deletedAt IS NULL;
    `);

    const stats = {
      total: Number(statsResult[0]?.total || 0),
      active: Number(statsResult[0]?.active || 0),
      pending: Number(statsResult[0]?.pending || 0),
      suspended: Number(statsResult[0]?.suspended || 0),
      staff: Number(statsResult[0]?.staff || 0),
    };

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit) || 1,
      },
      stats,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { username, email, password, role = "user", status = "active", name, phone } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required fields." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters and alphanumeric." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: email.trim().toLowerCase() }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this username or email address already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const validRole = ["admin", "manager", "author", "user"].includes(role.toLowerCase()) ? role.toLowerCase() : "user";
    const validStatus = ["active", "pending", "suspended"].includes(status.toLowerCase()) ? status.toLowerCase() : "active";

    // Create user via raw query to ensure name, phone, status are saved
    await prisma.$executeRawUnsafe(
      `INSERT INTO User (username, email, password, role, status, name, phone, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3));`,
      cleanUsername,
      email.trim().toLowerCase(),
      hashedPassword,
      validRole,
      validStatus,
      name?.trim() || null,
      phone?.trim() || null
    );

    const created = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    return NextResponse.json({
      success: true,
      message: `User @${cleanUsername} created successfully.`,
      user: created,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user." },
      { status: 500 }
    );
  }
}
