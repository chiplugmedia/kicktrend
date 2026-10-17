"use client";

import * as React from "react";
import Link from "next/link";
import { Hash } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  popularHashtags: string[];
  currentCategory?: string;
  currentQuery?: string;
}

export function FilterBar({
  categories,
  popularHashtags,
  currentCategory = "All",
  currentQuery = "",
}: FilterBarProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors whitespace-nowrap ${
            currentCategory === "All" && !currentQuery
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          All Topics
        </Link>
        {categories.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <Link
              key={cat}
              href={`/?cat=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Hashtag Filters */}
      {popularHashtags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center mr-1">
            <Hash className="w-3 h-3 mr-0.5" />
            Trending:
          </span>
          {popularHashtags.map((tag) => {
            const formatted = tag.startsWith("#") ? tag : `#${tag}`;
            const isSelected = currentQuery.toLowerCase() === formatted.toLowerCase();
            return (
              <Link
                key={tag}
                href={`/?q=${encodeURIComponent(formatted)}`}
                className={`font-mono text-xs px-2 py-0.5 rounded transition-colors ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {formatted}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
