"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionPayload } from "@/lib/auth";
import {
  LayoutDashboard,
  FilePlus,
  FolderTree,
  Users,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Radio,
  Settings,
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  currentUser: SessionPayload;
}

export function AdminLayoutClient({
  children,
  currentUser,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop sidebar collapse state
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Mobile / tablet drawer open state
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "New Dispatch",
      href: "/admin/new",
      icon: FilePlus,
      exact: true,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      exact: false,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      exact: false,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: true,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      window.location.href = "/";
    }
  };

  const isActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close navigation drawer"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setIsMobileOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer transition-opacity"
        />
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 w-full h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden text-zinc-700 dark:text-zinc-300"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Admin Logo & Badge */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="w-4 h-4 bg-black dark:bg-white inline-block rounded-xs" />
            <span className="font-mono font-black tracking-tight text-base text-zinc-900 dark:text-zinc-100">
              CHI
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-white dark:text-black">
              ADMIN
            </span>
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 ml-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <Link
            href="/admin/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Post</span>
          </Link>

          <ThemeToggle />

          <div className="h-5 w-px bg-zinc-200 dark:border-zinc-800" />

          {/* User profile dropdown / info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-mono font-bold text-xs">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">
              @{currentUser.username}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-red-500 transition-colors"
            title="Sign out of admin"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out shrink-0 ${
            isCollapsed ? "w-18" : "w-64"
          }`}
        >
          <div className="p-4 flex-1 space-y-1.5">
            <div className={`px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 ${isCollapsed ? "text-center" : ""}`}>
              {isCollapsed ? "NAV" : "NAVIGATION"}
            </div>

            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-xs font-semibold transition-colors ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                  title={item.title}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className={`px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 ${isCollapsed ? "text-center" : ""}`}>
                {isCollapsed ? "EXT" : "QUICK ACCESS"}
              </div>

              <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors ${
                  isCollapsed ? "justify-center px-2" : ""
                }`}
                title="View Public Blog"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>View Public Blog</span>}
              </Link>
            </div>
          </div>

          {/* Desktop Sidebar Footer */}
          <div className={`p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 ${isCollapsed ? "text-center" : ""}`}>
            {isCollapsed ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" title="System Online" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-[11px] truncate">Admin Console Live</span>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile / Tablet Drawer (Slide-Over) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="h-16 px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 bg-black dark:bg-white inline-block" />
              <span className="font-mono font-bold text-sm">WANBLOG ADMIN</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              NAVIGATION
            </div>

            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-md font-mono text-sm font-semibold transition-colors ${
                    active
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                SHORTCUTS
              </div>
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-md font-mono text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Visit Public Site</span>
              </Link>
            </div>
          </div>

          {/* Drawer User Bar */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono font-bold text-xs">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-mono font-bold">@{currentUser.username}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">{currentUser.role}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Dedicated Admin Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-4 px-6 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>WANBLOG Administration Console</span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-400">MySQL Database Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>Role: {currentUser.role}</span>
            </span>
            <span>© {new Date().getFullYear()} WanBlog Editorial</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
