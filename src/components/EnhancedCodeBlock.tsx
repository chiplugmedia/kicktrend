"use client";

import * as React from "react";
import hljs from "highlight.js";
import { Check, Copy, Terminal } from "lucide-react";

interface EnhancedCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function EnhancedCodeBlock({
  code,
  language,
  filename,
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const cleanLanguage = (language || "").replace(/^language-/, "").toLowerCase();

  const highlighted = React.useMemo(() => {
    try {
      if (cleanLanguage && hljs.getLanguage(cleanLanguage)) {
        return hljs.highlight(code, { language: cleanLanguage }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, cleanLanguage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="enhanced-code-block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden my-6 shadow-md">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>

          <div className="h-3 w-px bg-zinc-700 mx-1" />

          <span className="text-[11px] font-medium text-zinc-400">
            {filename || (cleanLanguage ? cleanLanguage.toUpperCase() : "CODE")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cleanLanguage && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {cleanLanguage}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed selection:bg-zinc-800 m-0 bg-transparent border-0">
        <code
          dangerouslySetInnerHTML={{ __html: highlighted }}
          className="hljs"
        />
      </pre>
    </div>
  );
}
