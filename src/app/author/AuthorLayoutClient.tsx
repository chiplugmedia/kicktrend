"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  FileText,
  PenSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Settings,
  ArrowUpRight,
  Shield,
  LogOut,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionPayload } from "@/lib/auth";

export interface AuthorStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface AuthorLayoutClientProps {
  currentUser: SessionPayload;
  stats?: AuthorStats;
  children: React.ReactNode;
}

export function AuthorLayoutClient({
  currentUser,
  stats = { total: 0, approved: 0, pending: 0, rejected: 0 },
  children,
}: AuthorLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Sliding Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Close drawer on route change
  React.useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Handle Escape key to close drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  // Prevent background scroll when drawer is open
  React.useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Compute current route label for header breadcrumb
  const getCurrentLocationName = () => {
    if (pathname === "/author") return "My Submissions";
    if (pathname === "/author/new") return "Submit New Article";
    if (pathname?.startsWith("/author/posts/")) return "Revise Article";
    if (pathname === "/author/settings") return "Author Profile & Settings";
    return "Author Workspace";
  };

  const isAdminOrManager =
    currentUser.role?.toLowerCase() === "admin" ||
    currentUser.role?.toLowerCase() === "manager";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* =========================================================================
          1. DEDICATED AUTHOR HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Drawer Trigger + Brand Logo + Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sliding Drawer Trigger (Hamburger) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Drawer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Author Portal Logo */}
            <Link
              href="/author"
              className="flex items-center gap-2 font-mono text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 group"
            >
              <span className="w-3 h-3 bg-violet-600 rounded-xs inline-block group-hover:scale-110 transition-transform" />
              <span>WANBLOG</span>
            </Link>

            {/* Author Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              <Sparkles className="w-2.5 h-2.5 text-violet-500" />
              <span>AUTHOR STUDIO</span>
            </span>

            {/* Breadcrumb Separator */}
            <span className="text-zinc-300 dark:text-zinc-700 hidden md:inline">/</span>

            {/* Current Route Breadcrumb */}
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium hidden md:inline">
              {getCurrentLocationName()}
            </span>
          </div>

          {/* Right: Quick CTA Buttons, Site Link, Theme Toggle & Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compose Article CTA Button */}
            <Link
              href="/author/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
              <span className="sm:hidden">Post</span>
            </Link>

            {/* Public Feed External Link */}
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-mono text-xs hover:border-black dark:hover:border-white transition-colors"
            >
              <span>Public Feed</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Optional Admin Console Switcher */}
            {isAdminOrManager && (
              <Link
                href="/admin"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
                title="Switch to Admin Control Center"
              >
                <Shield className="w-3.5 h-3.5 text-zinc-500" />
                <span>Admin</span>
              </Link>
            )}

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Author Profile Pill & Drawer Opener */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-mono"
              title="Open Author Profile & Drawer"
            >
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 shadow-2xs">
                {currentUser.username.slice(0, 1).toUpperCase()}
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 hidden sm:inline max-w-[100px] truncate">
                @{currentUser.username}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. COLLAPSIBLE SLIDE-OUT DRAWER / SIDEBAR (Sliding Drawer)
          ========================================================================= */}
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Author Navigation Drawer"
      >
        {/* Top Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Drawer Top Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-violet-600 rounded-xs inline-block" />
              <span className="font-mono font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                WANBLOG STUDIO
              </span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Close Navigation Drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Author Profile Card */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-700 to-purple-500 text-white font-mono text-lg flex items-center justify-center font-bold shadow-md shrink-0">
                {currentUser.username.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    @{currentUser.username}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-violet-600 text-white shrink-0">
                    AUTHOR
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                    Writer Account Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar inside Drawer */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center font-mono text-xs">
              <Link
                href="/author"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 transition-colors"
              >
                <div className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {stats.total}
                </div>
                <div className="text-[10px] text-zinc-400">Total</div>
              </Link>

              <Link
                href="/author?tab=pending"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-500 transition-colors"
              >
                <div className="text-base font-black text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </div>
                <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Pending</div>
              </Link>

              <Link
                href="/author?tab=approved"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-500 transition-colors"
              >
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {stats.approved}
                </div>
                <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Approved</div>
              </Link>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-4 space-y-6">
            {/* Section 1: Content Management */}
            <div>
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                Editorial Pipeline
              </div>
              <div className="space-y-1">
                {/* My Submissions / Posts */}
                <Link
                  href="/author"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-colors ${
                    pathname === "/author"
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-violet-500" />
                    <span>My Posts / Submissions</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold">
                    {stats.total}
                  </span>
                </Link>

                {/* Create New Post */}
                <Link
                  href="/author/new"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-colors ${
                    pathname === "/author/new"
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PenSquare className="w-4 h-4 text-violet-500" />
                    <span>Create New Post</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-violet-600 text-white">
                    + Compose
                  </span>
                </Link>

                {/* Review Queue (Pending) */}
                <Link
                  href="/author?tab=pending"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Review Queue (Pending)</span>
                  </div>
                  {stats.pending > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                      {stats.pending}
                    </span>
                  )}
                </Link>

                {/* Published & Live */}
                <Link
                  href="/author?tab=approved"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Approved & Live</span>
                  </div>
                  {stats.approved > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {stats.approved}
                    </span>
                  )}
                </Link>

                {/* Needs Revision (Rejected) */}
                <Link
                  href="/author?tab=rejected"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs text-zinc-700 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Needs Revision</span>
                  </div>
                  {stats.rejected > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                      {stats.rejected}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Section 2: Account & Settings */}
            <div>
              <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                Account & Preferences
              </div>
              <div className="space-y-1">
                {/* Profile Settings */}
                <Link
                  href="/author/settings"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-colors ${
                    pathname === "/author/settings"
                      ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Profile & Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                {/* Public Journal Feed */}
                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    <span>Visit Public Journal</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Live</span>
                </Link>
              </div>
            </div>

            {/* Section 3: Admin Switcher (If Admin/Manager) */}
            {isAdminOrManager && (
              <div>
                <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                  Management
                </div>
                <Link
                  href="/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs bg-zinc-100 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    <span>Admin Control Center</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Drawer Bottom Bar: Guidelines Note + Theme + Logout */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-3">
          {/* Review Notice */}
          <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <span className="font-bold text-violet-600 dark:text-violet-400">Workflow Note:</span> All submitted articles undergo editorial verification before going live.
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-mono text-zinc-500">Theme</span>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 text-red-600 dark:text-red-400 font-mono text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (@{currentUser.username})</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          3. MAIN AUTHOR CONTENT AREA
          ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* =========================================================================
          4. DEDICATED AUTHOR FOOTER
          ========================================================================= */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-xs font-mono text-zinc-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Identity & Mission */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-violet-600 rounded-xs inline-block" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  WANBLOG Editorial Studio
                </span>
                <span className="text-zinc-400">&mdash; Author Workspace</span>
              </div>
              <p className="text-[11px] text-zinc-500 max-w-lg leading-relaxed">
                Staging environment for articles, visual assets, and technical essays. Posts remain private until reviewed and approved by administrators.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <Link
                href="/author"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Submissions
              </Link>
              <Link
                href="/author/new"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Compose Post
              </Link>
              <Link
                href="/author/settings"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Profile Settings
              </Link>
              <Link
                href="/"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Public Feed
              </Link>
              <Link
                href="/privacy"
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Copyright & Pipeline Status Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} WANBLOG. All editorial rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Review Pipeline Online &middot; Next.js 15 App Router</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
