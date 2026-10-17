"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ToggleLikeResult =
  | { success: true; liked: boolean; likesCount: number }
  | { success: false; error: string };

export type AddCommentResult =
  | { success: true; comment: any }
  | { success: false; error: string };

export async function toggleLikePostAction(postId: number): Promise<ToggleLikeResult> {
  try {
    const user = await requireUser();

    // Check if like already exists by (postId, authorUsername)
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_authorUsername: {
          postId,
          authorUsername: user.username,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          authorUsername: user.username,
        },
      });
      liked = true;
    }

    const likesCount = await prisma.like.count({
      where: { postId },
    });

    // Find post slug to revalidate path
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { slug: true },
    });

    if (post) {
      revalidatePath(`/posts/${post.slug}`);
    }
    revalidatePath("/");

    return { success: true, liked, likesCount };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update like status" };
  }
}

export async function addCommentAction({
  postId,
  content,
}: {
  postId: number;
  content: string;
}): Promise<AddCommentResult> {
  try {
    const user = await requireUser();

    if (!content || !content.trim()) {
      return { success: false, error: "Comment text cannot be empty." };
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorUsername: user.username, // Attach to unique username
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorUsername: true,
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { slug: true },
    });

    if (post) {
      revalidatePath(`/posts/${post.slug}`);
    }
    revalidatePath("/");

    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add comment" };
  }
}
