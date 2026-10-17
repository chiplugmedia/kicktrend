import Link from "next/link";
import type { PostSummary } from "@/types";
import type { SocialLinks } from "@/app/actions/setting-actions";
import { FolderTree, Sparkles } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.76-.23 1.01.14 2.11.89 2.82.72.71 1.81.99 2.8.74.87-.2 1.58-.84 1.88-1.68.14-.38.18-.79.18-1.19.03-3.95.01-7.9.02-11.85-.01-1.49.01-2.98-.01-4.47z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export interface SiteSidebarProps {
  categoriesWithCounts: {
    id: number;
    name: string;
    slug: string;
    postCount: number;
  }[];
  latestPosts: PostSummary[];
  socialLinks: SocialLinks;
  currentPostSlug?: string;
}

export function SiteSidebar({
  categoriesWithCounts,
  latestPosts,
  socialLinks,
  currentPostSlug,
}: SiteSidebarProps) {
  // Filter out the currently viewed post if on post detail page
  const displayedPosts = currentPostSlug
    ? latestPosts.filter((p) => p.slug !== currentPostSlug)
    : latestPosts;

  return (
    <aside className="space-y-8 font-sans">
      {/* 1. Social Media Links Widget */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-4">
          <span>Connect & Follow</span>
          <span className="text-[10px] text-zinc-400 font-normal">Official Channels</span>
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {/* X / Twitter */}
          <a
            href={socialLinks.twitterUrl || "https://x.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all text-center"
            title="Follow on X"
          >
            <XIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              X
            </span>
          </a>

          {/* TikTok */}
          <a
            href={socialLinks.tiktokUrl || "https://tiktok.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all text-center"
            title="Follow on TikTok"
          >
            <TikTokIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              TikTok
            </span>
          </a>

          {/* Instagram */}
          <a
            href={socialLinks.instagramUrl || "https://instagram.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all text-center"
            title="Follow on Instagram"
          >
            <InstagramIcon className="w-5 h-5 text-zinc-800 dark:text-zinc-200 group-hover:scale-110 transition-transform mb-1.5" />
            <span className="text-[11px] font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              Instagram
            </span>
          </a>
        </div>
      </div>

      {/* 2. Categories Widget */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Categories</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-normal">
            {categoriesWithCounts.length} Active
          </span>
        </h3>

        <div className="space-y-1">
          {categoriesWithCounts.map((cat) => (
            <Link
              key={cat.id}
              href={`/?cat=${encodeURIComponent(cat.name)}`}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>{cat.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-medium">
                {cat.postCount}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Latest Blog Posts List Widget (Title, Description, Posted by @[username]) */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Latest Dispatches</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-normal">Recent</span>
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {displayedPosts.slice(0, 4).map((post) => (
            <div key={post.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
              {/* Title */}
              <Link
                href={`/posts/${post.slug}`}
                className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:underline leading-snug line-clamp-2 block"
              >
                {post.title}
              </Link>

              {/* Description */}
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 font-sans leading-relaxed">
                {post.summary}
              </p>

              {/* Posted by [username] */}
              <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 pt-0.5">
                Posted by <span className="font-semibold text-zinc-700 dark:text-zinc-300">@{post.authorUsername}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Sticky AdSense Sidebar Ad Container */}
      <div className="sticky top-24">
        <AdBanner slot="sidebar" />
      </div>
    </aside>
  );
}

// Backward-compatible alias
export const HomeSidebar = SiteSidebar;
