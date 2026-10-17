"use client";

import * as React from "react";
import { Code, X, Check, Terminal, Sparkles } from "lucide-react";

interface EmbedHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
}

export function EmbedHtmlModal({ isOpen, onClose, onInsert }: EmbedHtmlModalProps) {
  const [htmlCode, setHtmlCode] = React.useState("<p>dej494</p>");

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!htmlCode.trim()) return;
    onInsert(htmlCode);
    onClose();
  };

  const setSnippet = (snippet: string) => {
    setHtmlCode(snippet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
              <Code className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Insert Raw HTML / Custom Code
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                Renders as actual, parsed HTML elements on the frontend (e.g. &lt;p&gt;dej494&lt;/p&gt;)
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

        {/* Modal Body */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>HTML Markup Code</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSnippet("<p>dej494</p>")}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  &lt;p&gt; Paragraph
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSnippet(
                      '<div class="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-mono">\n  <strong>Interactive Box</strong>\n  <p>Custom HTML with Tailwind classes</p>\n</div>'
                    )
                  }
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Styled Card
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSnippet(
                      '<iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allowfullscreen class="rounded-xl"></iframe>'
                    )
                  }
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  &lt;iframe&gt;
                </button>
              </div>
            </div>
            <textarea
              rows={7}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="<p>Enter raw HTML here</p>"
              className="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y selection:bg-zinc-800"
              spellCheck={false}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Live preview available inside the editor
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
                onClick={() => handleSubmit()}
                disabled={!htmlCode.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Embed</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
