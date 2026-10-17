"use client";

import * as React from "react";
import Link from "next/link";
import { MessageSquare, Send } from "lucide-react";
import { addCommentAction } from "@/app/actions/interaction-actions";
import { formatDate } from "@/lib/utils";

interface CommentItem {
  id: number | string;
  content: string;
  createdAt: Date | string;
  authorUsername: string;
  author: {
    username: string;
    avatar?: string | null;
  };
}

interface CommentSectionProps {
  postId: number;
  comments: CommentItem[];
  currentUsername?: string | null;
}

export function CommentSection({
  postId,
  comments: initialComments,
  currentUsername,
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!currentUsername) {
      setErrorMsg("Please sign in to join the conversation.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const tempComment: CommentItem = {
      id: `temp-${Date.now()}`,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      authorUsername: currentUsername,
      author: {
        username: currentUsername,
        avatar: null,
      },
    };

    // Optimistically append comment
    setComments((prev) => [tempComment, ...prev]);
    const submittedText = newComment.trim();
    setNewComment("");

    try {
      const res = await addCommentAction({
        postId,
        content: submittedText,
      });

      if (!res.success) {
        // Rollback
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        setNewComment(submittedText);
        setErrorMsg(res.error || "Failed to post comment.");
      } else {
        // Replace temp with persistent
        setComments((prev) =>
          prev.map((c) => (c.id === tempComment.id ? res.comment : c))
        );
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      setNewComment(submittedText);
      setErrorMsg("Network error. Could not save comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
        <h3 className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          Discussions ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {currentUsername ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <span>Commenting as</span>
            <span className="font-semibold text-black dark:text-white">
              @{currentUsername}
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, insights, or questions..."
              className="w-full p-3.5 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black transition-all resize-y"
            />
          </div>

          {errorMsg && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-mono">
              {errorMsg}
            </p>
          )}

          <div className="mt-2.5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-md bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Join the conversation to share your perspective with the community.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-1.5 text-xs font-mono font-semibold rounded-md bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Sign In with Username
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-1.5 text-xs font-mono font-medium rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-500 text-center py-8">
            No comments yet. Be the first to start the discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs flex items-center justify-center font-bold">
                    {comment.authorUsername.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    @{comment.authorUsername}
                  </span>
                </div>
                <time
                  dateTime={new Date(comment.createdAt).toISOString()}
                  className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400"
                >
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
