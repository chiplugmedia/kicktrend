"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Heart,
  MessageSquare,
  Pencil,
  Search,
  Filter,
  User,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { approvePostAction, rejectPostAction } from "@/app/actions/post-actions";
import { formatDate } from "@/lib/utils";

export interface AdminPostListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  videoUrl?: string | null;
  views: number;
  published: boolean;
  status: string;
  rejectionReason?: string | null;
  createdAt: string | Date;
  authorUsername: string;
  _count: {
    likes: number;
    comments: number;
  };
}

interface AdminPostsManagerProps {
  initialPosts: AdminPostListItem[];
}

export function AdminPostsManager({ initialPosts }: AdminPostsManagerProps) {
  const router = useRouter();
  const [posts, setPosts] = React.useState<AdminPostListItem[]>(initialPosts);
  const [filter, setFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = React.useState("");
  const [processingId, setProcessingId] = React.useState<number | null>(null);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectTargetPost, setRejectTargetPost] = React.useState<AdminPostListItem | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const pendingCount = posts.filter((p) => p.status?.toLowerCase() === "pending").length;
  const approvedCount = posts.filter((p) => p.status?.toLowerCase() === "approved").length;
  const rejectedCount = posts.filter((p) => p.status?.toLowerCase() === "rejected").length;

  const handleApprove = async (postId: number) => {
    setProcessingId(postId);
    try {
      const res = await approvePostAction(postId);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, status: "approved", published: true, rejectionReason: null }
              : p
          )
        );
        router.refresh();
      } else {
        alert(res.error || "Failed to approve post");
      }
    } catch {
      alert("Network error approving post");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (post: AdminPostListItem) => {
    setRejectTargetPost(post);
    setRejectionReason(post.rejectionReason || "");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetPost) return;
    setProcessingId(rejectTargetPost.id);
    try {
      const res = await rejectPostAction(
        rejectTargetPost.id,
        rejectionReason.trim() || "Article does not meet editorial publication standards."
      );
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === rejectTargetPost.id
              ? {
                  ...p,
                  status: "rejected",
                  published: false,
                  rejectionReason: rejectionReason.trim(),
                }
              : p
          )
        );
        setRejectModalOpen(false);
        setRejectTargetPost(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to reject post");
      }
    } catch {
      alert("Network error rejecting post");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const s = (p.status || "approved").toLowerCase();
    if (filter === "pending" && s !== "pending") return false;
    if (filter === "approved" && s !== "approved") return false;
    if (filter === "rejected" && s !== "rejected") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.authorUsername.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
      {/* Pending Banner Alert if pending posts exist */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold">
              {pendingCount} {pendingCount === 1 ? "article is" : "articles are"} waiting for review
            </span>
            <span className="text-amber-700 dark:text-amber-400 hidden md:inline">
              &mdash; Author submissions require approval before appearing on the public feed.
            </span>
          </div>
          <button
            onClick={() => setFilter("pending")}
            className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors self-start sm:self-auto"
          >
            Review Pending Submissions
          </button>
        </div>
      )}

      {/* Header with Tabs & Search */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
            }`}
          >
            All Articles ({posts.length})
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
              filter === "pending"
                ? "bg-amber-500 text-white font-bold"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
              filter === "approved"
                ? "bg-emerald-600 text-white font-bold"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved ({approvedCount})</span>
          </button>

          <button
            onClick={() => setFilter("rejected")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
              filter === "rejected"
                ? "bg-rose-600 text-white font-bold"
                : "text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/40"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, category..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-mono text-sm space-y-3">
            <p>No articles found matching this filter.</p>
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Article</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const status = (post.status || "approved").toLowerCase();
            const isProcessing = processingId === post.id;

            return (
              <div
                key={post.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        PENDING APPROVAL
                      </span>
                    )}
                    {status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        APPROVED
                      </span>
                    )}
                    {status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        REJECTED
                      </span>
                    )}

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
                      {post.category}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>@{post.authorUsername}</span>
                    </span>

                    <span className="text-xs font-mono text-zinc-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-1 font-sans">
                    {post.summary}
                  </p>

                  {/* Rejection notice snippet if rejected */}
                  {status === "rejected" && post.rejectionReason && (
                    <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded border border-rose-200/60 dark:border-rose-900/40">
                      Feedback: {post.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Right Actions & Review Controls */}
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 shrink-0 self-end lg:self-auto">
                  {/* Quick Review Buttons for Admin */}
                  <div className="flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-800 pr-3">
                    {status !== "approved" && (
                      <button
                        onClick={() => handleApprove(post.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold transition-colors disabled:opacity-50"
                        title="Approve and Publish Post"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve</span>
                      </button>
                    )}

                    {status !== "rejected" && (
                      <button
                        onClick={() => handleOpenReject(post)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-mono text-xs transition-colors disabled:opacity-50"
                        title="Reject Post with Feedback"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>

                  {/* Telemetry stats */}
                  <span className="flex items-center gap-1" title="Views">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{post.views || 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Likes">
                    <Heart className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{post._count?.likes ?? 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Comments">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{post._count?.comments ?? 0}</span>
                  </span>

                  {/* Edit link */}
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="Edit article"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  {/* Public link (if approved) */}
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="View public article"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Rejection Modal */}
      {rejectModalOpen && rejectTargetPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-mono font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Article Submission</span>
            </div>

            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
              Provide constructive feedback to author <strong>@{rejectTargetPost.authorUsername}</strong> explaining why &quot;{rejectTargetPost.title}&quot; was rejected and what revisions are needed:
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please add source links for the statistics cited in section 2, and refine the cover image resolution."
              className="w-full p-3 text-xs font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={processingId !== null}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-colors disabled:opacity-50"
              >
                {processingId !== null ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
