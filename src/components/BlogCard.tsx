"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Heart, MessageSquare, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { PostSummary } from "@/types";

import { getVideoThumbnail } from "@/lib/socialEmbedHelper";

interface BlogCardProps {
  post: PostSummary;
}

export function BlogCard({ post }: BlogCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const directCover = post.coverImage?.trim() || null;
  const videoThumb = getVideoThumbnail(post.videoUrl);
  const displayImage = !imageError && directCover ? directCover : videoThumb;

  const hashtagsList = post.hashtags
    ? post.hashtags
        .split(/[\s,]+/)
        .filter((t) => t.trim().length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`))
    : [];

  return (
    <article className="group relative flex flex-col justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-black dark:hover:border-zinc-500 transition-all duration-200 shadow-xs hover:shadow-sm">
      <div>
        {/* Cover Image or Video Preview */}
        {displayImage && (
          <Link href={`/posts/${post.slug}`} className="block relative aspect-video w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 mb-4">
            <Image
              src={displayImage}
              alt={post.title}
              fill
              unoptimized
              onError={() => setImageError(true)}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {post.videoUrl && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 text-white text-[11px] font-mono font-medium backdrop-blur-xs border border-white/10">
                <Play className="w-3 h-3 fill-white" />
                <span>VIDEO</span>
              </div>
            )}
          </Link>
        )}

        {/* Category & Read Time */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          <Link
            href={`/?cat=${encodeURIComponent(post.category)}`}
            className="font-mono uppercase tracking-wider text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 hover:underline"
          >
            {post.category}
          </Link>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`} className="block group-hover:underline">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 font-normal leading-relaxed">
          {post.summary}
        </p>

        {/* Hashtags */}
        {hashtagsList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hashtagsList.map((tag) => (
              <Link
                key={tag}
                href={`/?q=${encodeURIComponent(tag)}`}
                className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Author username and stats */}
      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-[10px] flex items-center justify-center font-bold">
            {(post.authorUsername || "U").slice(0, 1).toUpperCase()}
          </div>
          <span className="font-mono text-zinc-800 dark:text-zinc-300">
            @{post.authorUsername}
          </span>
          <span>•</span>
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex items-center gap-1" title="Likes">
            <Heart className="w-3.5 h-3.5" />
            <span>{post._count?.likes ?? (post as any).likesCount ?? 0}</span>
          </span>
          <span className="flex items-center gap-1" title="Comments">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post._count?.comments ?? (post as any).commentsCount ?? 0}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
