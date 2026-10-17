import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user identifier." }, { status: 400 });
    }

    const rawUser: any = await prisma.$queryRawUnsafe(
      `SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt, lastLoginAt, deletedAt
       FROM User WHERE id = ? LIMIT 1;`,
      userId
    );

    if (!rawUser || rawUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const u = rawUser[0];

    // Fetch related content and activity
    const [posts, comments, likesCount] = await Promise.all([
      prisma.post.findMany({
        where: { authorUsername: u.username },
        orderBy: { createdAt: "desc" },
        take: 5,
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
        take: 5,
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

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user identifier." }, { status: 400 });
    }

    const rawUser: any = await prisma.$queryRawUnsafe(
      `SELECT id, username, email, role, status FROM User WHERE id = ? LIMIT 1;`,
      userId
    );

    if (!rawUser || rawUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const targetUser = rawUser[0];
    const body = await request.json();
    const { role, status, name, phone } = body;

    // Safety constraint: An admin cannot demote or suspend themselves
    if (targetUser.id === currentUser.id) {
      if (role && role.toLowerCase() !== "admin") {
        return NextResponse.json(
          { error: "Security restriction: You cannot demote your own administrator account." },
          { status: 400 }
        );
      }
      if (status && status.toLowerCase() === "suspended") {
        return NextResponse.json(
          { error: "Security restriction: You cannot suspend your own active administrator account." },
          { status: 400 }
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (role !== undefined) {
      const validRole = ["admin", "manager", "author", "user"].includes(role.toLowerCase())
        ? role.toLowerCase()
        : targetUser.role;
      updates.push("role = ?");
      values.push(validRole);
    }

    if (status !== undefined) {
      const validStatus = ["active", "pending", "suspended"].includes(status.toLowerCase())
        ? status.toLowerCase()
        : targetUser.status;
      updates.push("status = ?");
      values.push(validStatus);
    }

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name ? name.trim() : null);
    }

    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone ? phone.trim() : null);
    }

    updates.push("updatedAt = NOW(3)");

    if (updates.length > 0) {
      values.push(userId);
      const query = `UPDATE User SET ${updates.join(", ")} WHERE id = ?;`;
      await prisma.$executeRawUnsafe(query, ...values);
    }

    // Return updated user
    const updatedRaw: any = await prisma.$queryRawUnsafe(
      `SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt, lastLoginAt, deletedAt
       FROM User WHERE id = ? LIMIT 1;`,
      userId
    );

    return NextResponse.json({
      success: true,
      message: `User @${targetUser.username} updated successfully.`,
      user: updatedRaw[0],
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireAdmin();
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user identifier." }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Security restriction: You cannot delete your own active administrator account." },
        { status: 400 }
      );
    }

    const rawUser: any = await prisma.$queryRawUnsafe(
      `SELECT id, username FROM User WHERE id = ? LIMIT 1;`,
      userId
    );

    if (!rawUser || rawUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Hard delete with cascade: Prisma relations are onDelete: Cascade for Post, Comment, Like
      await prisma.user.delete({
        where: { id: userId },
      });
      return NextResponse.json({
        success: true,
        message: `User @${rawUser[0].username} has been permanently deleted from the database.`,
      });
    } else {
      // Soft-delete support
      await prisma.$executeRawUnsafe(
        `UPDATE User SET deletedAt = NOW(3), status = 'suspended', updatedAt = NOW(3) WHERE id = ?;`,
        userId
      );
      return NextResponse.json({
        success: true,
        message: `User @${rawUser[0].username} has been soft-deleted and marked as suspended.`,
      });
    }
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user." },
      { status: 500 }
    );
  }
}
