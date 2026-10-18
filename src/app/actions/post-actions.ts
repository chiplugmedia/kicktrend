"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuthorOrAdmin, requireAuthor } from "@/lib/auth";
import { calculateReadTime, slugify, stripHtml } from "@/lib/utils";
import { extractCoverImageFilename, formatCoverImageUrl } from "@/lib/imageHelper";
import type { PostSummary } from "@/types";

export interface FetchPostsFilter {
  query?: string;
  category?: string;
  includeUnapproved?: boolean;
}

export async function getPosts(filter: FetchPostsFilter = {}): Promise<PostSummary[]> {
  const { query, category, includeUnapproved } = filter;

  const whereClause: any = includeUnapproved
    ? {}
    : {
        published: true,
        status: "approved",
      };

  if (category && category !== "All") {
    whereClause.category = category;
  }

  if (query && query.trim()) {
    const q = query.trim();
    whereClause.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
      { content: { contains: q } },
      { tags: { contains: q } },
      { hashtags: { contains: q } },
      { authorUsername: { contains: q } },
    ];
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      videoUrl: true,
      category: true,
      tags: true,
      hashtags: true,
      readTime: true,
      views: true,
      published: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      authorUsername: true,
      author: {
        select: {
          username: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverImage: formatCoverImageUrl(post.coverImage),
    videoUrl: post.videoUrl,
    category: post.category,
    tags: post.tags,
    hashtags: post.hashtags,
    readTime: post.readTime,
    views: post.views,
    published: post.published,
    status: post.status,
    rejectionReason: post.rejectionReason,
    createdAt: post.createdAt.toISOString(),
    authorUsername: post.authorUsername,
    author: post.author,
    _count: {
      likes: post._count?.likes ?? 0,
      comments: post._count?.comments ?? 0,
    },
    likesCount: post._count?.likes ?? 0,
    commentsCount: post._count?.comments ?? 0,
  })) as unknown as PostSummary[];
}

export async function createPostAction(formData: {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverImage?: string;
  videoUrl?: string;
  category: string;
  tags: string;
  hashtags: string;
  published?: boolean;
}) {
  try {
    const user = await requireAuthorOrAdmin();
    const isAdminOrManager = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "manager";

    const computedSlug = slugify(formData.slug || formData.title);
    if (!computedSlug) {
      return { success: false, error: "A valid title or slug is required." };
    }

    // Check slug uniqueness
    const existing = await prisma.post.findUnique({
      where: { slug: computedSlug },
    });
    if (existing) {
      return {
        success: false,
        error: `A post with slug "${computedSlug}" already exists. Please choose a different slug.`,
      };
    }

    const readTime = calculateReadTime(formData.content);

    // Permission enforcement:
    // Authors cannot publish directly; their posts are submitted as pending for review.
    // Admins and managers can publish directly.
    const isPublished = isAdminOrManager ? (formData.published ?? true) : false;
    const postStatus = isAdminOrManager ? (isPublished ? "approved" : "draft") : "pending";

    const post = await prisma.post.create({
      data: {
        title: formData.title.trim(),
        slug: computedSlug,
        summary: stripHtml(formData.summary),
        content: formData.content.trim(),
        coverImage: extractCoverImageFilename(formData.coverImage),
        videoUrl: formData.videoUrl?.trim() || null,
        category: formData.category.trim() || "General",
        tags: formData.tags.trim(),
        hashtags: formData.hashtags.trim(),
        readTime,
        published: isPublished,
        status: postStatus,
        rejectionReason: null,
        authorUsername: user.username,
      },
    });

    revalidatePath("/");
    revalidatePath(`/posts/${post.slug}`);
    revalidatePath("/admin");
    revalidatePath("/author");

    return {
      success: true,
      post,
      isPendingReview: !isAdminOrManager,
      message: isAdminOrManager
        ? "Post published successfully."
        : "Post submitted successfully! It is now pending administrator review.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create post" };
  }
}

export async function getPostById(id: number) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true, avatar: true },
        },
      },
    });
    return post;
  } catch (err) {
    console.error("Failed to fetch post by ID:", err);
    return null;
  }
}

export async function updatePostAction(
  id: number,
  formData: {
    title: string;
    slug?: string;
    summary: string;
    content: string;
    coverImage?: string;
    videoUrl?: string;
    category: string;
    tags: string;
    hashtags: string;
    published?: boolean;
    status?: string;
    rejectionReason?: string | null;
  }
) {
  try {
    const user = await requireAuthorOrAdmin();
    const isAdminOrManager = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "manager";

    const existing = await prisma.post.findUnique({
      where: { id },
    });
    if (!existing) {
      return { success: false, error: "Post not found" };
    }

    // Role check: Authors can only edit their own posts
    if (!isAdminOrManager && existing.authorUsername !== user.username) {
      return {
        success: false,
        error: "Forbidden: You are only permitted to edit your own submitted posts.",
      };
    }

    const computedSlug = slugify(formData.slug || formData.title);
    if (!computedSlug) {
      return { success: false, error: "A valid title or slug is required." };
    }

    // Check slug collision with other posts
    if (computedSlug !== existing.slug) {
      const collision = await prisma.post.findUnique({
        where: { slug: computedSlug },
      });
      if (collision && collision.id !== id) {
        return {
          success: false,
          error: `Another post with slug "${computedSlug}" already exists.`,
        };
      }
    }

    const readTime = calculateReadTime(formData.content);

    // Permission enforcement:
    // If an author edits a post, it reverts/submits to "pending" review and published=false.
    // If an admin edits, they can control published and status.
    let updatedPublished = existing.published;
    let updatedStatus = existing.status;
    let updatedRejectionReason = existing.rejectionReason;

    if (isAdminOrManager) {
      if (formData.published !== undefined) {
        updatedPublished = formData.published;
      }
      if (formData.status !== undefined) {
        updatedStatus = formData.status;
      }
      if (formData.rejectionReason !== undefined) {
        updatedRejectionReason = formData.rejectionReason;
      }
    } else {
      // Author edit: submit for review
      updatedPublished = false;
      updatedStatus = "pending";
      updatedRejectionReason = null; // Clear previous rejection when re-submitted
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: formData.title.trim(),
        slug: computedSlug,
        summary: stripHtml(formData.summary),
        content: formData.content.trim(),
        coverImage:
          formData.coverImage !== undefined
            ? extractCoverImageFilename(formData.coverImage)
            : existing.coverImage,
        videoUrl: formData.videoUrl !== undefined ? formData.videoUrl.trim() || null : existing.videoUrl,
        category: formData.category?.trim() || existing.category,
        tags: formData.tags?.trim() ?? existing.tags,
        hashtags: formData.hashtags?.trim() ?? existing.hashtags,
        readTime,
        published: updatedPublished,
        status: updatedStatus,
        rejectionReason: updatedRejectionReason,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/author");
    revalidatePath(`/posts/${existing.slug}`);
    revalidatePath(`/posts/${updated.slug}`);

    return {
      success: true,
      post: updated,
      message: isAdminOrManager
        ? "Post updated successfully."
        : "Post updated and re-submitted for administrator review.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update post" };
  }
}

export async function approvePostAction(id: number) {
  try {
    await requireAdmin();

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: "approved",
        published: true,
        rejectionReason: null,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/author");
    revalidatePath(`/posts/${post.slug}`);

    return { success: true, post };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve post" };
  }
}

export async function rejectPostAction(id: number, reason?: string) {
  try {
    await requireAdmin();

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: "rejected",
        published: false,
        rejectionReason: reason?.trim() || "Does not meet editorial guidelines",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/author");
    revalidatePath(`/posts/${post.slug}`);

    return { success: true, post };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject post" };
  }
}

export async function getAuthorPostsAction() {
  try {
    const user = await requireAuthor();

    const posts = await prisma.post.findMany({
      where: {
        authorUsername: user.username,
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const stats = {
      total: posts.length,
      approved: posts.filter((p) => p.status?.toLowerCase() === "approved").length,
      pending: posts.filter((p) => p.status?.toLowerCase() === "pending").length,
      rejected: posts.filter((p) => p.status?.toLowerCase() === "rejected").length,
    };

    return { success: true, posts, stats, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch author posts" };
  }
}

export async function deletePostAction(id: number) {
  try {
    const user = await requireAuthorOrAdmin();
    const isAdminOrManager = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "manager";

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    if (!isAdminOrManager && post.authorUsername !== user.username) {
      return { success: false, error: "Forbidden: You can only delete your own posts." };
    }

    await prisma.post.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/author");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete post" };
  }
}

