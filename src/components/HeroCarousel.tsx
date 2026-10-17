"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PostSummary } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  FileText,
} from "lucide-react";
import { getVideoThumbnail } from "@/lib/socialEmbedHelper";

interface HeroCarouselProps {
  posts: PostSummary[];
}

export function HeroCarousel({ posts }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  // Auto-slide every 5 seconds unless hovered/paused
  React.useEffect(() => {
    if (posts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [posts.length, isPaused]);

  if (!posts || posts.length === 0) return null;

  const currentPost = posts[currentIndex] || posts[0];
  const directCover = currentPost.coverImage?.trim() || null;
  const videoThumb = getVideoThumbnail(currentPost.videoUrl);
  const isImageFailed = Boolean(failedImages[currentIndex]);
  const activeImage = !isImageFailed && directCover ? directCover : videoThumb;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/70 p-6 sm:p-8 lg:p-10 transition-all shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Editorial Featured Stories"
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
        {/* Left Content Column */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>FEATURED DISPATCH {currentIndex + 1}/{posts.length}</span>
              </span>

              <Link
                href={`/?cat=${encodeURIComponent(currentPost.category)}`}
                className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                {currentPost.category}
              </Link>

              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{currentPost.readTime} min read</span>
              </div>
            </div>

            {/* Post Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              <Link
                href={`/posts/${currentPost.slug}`}
                className="hover:underline decoration-2 underline-offset-4"
              >
                {currentPost.title}
              </Link>
            </h1>

            {/* Rich Summary / Description (Clean Layout: NO HASHTAGS) */}
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed line-clamp-3">
              {currentPost.summary}
            </p>
          </div>

          {/* Author byline, Slider controls & CTA */}
          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                {currentPost.authorUsername.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  @{currentPost.authorUsername}
                </span>
                <span className="mx-1.5 text-zinc-400">•</span>
                <span>{formatDate(currentPost.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Slider Arrows */}
              {posts.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous article"
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next article"
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <Link
                href={`/posts/${currentPost.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
              >
                <span>Read Dispatch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Media Column: Always displayed with image, YouTube video thumbnail, or clean editorial card */}
        <div className="w-full lg:w-[420px] shrink-0">
          <Link
            href={`/posts/${currentPost.slug}`}
            className="group relative block aspect-16/10 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-xs cursor-pointer"
            title={`Read "${currentPost.title}"`}
          >
            {activeImage ? (
              <Image
                key={activeImage}
                src={activeImage}
                alt={currentPost.title}
                fill
                priority
                unoptimized
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [currentIndex]: true }));
                }}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            ) : currentPost.videoUrl ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-900 text-zinc-400 gap-2">
                <Play className="h-10 w-10 fill-current opacity-80" />
                <span className="text-[11px] font-mono text-zinc-400">Watch Video</span>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 p-6 text-center">
                <FileText className="w-8 h-8 text-zinc-400 mb-2 opacity-60" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                  {currentPost.category}
                </span>
              </div>
            )}

            {currentPost.videoUrl && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-black/85 text-white font-mono text-[11px] font-semibold border border-white/20 backdrop-blur-xs">
                <Play className="w-3 h-3 fill-white" />
                <span>VIDEO</span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-full bg-white/90 text-black text-xs font-mono font-bold shadow-md">
                View Post →
              </span>
            </div>
          </Link>

          {/* Pagination Indicators / Dots below preview */}
          {posts.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {posts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-6 bg-black dark:bg-white"
                      : "w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
