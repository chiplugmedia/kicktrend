"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Code, Eye, Trash2, Check, Sparkles, Terminal } from "lucide-react";

export function HtmlEmbedView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const currentHtml = (node.attrs.html as string) || "";
  const [isEditing, setIsEditing] = React.useState<boolean>(!currentHtml.trim());
  const [codeValue, setCodeValue] = React.useState<string>(currentHtml);

  // Synchronize when node attributes change
  React.useEffect(() => {
    setCodeValue(node.attrs.html || "");
  }, [node.attrs.html]);

  const handleApply = () => {
    updateAttributes({ html: codeValue });
    setIsEditing(false);
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
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-black dark:bg-white text-white dark:text-black">
              <Code className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              HTML / Custom Code Embed
            </span>
            <span className="text-[10px] text-zinc-500 font-normal px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
              {isEditing ? "EDIT MODE" : "LIVE PREVIEW"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
            >
              {isEditing ? (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3 h-3" />
                  <span>Edit Source</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Remove Embed Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isEditing ? (
          <div className="p-4 space-y-3 bg-zinc-950 text-zinc-100">
            <p className="text-[11px] font-mono text-zinc-400">
              Type or paste raw HTML markup (e.g. &lt;p&gt;dej494&lt;/p&gt;, &lt;iframe&gt;, custom styling).
              This code renders directly as real HTML elements on the public page.
            </p>
            <textarea
              rows={5}
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              placeholder="<p class='text-lg font-bold'>Hello World</p>"
              className="w-full bg-black text-emerald-400 font-mono text-xs p-3 rounded-lg border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y selection:bg-zinc-800"
              spellCheck={false}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-zinc-500">
                {codeValue.length} characters • Raw HTML
              </span>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply & Preview</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            {currentHtml.trim() ? (
              <div
                className="custom-html-embed-output prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: currentHtml }}
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer text-center py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-mono text-xs"
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
                Empty HTML embed block. Click to enter markup.
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
