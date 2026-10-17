"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { FileText, ExternalLink, Trash2, ArrowUpRight, User } from "lucide-react";
import { formatCoverImageUrl } from "@/lib/imageHelper";

export function EmbeddedPostCardView({
  node,
  deleteNode,
  selected,
}: NodeViewProps) {
  const { slug, title, summary, coverImage, author, category, date } = node.attrs;
  const displayCover = formatCoverImageUrl(coverImage);

  return (
    <NodeViewWrapper className="my-6">
      <div
        className={`relative rounded-2xl border transition-all overflow-hidden ${
          selected
            ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
        } bg-zinc-50/70 dark:bg-zinc-900/50 shadow-xs`}
      >
        {/* Editor Controls Overlay */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-full bg-black/80 dark:bg-white/80 text-white dark:text-black font-mono text-[9px] font-bold uppercase tracking-widest backdrop-blur-xs">
            EMBEDDED DISPATCH
          </span>
          <button
            type="button"
            onClick={deleteNode}
            className="p-1 rounded-full bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Remove Embedded Post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Post Card Layout */}
        <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
          {displayCover && (
            <div className="relative w-full sm:w-44 h-32 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayCover}
                alt={title || "Embedded article"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              {category && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold uppercase">
                  {category}
                </span>
              )}
              {date && <span>• {date}</span>}
              {author && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <User className="w-2.5 h-2.5" />
                  @{author}
                </span>
              )}
            </div>

            <h4 className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
              {title || "Untitled Article"}
            </h4>

            {summary && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                {summary}
              </p>
            )}

            <div className="pt-1 flex items-center gap-1 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
              <span>Read article: /posts/{slug}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
