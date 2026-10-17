"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Trash2, ExternalLink, Share2, Youtube, Video, Eye, Globe } from "lucide-react";
import { hydrateSocialWidgets, type SocialPlatform } from "@/lib/socialEmbedHelper";

function TwitterXIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.779 0-1.848.337-1.848 1.95v2.03h4.379l-.578 3.667h-3.801v7.98c4.32-.98 7.551-4.85 7.551-9.479 0-5.362-4.348-9.71-9.71-9.71s-9.71 4.348-9.71 9.71c0 4.629 3.231 8.499 7.551 9.479z" />
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

export function SocialEmbedView({
  node,
  deleteNode,
  selected,
}: NodeViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const platform = (node.attrs.platform as SocialPlatform) || "generic";
  const url = (node.attrs.url as string) || "";
  const html = (node.attrs.html as string) || "";
  const caption = (node.attrs.caption as string) || "";

  React.useEffect(() => {
    if (containerRef.current) {
      hydrateSocialWidgets(containerRef.current);
    }
  }, [html, platform]);

  const platformMeta = {
    youtube: {
      name: "YouTube",
      icon: <Youtube className="w-3.5 h-3.5 text-red-500" />,
      badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
    twitter: {
      name: "X (Twitter)",
      icon: <TwitterXIcon className="w-3.5 h-3.5" />,
      badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
    },
    instagram: {
      name: "Instagram",
      icon: <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />,
      badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    },
    facebook: {
      name: "Facebook",
      icon: <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />,
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    tiktok: {
      name: "TikTok",
      icon: <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />,
      badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    },
    spotify: {
      name: "Spotify",
      icon: <Share2 className="w-3.5 h-3.5 text-green-500" />,
      badge: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    },
    generic: {
      name: "Social Embed",
      icon: <Globe className="w-3.5 h-3.5" />,
      badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    },
  }[platform] || {
    name: "Social Embed",
    icon: <Globe className="w-3.5 h-3.5" />,
    badge: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  };

  return (
    <NodeViewWrapper className="my-6">
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${
          selected
            ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
            : "border-zinc-300 dark:border-zinc-800"
        } bg-white dark:bg-zinc-950 shadow-sm`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-black dark:bg-white text-white dark:text-black">
              {platformMeta.icon}
            </span>
            <span className="font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              {platformMeta.name} Embed
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${platformMeta.badge}`}
            >
              LIVE EMBED
            </span>
          </div>

          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                title="Open Source Link"
              >
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}

            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Remove Social Embed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 sm:p-6" ref={containerRef}>
          {html ? (
            <div
              className="social-embed-preview overflow-hidden"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="text-center py-6 text-zinc-400 font-mono text-xs">
              No embed markup provided for this {platformMeta.name} post.
            </div>
          )}

          {caption && (
            <p className="mt-3 text-center text-xs font-mono text-zinc-500 italic">
              {caption}
            </p>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
