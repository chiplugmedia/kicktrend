"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex items-center justify-center w-9 h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-zinc-100" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 text-zinc-900" />
      )}
    </button>
  );
}
