"use client";

import * as React from "react";
import { Search, X, Check, FileText, ArrowRight, User, Loader2, Link2 } from "lucide-react";
import type { EmbeddedPostCardAttrs } from "./EmbeddedPostCard";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string | null;
  category: string;
  authorUsername: string;
  createdAt: string;
}

interface EmbedPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (attrs: EmbeddedPostCardAttrs) => void;
}

export function EmbedPostModal({ isOpen, onClose, onInsert }: EmbedPostModalProps) {
  const [tab, setTab] = React.useState<"select" | "url">("select");
  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // URL mode state
  const [customUrl, setCustomUrl] = React.useState<string>("");
  const [customTitle, setCustomTitle] = React.useState<string>("");
  const [customSummary, setCustomSummary] = React.useState<string>("");

  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/articles?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setArticles(data.articles || []);
        }
      })
      .catch((err) => console.error("Error fetching articles:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const handleSelectArticle = (article: ArticleItem) => {
    onInsert({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      coverImage: article.coverImage || "",
      author: article.authorUsername,
      category: article.category,
      date: new Date(article.createdAt).toLocaleDateString(),
    });
    onClose();
  };

  const handleInsertFromUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUrl.trim()) return;

    // Extract slug from URL if pasted full path e.g. /posts/my-slug or https://.../posts/my-slug
    const cleanSlug = customUrl
      .trim()
      .replace(/^https?:\/\/[^/]+\/posts\//, "")
      .replace(/^\/posts\//, "")
      .replace(/\/$/, "");

    onInsert({
      slug: cleanSlug,
      title: customTitle.trim() || `Article: ${cleanSlug}`,
      summary: customSummary.trim() || undefined,
      category: "Dispatch",
      author: "WANBLOG",
      date: new Date().toLocaleDateString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Embed Post / Internal Article Card
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                Insert a rich preview card with thumbnail, title, excerpt, and author
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab("select")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              tab === "select"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Select Published Article
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              tab === "url"
                ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Enter Custom Post URL
          </button>
        </div>

        {/* Tab 1: Select Published Article */}
        {tab === "select" && (
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <div className="relative shrink-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, slug, or summary..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[260px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400 font-mono text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading published articles...</span>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 font-mono text-xs">
                  No articles found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleSelectArticle(article)}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-all flex items-start gap-3 group"
                  >
                    {article.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-16 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold uppercase">
                          {article.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          @{article.authorUsername}
                        </span>
                      </div>
                      <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-black dark:group-hover:text-white">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-sans line-clamp-1">
                        {article.summary}
                      </p>
                    </div>
                    <span className="self-center p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-black dark:bg-white text-white dark:text-black transition-opacity">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Post URL */}
        {tab === "url" && (
          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                Post URL or Slug *
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleInsertFromUrl();
                    }
                  }}
                  placeholder="/posts/architecture-of-extreme-simplicity"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                Card Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInsertFromUrl();
                  }
                }}
                placeholder="The Architecture of Extreme Simplicity"
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                Card Summary / Excerpt (Optional)
              </label>
              <textarea
                rows={3}
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                placeholder="A deep dive into high-efficiency minimalist web architectures."
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInsertFromUrl()}
                disabled={!customUrl.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Post Card</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
