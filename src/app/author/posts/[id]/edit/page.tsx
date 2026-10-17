import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuthor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/app/actions/category-actions";
import { AdminPostForm } from "@/app/admin/new/AdminPostForm";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Article — Author Workspace",
  description: "Revise and resubmit your article for editorial review.",
};

export default async function AuthorEditPostPage({ params }: PageProps) {
  const user = await requireAuthor();
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
    }),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  // Security constraint: Authors can only edit their own posts
  const isAdminOrManager = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "manager";
  if (!isAdminOrManager && post.authorUsername !== user.username) {
    return (
      <div className="py-20 text-center space-y-3">
        <h1 className="text-xl font-mono font-bold text-red-500">Access Denied</h1>
        <p className="text-xs font-mono text-zinc-500">
          You are only authorized to edit articles submitted by your account (@{user.username}).
        </p>
        <Link
          href="/author"
          className="inline-block px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold"
        >
          Return to My Submissions
        </Link>
      </div>
    );
  }

  const status = (post.status || "approved").toLowerCase();

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-4 space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <Link
          href="/author"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-600 text-white font-bold">
              AUTHOR WORKSPACE
            </span>

            {status === "pending" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                PENDING REVIEW
              </span>
            )}
            {status === "approved" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                APPROVED & PUBLISHED
              </span>
            )}
            {status === "rejected" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                REVISIONS REQUIRED
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Edit Article: {post.title}
          </h1>
          <p className="text-xs font-mono text-zinc-500 mt-1">
            Author: <strong>@{post.authorUsername}</strong> &middot; Slug: <code>{post.slug}</code>
          </p>
        </div>
      </div>

      {/* Rejection / Status Banner */}
      {status === "rejected" && (
        <div className="p-4 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Administrator Feedback for Revision</span>
          </div>
          <p className="text-xs font-sans bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-rose-200/60 dark:border-rose-900/60">
            &quot;{post.rejectionReason || "Please adjust formatting and verify editorial accuracy."}&quot;
          </p>
          <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
            Once you make your revisions and save, this article will be automatically resubmitted to the review queue.
          </p>
        </div>
      )}

      {status === "pending" && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-mono flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>In Review:</strong> This article is currently awaiting administrator approval. Any changes you save here will be submitted into the review queue.
          </div>
        </div>
      )}

      <AdminPostForm
        authorUsername={user.username}
        categories={categories}
        initialPost={post}
        isEditMode={true}
        isAuthorMode={true}
      />
    </div>
  );
}
