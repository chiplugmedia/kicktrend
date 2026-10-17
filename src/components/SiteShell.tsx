"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "./Navbar";
import { AdBanner } from "./AdBanner";
import type { SessionPayload } from "@/lib/auth";
import type { SiteSettings } from "@/app/actions/setting-actions";

interface SiteShellProps {
  children: React.ReactNode;
  currentUser?: SessionPayload | null;
  categories?: { id: number; name: string; slug: string }[];
  settings?: SiteSettings;
}

export function SiteShell({
  children,
  currentUser,
  categories = [],
  settings,
}: SiteShellProps) {
  const pathname = usePathname();
  const isDedicatedPortal =
    pathname?.startsWith("/admin") || pathname?.startsWith("/author");

  // Admin and Author portals have their own dedicated layouts, headers, and footers
  if (isDedicatedPortal) {
    return <>{children}</>;
  }

  const defaultCategories = [
    { id: 1, name: "Engineering", slug: "engineering" },
    { id: 2, name: "Design", slug: "design" },
    { id: 3, name: "Architecture", slug: "architecture" },
    { id: 4, name: "AI", slug: "ai" },
    { id: 5, name: "Philosophy", slug: "philosophy" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCategories;
  const siteName = settings?.siteName || "WANBLOG";
  const siteAbout = settings?.siteAbout || "An unfiltered engineering journal and design essay collection dedicated to modern software architecture, high-density aesthetics, and crisp typography.";
  const isAdApproved = settings?.adsenseApproved ?? false;

  return (
    <>
      <Suspense fallback={<div className="h-16 w-full border-b border-zinc-200 dark:border-zinc-800" />}>
        <Navbar
          currentUser={currentUser}
          categories={activeCategories}
          siteName={siteName}
          siteLogo={settings?.siteLogo}
        />
      </Suspense>

      {/* Top Leaderboard AdSense Banner Slot - Conditionally rendered only if approved */}
      {isAdApproved && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-2">
          <AdBanner slot="leaderboard" isApproved={isAdApproved} />
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Enhanced Public Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50 dark:bg-black text-xs font-mono text-zinc-500 dark:text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand & Manifesto */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                {settings?.siteLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.siteLogo}
                    alt={siteName}
                    className="h-5 w-auto object-contain rounded-xs"
                  />
                ) : (
                  <span className="w-2.5 h-2.5 bg-black dark:bg-white inline-block rounded-xs" />
                )}
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  {siteName}
                </span>
                <span>— Monochrome Publication</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans max-w-sm leading-relaxed">
                {siteAbout}
              </p>
            </div>

            {/* Column 2: Top Categories */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Top Categories
              </h4>
              <ul className="space-y-2">
                {activeCategories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/?cat=${encodeURIComponent(cat.name)}`}
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Useful Links */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Useful Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} WanBlog. All rights reserved.</p>
            <p className="text-zinc-400">Minimalist Black & White System • Next.js & Prisma</p>
          </div>
        </div>
      </footer>
    </>
  );
}
