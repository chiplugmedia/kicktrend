"use client";

import * as React from "react";
import {
  X,
  Check,
  Share2,
  Sparkles,
  Youtube,
  Globe,
  Code2,
  Link as LinkIcon,
} from "lucide-react";
import {
  parseSocialUrl,
  type SocialPlatform,
  type ParsedSocialData,
} from "@/lib/socialEmbedHelper";

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

interface EmbedSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (attrs: {
    url: string;
    platform: SocialPlatform;
    html: string;
    caption?: string;
  }) => void;
}

export function EmbedSocialModal({
  isOpen,
  onClose,
  onInsert,
}: EmbedSocialModalProps) {
  const [tab, setTab] = React.useState<"url" | "code">("url");
  const [urlInput, setUrlInput] = React.useState("");
  const [codeSnippet, setCodeSnippet] = React.useState("");
  const [captionInput, setCaptionInput] = React.useState("");
  const [selectedPlatform, setSelectedPlatform] = React.useState<SocialPlatform>("youtube");

  if (!isOpen) return null;

  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    const parsed = parseSocialUrl(urlInput.trim());
    onInsert({
      url: parsed.url,
      platform: parsed.platform,
      html: parsed.embedHtml,
      caption: captionInput.trim() || undefined,
    });
    onClose();
    resetForm();
  };

  const handleCodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!codeSnippet.trim()) return;

    // Detect platform from embed code snippet if possible
    let platform: SocialPlatform = "generic";
    if (codeSnippet.includes("twitter-tweet") || codeSnippet.includes("twitter.com")) {
      platform = "twitter";
    } else if (codeSnippet.includes("instagram-media") || codeSnippet.includes("instagram.com")) {
      platform = "instagram";
    } else if (codeSnippet.includes("tiktok-embed") || codeSnippet.includes("tiktok.com")) {
      platform = "tiktok";
    } else if (codeSnippet.includes("facebook.com") || codeSnippet.includes("fb-post")) {
      platform = "facebook";
    } else if (codeSnippet.includes("youtube.com") || codeSnippet.includes("youtu.be")) {
      platform = "youtube";
    }

    onInsert({
      url: urlInput.trim() || "",
      platform,
      html: codeSnippet.trim(),
      caption: captionInput.trim() || undefined,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setUrlInput("");
    setCodeSnippet("");
    setCaptionInput("");
  };

  const setExampleUrl = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setTab("url");
    switch (platform) {
      case "youtube":
        setUrlInput("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        break;
      case "twitter":
        setUrlInput("https://x.com/OpenAI/status/1790072179888619892");
        break;
      case "instagram":
        setUrlInput("https://www.instagram.com/p/C-abc123XYZ/");
        break;
      case "facebook":
        setUrlInput("https://www.facebook.com/facebook/posts/101587989345");
        break;
      case "tiktok":
        setUrlInput("https://www.tiktok.com/@tiktok/video/7106594312292453678");
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Insert Social Media Embed
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                Supports YouTube, X (Twitter), Instagram, Facebook, TikTok, & more
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

        {/* Platform Quick Badges */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-medium text-zinc-500">
            Select or Quick-Fill Platform
          </label>
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setExampleUrl("youtube")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-red-500 hover:text-red-500 transition-all text-center gap-1 group"
            >
              <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-semibold">YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => setExampleUrl("twitter")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-black dark:hover:border-white transition-all text-center gap-1 group"
            >
              <TwitterXIcon className="w-4 h-4 text-zinc-800 dark:text-zinc-200 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-semibold">X / Twitter</span>
            </button>

            <button
              type="button"
              onClick={() => setExampleUrl("instagram")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-pink-500 hover:text-pink-500 transition-all text-center gap-1 group"
            >
              <InstagramIcon className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-semibold">Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => setExampleUrl("facebook")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-blue-500 hover:text-blue-500 transition-all text-center gap-1 group"
            >
              <FacebookIcon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-semibold">Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => setExampleUrl("tiktok")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-cyan-400 hover:text-cyan-400 transition-all text-center gap-1 group"
            >
              <TikTokIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-semibold">TikTok</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-semibold transition-colors ${
              tab === "url"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Paste URL (Auto-Detect)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("code")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 font-semibold transition-colors ${
              tab === "code"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Paste Embed Snippet / Iframe</span>
          </button>
        </div>

        {/* Tab 1: URL Form */}
        {tab === "url" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-500">
                Social Media Post URL
              </label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                placeholder="https://x.com/username/status/123... or https://youtube.com/watch?v=..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-500">
                Optional Caption / Attribution
              </label>
              <input
                type="text"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                placeholder="e.g. Official announcement via X / Twitter"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Automatic responsive formatting & script hydration
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUrlSubmit()}
                  disabled={!urlInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert Embed</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Raw Embed Code */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-500">
                Raw Embed Code / Iframe / Blockquote
              </label>
              <textarea
                rows={6}
                required
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder={`<blockquote class="twitter-tweet">...</blockquote>\nor <iframe src="..."></iframe>`}
                className="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y selection:bg-zinc-800"
                spellCheck={false}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-500">
                Optional Caption
              </label>
              <input
                type="text"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCodeSubmit();
                  }
                }}
                placeholder="e.g. Video commentary clip"
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Raw markup will be sanitized and rendered responsively
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCodeSubmit()}
                  disabled={!codeSnippet.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert Embed</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
