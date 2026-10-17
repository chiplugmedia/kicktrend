"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Code2, Play, Terminal, Trash2, Eye, Check, Copy } from "lucide-react";

export function CodeSnippetView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const title = (node.attrs.title as string) || "Code Snippet";
  const language = (node.attrs.language as string) || "javascript";
  const mode = (node.attrs.mode as "executable" | "code-block") || "executable";
  const code = (node.attrs.code as string) || "";
  const html = (node.attrs.html as string) || "";
  const css = (node.attrs.css as string) || "";
  const js = (node.attrs.js as string) || "";

  const [activeTab, setActiveTab] = React.useState<"preview" | "code" | "html" | "css" | "js">(
    mode === "executable" ? "preview" : "code"
  );
  const [copied, setCopied] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Render executable sandbox in an isolated iframe for safe live execution
  React.useEffect(() => {
    if (mode === "executable" && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 1rem;
                  font-family: system-ui, -apple-system, sans-serif;
                  color: #18181b;
                  background-color: transparent;
                }
                @media (prefers-color-scheme: dark) {
                  body { color: #f4f4f5; }
                }
                ${css}
              </style>
            </head>
            <body>
              ${html}
              <script>
                try {
                  ${js}
                } catch (e) {
                  console.error("Sandbox execution error:", e);
                }
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [html, css, js, mode, activeTab]);

  const handleCopy = () => {
    const textToCopy =
      mode === "executable"
        ? `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${js}`
        : code;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="my-6">
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${
          selected
            ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
            : "border-zinc-300 dark:border-zinc-800"
        } bg-white dark:bg-zinc-950 shadow-sm`}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-black dark:bg-white text-white dark:text-black">
              {mode === "executable" ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Terminal className="w-3.5 h-3.5" />
              )}
            </span>
            <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
              {mode === "executable" ? "Interactive Demo" : language}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tab switchers if executable */}
            {mode === "executable" && (
              <div className="flex items-center rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    activeTab === "preview"
                      ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Preview
                </button>
                {html && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("html")}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      activeTab === "html"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    HTML
                  </button>
                )}
                {css && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("css")}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      activeTab === "css"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    CSS
                  </button>
                )}
                {js && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("js")}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      activeTab === "js"
                        ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    JS
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Copy Snippet Code"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Remove Code Snippet"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {mode === "executable" ? (
          <div>
            {activeTab === "preview" && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 min-h-[160px] flex flex-col justify-center">
                <iframe
                  ref={iframeRef}
                  title={title}
                  className="w-full min-h-[140px] border-0 rounded-lg bg-white dark:bg-zinc-950 shadow-inner"
                  sandbox="allow-scripts"
                />
              </div>
            )}

            {activeTab === "html" && (
              <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
                <code>{html}</code>
              </pre>
            )}

            {activeTab === "css" && (
              <pre className="p-4 bg-zinc-950 text-cyan-400 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
                <code>{css}</code>
              </pre>
            )}

            {activeTab === "js" && (
              <pre className="p-4 bg-zinc-950 text-amber-300 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
                <code>{js}</code>
              </pre>
            )}
          </div>
        ) : (
          <div className="bg-zinc-950 p-4 overflow-x-auto">
            <pre className="text-zinc-100 font-mono text-xs leading-relaxed m-0">
              <code>{code || "// Empty code block"}</code>
            </pre>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
