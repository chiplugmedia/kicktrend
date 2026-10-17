"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLikePostAction } from "@/app/actions/interaction-actions";

interface LikeButtonProps {
  postId: number;
  initialLikesCount: number;
  initialIsLiked: boolean;
  currentUsername?: string | null;
}

export function LikeButton({
  postId,
  initialLikesCount,
  initialIsLiked,
  currentUsername,
}: LikeButtonProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = React.useState(initialLikesCount);
  const [isLiked, setIsLiked] = React.useState(initialIsLiked);
  const [isPending, setIsPending] = React.useState(false);
  const [showAuthHint, setShowAuthHint] = React.useState(false);

  const handleLike = async () => {
    if (!currentUsername) {
      setShowAuthHint(true);
      setTimeout(() => setShowAuthHint(false), 3000);
      return;
    }

    if (isPending) return;
    setIsPending(true);

    // Optimistic UI update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!previousIsLiked);
    setLikesCount(previousIsLiked ? previousLikesCount - 1 : previousLikesCount + 1);

    try {
      const res = await toggleLikePostAction(postId);
      if (!res.success) {
        // Rollback if failed
        setIsLiked(previousIsLiked);
        setLikesCount(previousLikesCount);
        alert(res.error || "Failed to update like");
      } else {
        setIsLiked(Boolean(res.liked));
        setLikesCount(Number(res.likesCount));
      }
    } catch {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleLike}
        disabled={isPending}
        className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-mono font-medium ${
          isLiked
            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xs"
            : "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        }`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
            isLiked
              ? "fill-white dark:fill-black text-white dark:text-black"
              : "text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white"
          }`}
        />
        <span>{likesCount}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
          {likesCount === 1 ? "Like" : "Likes"}
        </span>
      </button>

      {/* Auth notification if unauthenticated */}
      {showAuthHint && (
        <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-black dark:bg-white text-white dark:text-black text-xs rounded-md shadow-xl border border-zinc-800 dark:border-zinc-200 z-50 animate-fadeIn">
          <p className="font-semibold mb-1">Sign in required</p>
          <p className="opacity-90 mb-2">
            You must be logged in with a username to like posts.
          </p>
          <button
            onClick={() => router.push(`/auth/login?next=/posts`)}
            className="w-full text-center py-1 bg-white dark:bg-black text-black dark:text-white rounded font-mono font-bold text-[11px] hover:opacity-90"
          >
            Log In Now
          </button>
        </div>
      )}
    </div>
  );
}
