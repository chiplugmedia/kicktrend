import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getVisitorAnalyticsOverview } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";
import { SiteTrafficTrend } from "@/components/admin/SiteTrafficTrend";
import { AdminPostsManager } from "@/components/admin/AdminPostsManager";
import {
  Plus,
  FolderTree,
  Settings,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [posts, visitorOverview, categoriesCount] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    getVisitorAnalyticsOverview(7),
    prisma.category.count(),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
            CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Editorial Overview & Telemetry
          </h1>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics, daily traffic trends, and content management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>

          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categoriesCount})</span>
          </Link>

          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Site Traffic Trends, Country Geolocation & Visitor Activity */}
      <SiteTrafficTrend initialOverview={visitorOverview} />

      {/* Editorial Content & Review Manager */}
      <AdminPostsManager initialPosts={posts as any} />
    </div>
  );
}
