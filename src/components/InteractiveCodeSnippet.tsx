"use client";

import * as React from "react";
import hljs from "highlight.js";
import { Play, Terminal, Check, Copy, Code2, Sparkles } from "lucide-react";

interface InteractiveCodeSnippetProps {
  title?: string;
  language?: string;
  mode?: "executable" | "code-block";
  code?: string;
  html?: string;
  css?: string;
  js?: string;
}

export function InteractiveCodeSnippet({
  title = "Custom Code Snippet",
  language = "javascript",
  mode = "executable",
  code = "",
  html = "",
  css = "",
  js = "",
}: InteractiveCodeSnippetProps) {
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
                  padding: 1.25rem;
                  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
    let textToCopy = "";
    if (mode === "executable") {
      if (activeTab === "html") textToCopy = html;
      else if (activeTab === "css") textToCopy = css;
      else if (activeTab === "js") textToCopy = js;
      else textToCopy = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${js}`;
    } else {
      textToCopy = code;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = React.useMemo(() => {
    if (!html) return "";
    try {
      return hljs.highlight(html, { language: "html" }).value;
    } catch {
      return html;
    }
  }, [html]);

  const highlightedCss = React.useMemo(() => {
    if (!css) return "";
    try {
      return hljs.highlight(css, { language: "css" }).value;
    } catch {
      return css;
    }
  }, [css]);

  const highlightedJs = React.useMemo(() => {
    if (!js) return "";
    try {
      return hljs.highlight(js, { language: "javascript" }).value;
    } catch {
      return js;
    }
  }, [js]);

  const highlightedCode = React.useMemo(() => {
    if (!code) return "";
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, language]);

  return (
    <div className="interactive-code-snippet rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm my-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs gap-2">
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

        <div className="flex items-center gap-2">
          {/* Tabs for Executable Snippet */}
          {mode === "executable" && (
            <div className="flex items-center rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Live Preview
              </button>
              {html && (
                <button
                  type="button"
                  onClick={() => setActiveTab("html")}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
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
                  className={`px-2 py-1 rounded font-medium transition-colors ${
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
                  className={`px-2 py-1 rounded font-medium transition-colors ${
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Copy snippet code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied!</span>
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

      {/* Content Area */}
      {mode === "executable" ? (
        <div>
          {activeTab === "preview" && (
            <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/40 min-h-[180px] flex flex-col justify-center">
              <iframe
                ref={iframeRef}
                title={title}
                className="w-full min-h-[160px] border-0 rounded-xl bg-white dark:bg-zinc-950 shadow-inner"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {activeTab === "html" && (
            <pre className="p-4 sm:p-5 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
              <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedHtml || html }}
              />
            </pre>
          )}

          {activeTab === "css" && (
            <pre className="p-4 sm:p-5 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
              <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedCss || css }}
              />
            </pre>
          )}

          {activeTab === "js" && (
            <pre className="p-4 sm:p-5 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto m-0 leading-relaxed">
              <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedJs || js }}
              />
            </pre>
          )}
        </div>
      ) : (
        <pre className="p-4 sm:p-5 bg-zinc-950 text-zinc-100 font-mono text-xs sm:text-sm overflow-x-auto m-0 leading-relaxed selection:bg-zinc-800">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedCode || code }}
          />
        </pre>
      )}
    </div>
  );
}
