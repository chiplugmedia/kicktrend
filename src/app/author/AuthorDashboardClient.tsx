"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PenSquare,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Trash2,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { deletePostAction } from "@/app/actions/post-actions";
import { formatDate } from "@/lib/utils";

export interface AuthorPostItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  readTime: number;
  views: number;
  published: boolean;
  status: string;
  rejectionReason?: string | null;
  createdAt: string | Date;
  _count: {
    likes: number;
    comments: number;
  };
}

interface AuthorDashboardClientProps {
  initialPosts: AuthorPostItem[];
  initialStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  authorUsername: string;
}

export function AuthorDashboardClient({
  initialPosts,
  initialStats,
  authorUsername,
}: AuthorDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [posts, setPosts] = React.useState<AuthorPostItem[]>(initialPosts);
  const [stats, setStats] = React.useState(initialStats);
  const [activeTab, setActiveTab] = React.useState<"all" | "pending" | "approved" | "rejected">(
    tabParam && ["all", "pending", "approved", "rejected"].includes(tabParam.toLowerCase())
      ? (tabParam.toLowerCase() as any)
      : "all"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (tabParam && ["all", "pending", "approved", "rejected"].includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase() as any);
    }
  }, [tabParam]);

  const handleDelete = async (postId: number, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the submission "${postTitle}"?`)) {
      return;
    }

    setDeletingId(postId);
    try {
      const res = await deletePostAction(postId);
      if (res.success) {
        setPosts((prev) => {
          const updated = prev.filter((p) => p.id !== postId);
          setStats({
            total: updated.length,
            approved: updated.filter((p) => p.status?.toLowerCase() === "approved").length,
            pending: updated.filter((p) => p.status?.toLowerCase() === "pending").length,
            rejected: updated.filter((p) => p.status?.toLowerCase() === "rejected").length,
          });
          return updated;
        });
        router.refresh();
      } else {
        alert(res.error || "Failed to delete article");
      }
    } catch {
      alert("Network error deleting article");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const s = (p.status || "approved").toLowerCase();
    if (activeTab === "pending" && s !== "pending") return false;
    if (activeTab === "approved" && s !== "approved") return false;
    if (activeTab === "rejected" && s !== "rejected") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-600 text-white font-bold uppercase tracking-wider">
              AUTHOR WORKSPACE
            </span>
            <span className="text-xs font-mono text-zinc-500">
              Signed in as <strong>@{authorUsername}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Article Submissions & Status
          </h1>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Track editorial approval progress, review reviewer feedback, and draft new dispatches.
          </p>
        </div>

        <Link
          href="/author/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-mono text-xs font-bold shadow-sm transition-all self-start md:self-auto"
        >
          <PenSquare className="w-4 h-4" />
          <span>Submit New Article</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submissions */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-zinc-500">Total Created</span>
            <FileText className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              {stats.total}
            </span>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">All your submissions</p>
          </div>
        </div>

        {/* Approved & Live */}
        <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
              Approved & Live
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300">
              {stats.approved}
            </span>
            <p className="text-[11px] font-mono text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
              Live on public feed
            </p>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-amber-700 dark:text-amber-400">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-amber-700 dark:text-amber-300">
              {stats.pending}
            </span>
            <p className="text-[11px] font-mono text-amber-600/70 dark:text-amber-400/70 mt-0.5">
              Awaiting admin review
            </p>
          </div>
        </div>

        {/* Rejected / Revisions */}
        <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-rose-700 dark:text-rose-400">
              Needs Revision
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black font-mono text-rose-700 dark:text-rose-300">
              {stats.rejected}
            </span>
            <p className="text-[11px] font-mono text-rose-600/70 dark:text-rose-400/70 mt-0.5">
              Feedback from admin
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
              }`}
            >
              All Submissions ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white font-bold"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending ({stats.pending})</span>
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Approved ({stats.approved})</span>
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40"
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>Needs Revision ({stats.rejected})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your articles..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Submissions List */}
        <div className="divide-y divide-zinc-200 dark:border-zinc-800 dark:divide-zinc-800">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <h3 className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
                No articles found
              </h3>
              <p className="text-xs font-mono text-zinc-500 max-w-sm mx-auto">
                {activeTab === "pending"
                  ? "You have no articles waiting in the review queue."
                  : activeTab === "rejected"
                  ? "Great job! None of your articles have been rejected."
                  : activeTab === "approved"
                  ? "No approved articles yet. Submit an article to have it reviewed."
                  : "You haven't submitted any articles yet."}
              </p>
              <div className="pt-2">
                <Link
                  href="/author/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write an Article</span>
                </Link>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const status = (post.status || "approved").toLowerCase();

              return (
                <div
                  key={post.id}
                  className="p-5 flex flex-col gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Approval Status Pill */}
                        {status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            PENDING APPROVAL
                          </span>
                        )}
                        {status === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            APPROVED & PUBLISHED
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            REJECTED / REVISION NEEDED
                          </span>
                        )}

                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          {post.category}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {formatDate(post.createdAt)}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {post.readTime} min read
                        </span>
                      </div>

                      {/* Post Title */}
                      <h2 className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {post.title}
                      </h2>

                      {/* Post Summary */}
                      <p className="text-xs text-zinc-500 font-sans line-clamp-2">
                        {post.summary}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <Link
                        href={`/author/posts/${post.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 font-mono text-xs transition-colors"
                        title="Edit Article"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      {status === "approved" && (
                        <Link
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 font-mono text-xs transition-colors"
                          title="View Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Live</span>
                        </Link>
                      )}

                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status Detail Notes */}
                  {status === "pending" && (
                    <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-xs font-mono text-amber-800 dark:text-amber-300">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>In Review Queue:</strong> Your article has been received and is waiting for an administrator to review it. You can make adjustments at any time by clicking <em>Edit</em>.
                      </div>
                    </div>
                  )}

                  {status === "rejected" && (
                    <div className="p-3.5 rounded-lg bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs font-mono text-rose-800 dark:text-rose-200">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div>
                          <strong>Editorial Feedback from Administrator:</strong>
                        </div>
                        <p className="font-sans text-xs bg-white/70 dark:bg-zinc-900/60 p-2 rounded border border-rose-200/60 dark:border-rose-900/40 text-rose-900 dark:text-rose-100">
                          &quot;{post.rejectionReason || "Please review the editorial style guide, verify article formatting, and resubmit."}&quot;
                        </p>
                        <p className="text-[11px] text-rose-600 dark:text-rose-300 pt-1">
                          Click <strong>Edit</strong> to revise your article and resubmit it for another review.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Performance stats for approved articles */}
                  {status === "approved" && (
                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.views || 0} views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post._count?.likes ?? 0} likes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post._count?.comments ?? 0} comments</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
