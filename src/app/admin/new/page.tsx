import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/app/actions/category-actions";
import { AdminPostForm } from "./AdminPostForm";

export default async function AdminNewPostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?next=/admin/new");
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-mono font-bold text-red-500 mb-2">Access Denied</h1>
        <p className="text-sm text-zinc-500">
          Only administrators have access to publishing tools.
        </p>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8">
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
          ADMIN CONSOLE
        </span>
        <h1 className="text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          Compose New Dispatch
        </h1>
        <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          Publishing as @{currentUser.username}
        </p>
      </div>

      <AdminPostForm
        authorUsername={currentUser.username}
        categories={categories}
      />
    </div>
  );
}
