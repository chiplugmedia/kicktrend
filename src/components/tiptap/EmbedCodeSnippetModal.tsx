"use client";

import * as React from "react";
import {
  X,
  Check,
  Code2,
  Play,
  Terminal,
  FileCode,
  Sparkles,
} from "lucide-react";
import type { CodeSnippetAttrs } from "./CodeSnippetEmbed";

interface EmbedCodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (attrs: CodeSnippetAttrs) => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript (JS)" },
  { value: "typescript", label: "TypeScript (TS)" },
  { value: "html", label: "HTML / XML" },
  { value: "css", label: "CSS / Tailwind" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash / Shell" },
  { value: "json", label: "JSON" },
  { value: "php", label: "PHP" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
];

export function EmbedCodeSnippetModal({
  isOpen,
  onClose,
  onInsert,
}: EmbedCodeSnippetModalProps) {
  const [mode, setMode] = React.useState<"executable" | "code-block">("executable");

  // Executable interactive state
  const [title, setTitle] = React.useState("Interactive Component");
  const [htmlCode, setHtmlCode] = React.useState(
    `<button id="clickBtn" class="action-btn">Click Me (Count: 0)</button>`
  );
  const [cssCode, setCssCode] = React.useState(
    `.action-btn {\n  padding: 10px 18px;\n  border-radius: 8px;\n  background: #09090b;\n  color: #fff;\n  border: 1px solid #27272a;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.action-btn:hover {\n  background: #27272a;\n  transform: translateY(-1px);\n}`
  );
  const [jsCode, setJsCode] = React.useState(
    `let count = 0;\nconst btn = document.getElementById("clickBtn");\nbtn.addEventListener("click", () => {\n  count++;\n  btn.textContent = \`Click Me (Count: \${count})\`;\n});`
  );

  // Pure Code Block state
  const [codeLanguage, setCodeLanguage] = React.useState("javascript");
  const [codeBlockTitle, setCodeBlockTitle] = React.useState("example.js");
  const [rawCode, setRawCode] = React.useState(
    `function calculateVelocity(distance, time) {\n  if (time <= 0) throw new Error("Time must be positive");\n  return distance / time;\n}\n\nconsole.log(calculateVelocity(100, 9.58));`
  );

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (mode === "executable") {
      onInsert({
        mode: "executable",
        title: title.trim() || "Interactive Code Snippet",
        html: htmlCode,
        css: cssCode,
        js: jsCode,
      });
    } else {
      onInsert({
        mode: "code-block",
        title: codeBlockTitle.trim() || "Code Snippet",
        language: codeLanguage,
        code: rawCode,
      });
    }

    onClose();
  };

  const loadPreset = (preset: "counter" | "alert" | "timer") => {
    setMode("executable");
    if (preset === "counter") {
      setTitle("Interactive Counter");
      setHtmlCode(`<button id="clickBtn" class="action-btn">Click Me (Count: 0)</button>`);
      setCssCode(
        `.action-btn {\n  padding: 10px 18px;\n  border-radius: 8px;\n  background: #09090b;\n  color: #fff;\n  border: 1px solid #27272a;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.action-btn:hover {\n  background: #27272a;\n}`
      );
      setJsCode(
        `let count = 0;\nconst btn = document.getElementById("clickBtn");\nbtn.addEventListener("click", () => {\n  count++;\n  btn.textContent = \`Click Me (Count: \${count})\`;\n});`
      );
    } else if (preset === "alert") {
      setTitle("Custom Glass Card");
      setHtmlCode(
        `<div class="glass-card">\n  <h4>✨ Live Glassmorphic Alert</h4>\n  <p>Rendered dynamically with custom CSS inside your post.</p>\n</div>`
      );
      setCssCode(
        `.glass-card {\n  padding: 16px 20px;\n  border-radius: 12px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  backdrop-filter: blur(10px);\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);\n}\n.glass-card h4 { margin: 0 0 6px 0; font-size: 15px; font-weight: 700; }\n.glass-card p { margin: 0; font-size: 13px; opacity: 0.8; }`
      );
      setJsCode(``);
    } else if (preset === "timer") {
      setTitle("Live Digital Clock");
      setHtmlCode(`<div id="clockDisplay" class="clock-badge">00:00:00</div>`);
      setCssCode(
        `.clock-badge {\n  font-family: monospace;\n  font-size: 24px;\n  font-weight: 800;\n  padding: 12px 24px;\n  background: #09090b;\n  color: #10b981;\n  border: 1px solid #059669;\n  border-radius: 8px;\n  display: inline-block;\n}`
      );
      setJsCode(
        `function tick() {\n  const now = new Date();\n  document.getElementById("clockDisplay").textContent = now.toLocaleTimeString();\n}\ntick();\nsetInterval(tick, 1000);`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black">
              <Code2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Insert Custom Code Snippet
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans">
                Interactive live executable sandbox or syntax-highlighted code block
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

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("executable")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              mode === "executable"
                ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black dark:ring-white"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
            }`}
          >
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Interactive Demo (HTML+CSS+JS)
              </h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                Executes live in readers' browser with toggleable preview & source code tabs.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode("code-block")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              mode === "code-block"
                ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black dark:ring-white"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
            }`}
          >
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Terminal className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Highlighted Code Block
              </h4>
              <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                Syntax-highlighted code block with language badge & one-click copy button.
              </p>
            </div>
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {mode === "executable" ? (
            /* Executable (HTML + CSS + JS) */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-mono text-zinc-500">
                    Snippet Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Interactive Button Counter"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="space-y-1 sm:text-right">
                  <label className="text-[11px] font-mono text-zinc-500">
                    Load Quick Template
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => loadPreset("counter")}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300"
                    >
                      Counter
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("alert")}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300"
                    >
                      Glass Card
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPreset("timer")}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono text-[10px] text-zinc-700 dark:text-zinc-300"
                    >
                      Clock
                    </button>
                  </div>
                </div>
              </div>

              {/* HTML Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-emerald-500 flex items-center justify-between">
                  <span>HTML Markup</span>
                  <span className="text-[10px] font-normal text-zinc-400">Required</span>
                </label>
                <textarea
                  rows={3}
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<div>Interactive HTML here</div>"
                  className="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* CSS Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                  <span>CSS Stylesheet</span>
                  <span className="text-[10px] font-normal text-zinc-400">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  placeholder=".my-class { background: #000; color: #fff; }"
                  className="w-full bg-zinc-950 text-cyan-400 font-mono text-xs p-3 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* JS Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-300 flex items-center justify-between">
                  <span>JavaScript Execution</span>
                  <span className="text-[10px] font-normal text-zinc-400">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  placeholder="console.log('Runs automatically in sandbox');"
                  className="w-full bg-zinc-950 text-amber-300 font-mono text-xs p-3 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            /* Syntax Highlighted Code Block */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-500">
                    File Label / Title
                  </label>
                  <input
                    type="text"
                    value={codeBlockTitle}
                    onChange={(e) => setCodeBlockTitle(e.target.value)}
                    placeholder="e.g. index.ts, app.py, schema.sql"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-500">
                    Programming Language
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-500">
                  Source Code
                </label>
                <textarea
                  rows={8}
                  required
                  value={rawCode}
                  onChange={(e) => setRawCode(e.target.value)}
                  placeholder="// Paste or write source code here"
                  className="w-full bg-zinc-950 text-zinc-100 font-mono text-xs p-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y leading-relaxed selection:bg-zinc-800"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Live preview & copy buttons rendered for readers
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Snippet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
