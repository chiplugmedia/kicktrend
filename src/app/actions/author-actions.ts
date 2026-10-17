"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthor, verifyPassword, hashPassword } from "@/lib/auth";

export interface UpdateAuthorProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getAuthorProfileAction() {
  try {
    const user = await requireAuthor();

    const rawUser: any = await prisma.$queryRawUnsafe(
      `SELECT id, username, email, role, status, name, phone, avatar, createdAt, updatedAt
       FROM User WHERE username = ? LIMIT 1;`,
      user.username
    );

    if (!rawUser || rawUser.length === 0) {
      return { success: false, error: "User not found" };
    }

    const u = rawUser[0];

    // Fetch author's post count breakdown
    const [totalPosts, pendingPosts, approvedPosts, rejectedPosts] = await Promise.all([
      prisma.post.count({ where: { authorUsername: user.username } }),
      prisma.post.count({ where: { authorUsername: user.username, status: "pending" } }),
      prisma.post.count({ where: { authorUsername: user.username, status: "approved" } }),
      prisma.post.count({ where: { authorUsername: user.username, status: "rejected" } }),
    ]);

    return {
      success: true,
      profile: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        status: u.status,
        name: u.name || "",
        phone: u.phone || "",
        avatar: u.avatar || "",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      },
      stats: {
        total: totalPosts,
        pending: pendingPosts,
        approved: approvedPosts,
        rejected: rejectedPosts,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load author profile" };
  }
}

export async function updateAuthorProfileAction(data: UpdateAuthorProfileInput) {
  try {
    const user = await requireAuthor();

    // Fetch existing user to verify password if requested
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (!existingUser) {
      return { success: false, error: "Author account not found" };
    }

    const updateData: {
      name?: string | null;
      phone?: string | null;
      avatar?: string | null;
      password?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name.trim() || null;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone.trim() || null;
    }

    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar.trim() || null;
    }

    // Password change verification
    if (data.newPassword && data.newPassword.trim()) {
      if (!data.currentPassword) {
        return { success: false, error: "Current password is required to set a new password." };
      }

      const isCurrentValid = await verifyPassword(data.currentPassword, existingUser.password);
      if (!isCurrentValid) {
        return { success: false, error: "Incorrect current password." };
      }

      if (data.newPassword.length < 6) {
        return { success: false, error: "New password must be at least 6 characters long." };
      }

      updateData.password = await hashPassword(data.newPassword.trim());
    }

    await prisma.user.update({
      where: { username: user.username },
      data: updateData,
    });

    revalidatePath("/author");
    revalidatePath("/author/settings");

    return { success: true, message: "Profile updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update author profile." };
  }
}
