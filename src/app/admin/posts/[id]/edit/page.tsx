import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/app/actions/category-actions";
import { AdminPostForm } from "@/app/admin/new/AdminPostForm";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPostPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?next=/admin");
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-mono font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-sm text-zinc-500">Only administrators have access to article editing.</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
            Edit Article: {post.title}
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Slug: <code>{post.slug}</code> &middot; Published by @{post.authorUsername}
          </p>
        </div>

        <Link
          href={`/posts/${post.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public</span>
        </Link>
      </div>

      <AdminPostForm
        authorUsername={currentUser.username}
        categories={categories}
        initialPost={post}
        isEditMode={true}
      />
    </div>
  );
}
