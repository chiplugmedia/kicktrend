import Link from "next/link";
import { requireAuthor } from "@/lib/auth";
import { getCategories } from "@/app/actions/category-actions";
import { AdminPostForm } from "@/app/admin/new/AdminPostForm";
import { ArrowLeft, Clock } from "lucide-react";

export const metadata = {
  title: "Submit New Article — Author Workspace",
  description: "Compose and submit a new article for administrative approval.",
};

export default async function AuthorNewPostPage() {
  const user = await requireAuthor();
  const categories = await getCategories();

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-4">
      {/* Back button and title */}
      <div className="mb-6 space-y-3">
        <Link
          href="/author"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </Link>

        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-600 text-white font-bold">
              AUTHOR WORKSPACE
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400">
              <Clock className="w-3 h-3" />
              <span>Review Required</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Submit New Article
          </h1>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Authoring as <strong>@{user.username}</strong>. Submissions are reviewed by the editorial team before publication.
          </p>
        </div>
      </div>

      <AdminPostForm
        authorUsername={user.username}
        categories={categories}
        isAuthorMode={true}
      />
    </div>
  );
}
