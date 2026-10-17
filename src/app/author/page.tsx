import { Suspense } from "react";
import { requireAuthor } from "@/lib/auth";
import { getAuthorPostsAction } from "@/app/actions/post-actions";
import { AuthorDashboardClient } from "./AuthorDashboardClient";

export const metadata = {
  title: "Author Workspace — Submissions & Approval Status",
  description: "Manage your article drafts, check admin approval status, and submit new posts.",
};

export default async function AuthorDashboardPage() {
  const user = await requireAuthor();
  const result = await getAuthorPostsAction();

  const posts = result.success && result.posts ? result.posts : [];
  const stats = result.success && result.stats ? result.stats : {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-mono text-xs text-zinc-500 animate-pulse">
          Loading Author Dashboard...
        </div>
      }
    >
      <AuthorDashboardClient
        initialPosts={posts as any}
        initialStats={stats}
        authorUsername={user.username}
      />
    </Suspense>
  );
}
