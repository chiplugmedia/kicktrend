"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Shield,
  LogOut,
  PenSquare,
  FolderTree,
  ChevronDown,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import type { SessionPayload } from "@/lib/auth";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
      <input
        type="text"
        placeholder="Search posts, tags, #hashtags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-1.5 text-sm rounded-md bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-black transition-all"
      />
    </form>
  );
}

interface NavbarProps {
  currentUser?: SessionPayload | null;
  categories?: { id: number; name: string; slug: string }[];
  siteName?: string;
  siteLogo?: string;
}

export function Navbar({
  currentUser,
  categories = [],
  siteName = "WANBLOG",
  siteLogo,
}: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

  const defaultCategories = [
    { id: 1, name: "Engineering", slug: "engineering" },
    { id: 2, name: "Design", slug: "design" },
    { id: 3, name: "Architecture", slug: "architecture" },
    { id: 4, name: "AI", slug: "ai" },
    { id: 5, name: "Philosophy", slug: "philosophy" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCategories;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xl font-black tracking-tighter text-black dark:text-white hover:opacity-80 transition-opacity"
          >
            {siteLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={siteLogo}
                alt={siteName}
                className="h-6 w-auto max-w-[140px] object-contain rounded-xs"
              />
            ) : (
              <span className="w-4 h-4 bg-black dark:bg-white inline-block rounded-xs" />
            )}
            <span>{siteName}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Feed
            </Link>

            {/* Direct Quick Categories */}
            {activeCategories.slice(0, 2).map((cat) => (
              <Link
                key={cat.id}
                href={`/?cat=${encodeURIComponent(cat.name)}`}
                className="px-3 py-1.5 rounded-md hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {cat.name}
              </Link>
            ))}

            {/* Category Dropdown Menu */}
            <div
              className="relative"
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-expanded={isCategoryOpen}
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 mt-1 w-48 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-50 animate-in fade-in-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-900">
                    All Categories
                  </div>
                  {activeCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/?cat=${encodeURIComponent(c.name)}`}
                      onClick={() => setIsCategoryOpen(false)}
                      className="block px-3 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Search Bar wrapped in Suspense boundary */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <React.Suspense
            fallback={
              <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
            }
          >
            <SearchBar />
          </React.Suspense>
        </div>

        {/* Right Actions: Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all text-sm font-medium"
                aria-expanded={isMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono text-xs flex items-center justify-center font-bold">
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-mono text-xs">@{currentUser.username}</span>
                {currentUser.role?.toLowerCase() === "admin" && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-black text-white dark:bg-white dark:text-black rounded">
                    ADMIN
                  </span>
                )}
                {currentUser.role?.toLowerCase() === "author" && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-violet-600 text-white rounded">
                    AUTHOR
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 z-50 animate-fadeIn"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 font-mono">
                      @{currentUser.username}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Role: {currentUser.role || "user"}
                    </span>
                  </div>

                  {/* Author Navigation */}
                  {currentUser.role?.toLowerCase() === "author" && (
                    <>
                      <Link
                        href="/author/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <PenSquare className="w-4 h-4 text-violet-500" />
                        <span>Submit New Article</span>
                      </Link>
                      <Link
                        href="/author"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Shield className="w-4 h-4 text-violet-500" />
                        <span>Author Dashboard</span>
                      </Link>
                    </>
                  )}

                  {/* Admin Navigation */}
                  {currentUser.role?.toLowerCase() === "admin" && (
                    <>
                      <Link
                        href="/admin/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <PenSquare className="w-4 h-4" />
                        <span>Write Post</span>
                      </Link>
                      <Link
                        href="/admin/categories"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <FolderTree className="w-4 h-4" />
                        <span>Categories</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/author"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800"
                      >
                        <PenSquare className="w-4 h-4 text-violet-500" />
                        <span>Author Portal</span>
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
