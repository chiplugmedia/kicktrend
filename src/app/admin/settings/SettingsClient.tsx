"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  updateSiteSettingsAction,
  type SiteSettings,
} from "@/app/actions/setting-actions";
import {
  Check,
  AlertCircle,
  Save,
  Globe,
  Upload,
  Image as ImageIcon,
  Radio,
  Share2,
  Sliders,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";

// Minimal SVG icons for Socials
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface SettingsClientProps {
  initialSettings: SiteSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const router = useRouter();

  // Settings State
  const [siteName, setSiteName] = React.useState(initialSettings.siteName);
  const [siteLogo, setSiteLogo] = React.useState(initialSettings.siteLogo);
  const [siteAbout, setSiteAbout] = React.useState(initialSettings.siteAbout);
  const [adsenseApproved, setAdsenseApproved] = React.useState(initialSettings.adsenseApproved);
  const [adsenseSnippet, setAdsenseSnippet] = React.useState(initialSettings.adsenseSnippet || "");
  const [metaTitle, setMetaTitle] = React.useState(initialSettings.metaTitle);
  const [metaDescription, setMetaDescription] = React.useState(initialSettings.metaDescription);
  const [metaKeywords, setMetaKeywords] = React.useState(initialSettings.metaKeywords);
  const [ogImage, setOgImage] = React.useState(initialSettings.ogImage);
  const [siteUrl, setSiteUrl] = React.useState(initialSettings.siteUrl);
  const [twitterUrl, setTwitterUrl] = React.useState(initialSettings.twitterUrl);
  const [tiktokUrl, setTiktokUrl] = React.useState(initialSettings.tiktokUrl);
  const [instagramUrl, setInstagramUrl] = React.useState(initialSettings.instagramUrl);

  // Upload States
  const [isLogoUploading, setIsLogoUploading] = React.useState(false);
  const [isOgUploading, setIsOgUploading] = React.useState(false);

  // Form Submission
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Active Category Section Tab
  const [activeTab, setActiveTab] = React.useState<"general" | "adsense" | "seo" | "social">("general");

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSiteLogo(data.url);
      } else {
        setErrorMsg(data.error || "Failed to upload logo.");
      }
    } catch {
      setErrorMsg("Error uploading logo file to server.");
    } finally {
      setIsLogoUploading(false);
    }
  };

  // Open Graph Image file upload handler
  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOgUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOgImage(data.url);
      } else {
        setErrorMsg(data.error || "Failed to upload OG image.");
      }
    } catch {
      setErrorMsg("Error uploading OG image file to server.");
    } finally {
      setIsOgUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: SiteSettings = {
        siteName,
        siteLogo,
        siteAbout,
        adsenseApproved,
        adsenseSnippet,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage,
        siteUrl,
        twitterUrl,
        tiktokUrl,
        instagramUrl,
      };

      const res = await updateSiteSettingsAction(payload);
      if (res.success) {
        setSuccessMsg("System configuration & site settings updated successfully.");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to update settings.");
      }
    } catch {
      setErrorMsg("An unexpected network error occurred while updating settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold">
            CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Site Settings & Dynamic Configuration
          </h1>
          <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Manage global branding, AdSense monetization approval, SEO meta parameters, and external links.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Live Site</span>
        </a>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-mono flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors ${
            activeTab === "general"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Identity & Branding</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("adsense")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors ${
            activeTab === "adsense"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Google AdSense & Monetization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors ${
            activeTab === "seo"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SEO & Metadata</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors ${
            activeTab === "social"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Media Channels</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TAB 1: General Identity & Branding */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-black dark:text-white" />
                  Website Identity & Branding
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Served across all pages</span>
              </div>

              {/* Site Name Input */}
              <div className="space-y-2">
                <label
                  htmlFor="site-name-input"
                  className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Site Name / Title *
                </label>
                <input
                  id="site-name-input"
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. WANBLOG"
                  className="w-full max-w-md px-3.5 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
                <p className="text-[11px] font-mono text-zinc-400">
                  Dynamically populates the navigation bar, footer branding, emails, and page title suffixes.
                </p>
              </div>

              {/* Site Logo Upload & Live Thumbnail */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <label className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  Brand Logo Image (.png, .svg, .webp, .jpg)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* File Upload Control */}
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50">
                      <Upload className="w-6 h-6 text-zinc-400 mb-2" />
                      <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {isLogoUploading ? "Uploading logo..." : "Choose Brand Logo File"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 mt-1">
                        SVG, PNG, WebP or JPG (recommended height: 32px to 64px)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/webp,image/jpeg"
                        onChange={handleLogoUpload}
                        disabled={isLogoUploading}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-400">Or URL:</span>
                      <input
                        type="text"
                        value={siteLogo}
                        onChange={(e) => setSiteLogo(e.target.value)}
                        placeholder="https://cdn.example.com/logo.svg"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-800 dark:text-zinc-200"
                      />
                      {siteLogo && (
                        <button
                          type="button"
                          onClick={() => setSiteLogo("")}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-500"
                          title="Remove logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Thumbnail Preview */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Live Navbar Header Preview
                    </span>
                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center gap-2">
                      {siteLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={siteLogo}
                          alt="Brand Logo Preview"
                          className="h-6 w-auto max-w-[140px] object-contain"
                        />
                      ) : (
                        <span className="w-4 h-4 bg-black dark:bg-white inline-block rounded-xs" />
                      )}
                      <span className="font-mono text-base font-black tracking-tighter text-black dark:text-white">
                        {siteName || "WANBLOG"}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {siteLogo
                        ? "Custom logo active. Will replace the default square icon."
                        : "No custom logo uploaded. Default monochrome box is active."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Site About / Description */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="site-about-textarea"
                    className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    Site About / Editorial Summary
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {siteAbout.length} characters
                  </span>
                </div>
                <textarea
                  id="site-about-textarea"
                  rows={4}
                  value={siteAbout}
                  onChange={(e) => setSiteAbout(e.target.value)}
                  placeholder="Enter the official mission, story, and description of your publication..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
                <p className="text-[11px] font-mono text-zinc-400">
                  Renders dynamically in the public footer manifesto and the dedicated /about page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Google AdSense & Monetization */}
        {activeTab === "adsense" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Google AdSense Controlled Visibility
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Policy & Compliance</span>
              </div>

              {/* Master Toggle Card */}
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Enable Google AdSense / Site Approved
                    </span>
                    {adsenseApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        APPROVED & ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <ShieldAlert className="w-3 h-3 text-amber-500" />
                        PENDING APPROVAL (DISABLED)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                    Controls whether Google AdSense code and Leaderboard advertising banners are served to public readers.
                    When turned <strong>OFF</strong>, all AdSense script tags, leaderboard banners, and in-article ad containers are completely suppressed from the frontend.
                  </p>
                </div>

                {/* Animated iOS-style Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={adsenseApproved}
                  onClick={() => setAdsenseApproved(!adsenseApproved)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
                    adsenseApproved ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span className="sr-only">Toggle Google AdSense approval</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      adsenseApproved ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Google AdSense Header/Body Code Snippet */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Google AdSense Header/Body Code Snippet
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Raw HTML / &lt;script&gt; tags accepted
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  Paste the official Google AdSense verification code snippet, auto-ads tag, or custom ad script.
                  When <strong>Site Approved</strong> is enabled, this raw code is dynamically injected on the public frontend without escaping.
                </p>
                <div className="relative">
                  <textarea
                    rows={6}
                    value={adsenseSnippet}
                    onChange={(e) => setAdsenseSnippet(e.target.value)}
                    placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>'}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-y selection:bg-zinc-800"
                    spellCheck={false}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2 pointer-events-none">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {adsenseSnippet.length} characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Context Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-500">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    Leaderboard Banner Unit
                  </span>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Responsive 728x90px leaderboard placed directly below the top navigation bar.
                    State: {adsenseApproved ? "Rendering live in SiteShell" : "Completely hidden (Zero DOM footprint)"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 space-y-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    AdSense Script Optimization
                  </span>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Script payload is conditionally omitted from the root layout until this toggle is turned on, boosting Core Web Vitals (LCP/INP).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEO Management */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-black dark:text-white" />
                  Search Engine Optimization (SEO) & Social Graph
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Global metadata standards</span>
              </div>

              {/* Default Meta Title */}
              <div className="space-y-2">
                <label
                  htmlFor="meta-title-input"
                  className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Default Meta Title
                </label>
                <input
                  id="meta-title-input"
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="WANBLOG — Minimalist Engineering & Design Journal"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>

              {/* Default Meta Description */}
              <div className="space-y-2">
                <label
                  htmlFor="meta-desc-input"
                  className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Default Meta Description
                </label>
                <textarea
                  id="meta-desc-input"
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="A high-performance publication dedicated to modern software architecture..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-sans text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>

              {/* Meta Keywords & Canonical Site URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="meta-keywords-input"
                    className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    Default Meta Keywords (comma-separated)
                  </label>
                  <input
                    id="meta-keywords-input"
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="tech, engineering, architecture, nextjs"
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="site-url-input"
                    className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    Canonical Site URL
                  </label>
                  <input
                    id="site-url-input"
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://wanblog.com"
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                  />
                </div>
              </div>

              {/* Global Open Graph Image Upload */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <label className="block text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  Global Open Graph (OG) Share Image
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/50">
                      <ImageIcon className="w-6 h-6 text-zinc-400 mb-2" />
                      <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {isOgUploading ? "Uploading OG image..." : "Upload OG Banner (1200x630)"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 mt-1">
                        PNG or JPG (recommended 1200 x 630 pixels)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleOgUpload}
                        disabled={isOgUploading}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Or enter image URL: https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* OG Image Preview */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Social Preview Thumbnail
                    </span>
                    {ogImage ? (
                      <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-[1200/630] bg-zinc-100 dark:bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ogImage}
                          alt="Open Graph preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 aspect-[1200/630] flex items-center justify-center text-xs font-mono text-zinc-400">
                        No OG image specified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Social Channels */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-black dark:text-white" />
                  Official Social Channels & Outlets
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">Footer & sidebar links</span>
              </div>

              {/* Twitter / X */}
              <div className="space-y-1.5">
                <label
                  htmlFor="twitter-url-input"
                  className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <XIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>X (formerly Twitter) Account URL</span>
                </label>
                <input
                  id="twitter-url-input"
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/wanblog"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label
                  htmlFor="tiktok-url-input"
                  className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>TikTok Official Profile URL</span>
                </label>
                <input
                  id="tiktok-url-input"
                  type="url"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@wanblog"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label
                  htmlFor="instagram-url-input"
                  className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Instagram Official Account URL</span>
                </label>
                <input
                  id="instagram-url-input"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/wanblog"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs font-mono text-zinc-400">
            Changes will immediately revalidate across SSR caches and the public site.
          </p>

          <button
            type="submit"
            disabled={isSaving || isLogoUploading || isOgUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving Configuration..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
