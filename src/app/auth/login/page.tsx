"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("next") || "/";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed.");
      } else {
        router.refresh();
        window.location.href = redirectUrl;
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono font-bold mx-auto flex items-center justify-center text-lg mb-3">
          W
        </div>
        <h1 className="text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign In to WanBlog
        </h1>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
          Access comments, post likes, and editorial privileges
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Username or Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_dev or user@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-md bg-black dark:bg-white text-white dark:text-black font-mono text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 font-mono">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-black dark:text-white font-semibold underline underline-offset-4"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <React.Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 animate-pulse h-96" />
        }
      >
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
