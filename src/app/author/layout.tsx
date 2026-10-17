import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAuthorPostsAction } from "@/app/actions/post-actions";
import { AuthorLayoutClient } from "./AuthorLayoutClient";

export const dynamic = "force-dynamic";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?next=/author");
  }

  const role = currentUser.role?.toLowerCase();
  const isAuthorOrAdmin = role === "author" || role === "admin" || role === "manager";

  if (!isAuthorOrAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="max-w-md w-full p-8 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center font-mono font-bold text-lg">
            ✎
          </div>
          <h1 className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            Author Role Required
          </h1>
          <p className="text-xs font-mono text-zinc-500 leading-relaxed">
            You are signed in as <strong>@{currentUser.username}</strong> with the standard &quot;user&quot; role.
            Standard users have reader privileges. To write and submit articles for review, your account must be assigned the <strong>Author</strong> role by an administrator.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-semibold"
            >
              Return to Feed
            </a>
          </div>
        </div>
      </div>
    );
  }

  const postResult = await getAuthorPostsAction();
  const stats = postResult.success && postResult.stats ? postResult.stats : {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  return (
    <AuthorLayoutClient currentUser={currentUser} stats={stats}>
      {children}
    </AuthorLayoutClient>
  );
}
