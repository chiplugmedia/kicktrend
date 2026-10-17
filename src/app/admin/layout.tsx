import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?next=/admin");
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="max-w-md w-full p-8 border border-zinc-200 dark:border-zinc-800 rounded-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center font-mono font-bold text-lg">
            !
          </div>
          <h1 className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            Administrator Access Required
          </h1>
          <p className="text-xs font-mono text-zinc-500 leading-relaxed">
            You are signed in as <strong>@{currentUser.username}</strong> with role &quot;{currentUser.role}&quot;.
            Only administrators are authorized to access the control panel.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-semibold"
            >
              Return to Public Site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayoutClient currentUser={currentUser}>
      {children}
    </AdminLayoutClient>
  );
}
