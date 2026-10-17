"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, User, ExternalLink, Share2, Globe } from "lucide-react";
import {
  hydrateSocialWidgets,
  executeEmbeddedScripts,
  parseSocialUrl,
  type SocialPlatform,
} from "@/lib/socialEmbedHelper";
import { InteractiveCodeSnippet } from "@/components/InteractiveCodeSnippet";
import { EnhancedCodeBlock } from "@/components/EnhancedCodeBlock";
import { formatCoverImageUrl } from "@/lib/imageHelper";

interface ArticleContentRendererProps {
  content: string;
}

interface EmbedCardData {
  slug: string;
  title: string;
  summary?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  date?: string;
}

/**
 * Renders standard prose segments and automatically converts <pre><code> blocks
 * into rich, syntax-highlighted code blocks with copy-to-clipboard buttons.
 */
function ProseContent({ html }: { html: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      hydrateSocialWidgets(containerRef.current);
      executeEmbeddedScripts(containerRef.current);
    }
  }, [html]);

  // Regex to detect <pre><code ...>...</code></pre> blocks
  const codeBlockRegex =
    /(<pre[^>]*><code(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>)/gi;

  const parts = html.split(codeBlockRegex);

  // If no code blocks were extracted, render HTML directly
  if (parts.length <= 1) {
    return (
      <div
        ref={containerRef}
        className="prose-reading"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Iterate over parts (each split produces: [preText, fullMatch, classNames, codeText, ...])
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < parts.length) {
    const textPart = parts[i];
    if (textPart && textPart.trim()) {
      elements.push(
        <div
          key={`text-${i}`}
          ref={containerRef}
          className="prose-reading"
          dangerouslySetInnerHTML={{ __html: textPart }}
        />
      );
    }

    if (i + 1 < parts.length) {
      const classAttr = parts[i + 2] || "";
      const rawCode = parts[i + 3] || "";

      // Unescape HTML entities from code
      const decodedCode = rawCode
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const langMatch = classAttr.match(/language-([a-zA-Z0-9_-]+)/);
      const language = langMatch ? langMatch[1] : undefined;

      elements.push(
        <EnhancedCodeBlock
          key={`code-block-${i}`}
          code={decodedCode}
          language={language}
        />
      );

      i += 4;
    } else {
      i++;
    }
  }

  return <div className="space-y-4">{elements}</div>;
}

export function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
  const rootContainerRef = React.useRef<HTMLDivElement>(null);

  // Hydrate all social widgets (Twitter, Instagram, TikTok, Facebook) across the full article body
  React.useEffect(() => {
    if (rootContainerRef.current) {
      hydrateSocialWidgets(rootContainerRef.current);
      executeEmbeddedScripts(rootContainerRef.current);
    }
  }, [content]);

  if (!content || !content.trim()) {
    return <p className="text-zinc-500 font-mono text-sm">No content published.</p>;
  }

  // Regex to match and capture all four custom embed node types rendered by Tiptap
  const embedRegex =
    /(<div[^>]*data-type="(?:social-embed|code-snippet-embed|custom-html-embed|embedded-post-card)"[^>]*>[\s\S]*?<\/div>)/gi;

  const segments = content.split(embedRegex);

  const getAttr = (str: string, name: string): string => {
    const match = str.match(new RegExp(`data-${name}="([^"]*)"`, "i"));
    if (!match || !match[1]) return "";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  };

  return (
    <div ref={rootContainerRef} className="article-body-container space-y-6">
      {segments.map((segment, index) => {
        if (!segment || !segment.trim()) return null;

        // 1. Check if segment is Social Media Embed
        if (segment.includes('data-type="social-embed"')) {
          const platform = (getAttr(segment, "platform") as SocialPlatform) || "generic";
          const url = getAttr(segment, "url");
          const caption = getAttr(segment, "caption");
          let embedHtml = getAttr(segment, "embed-html");

          // Fallback: If empty, re-parse from URL or inner HTML
          if (!embedHtml && url) {
            embedHtml = parseSocialUrl(url).embedHtml;
          } else if (!embedHtml) {
            const innerMatch = segment.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
            embedHtml = innerMatch ? innerMatch[1] : segment;
          }

          return (
            <div key={`social-embed-${index}`} className="my-8">
              <div
                className="social-embed-public-wrapper flex flex-col items-center justify-center overflow-hidden"
                dangerouslySetInnerHTML={{ __html: embedHtml }}
              />

              {caption && (
                <p className="mt-2 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400 italic">
                  {caption}
                </p>
              )}
            </div>
          );
        }

        // 2. Check if segment is Custom Code Snippet (HTML, CSS, JS live runner or code block)
        if (segment.includes('data-type="code-snippet-embed"')) {
          const title = getAttr(segment, "title") || "Code Snippet";
          const language = getAttr(segment, "language") || "javascript";
          const mode = (getAttr(segment, "mode") as "executable" | "code-block") || "executable";
          const code = getAttr(segment, "code");
          const html = getAttr(segment, "html");
          const css = getAttr(segment, "css");
          const js = getAttr(segment, "js");

          return (
            <InteractiveCodeSnippet
              key={`code-snippet-${index}`}
              title={title}
              language={language}
              mode={mode}
              code={code}
              html={html}
              css={css}
              js={js}
            />
          );
        }

        // 3. Check if segment is Custom HTML Embed (Backward-compatible raw HTML)
        if (segment.includes('data-type="custom-html-embed"')) {
          let rawHtml = getAttr(segment, "raw-html");

          if (!rawHtml) {
            const innerMatch = segment.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
            rawHtml = innerMatch ? innerMatch[1] : segment;
          }

          return (
            <div
              key={`custom-html-${index}`}
              className="custom-html-embed-output my-6 overflow-hidden rounded-xl"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          );
        }

        // 4. Check if segment is Embedded Post Card
        if (segment.includes('data-type="embedded-post-card"')) {
          const cardData: EmbedCardData = {
            slug: getAttr(segment, "slug"),
            title: getAttr(segment, "title") || "Embedded Article",
            summary: getAttr(segment, "summary"),
            coverImage: formatCoverImageUrl(getAttr(segment, "cover")) || undefined,
            author: getAttr(segment, "author"),
            category: getAttr(segment, "category"),
            date: getAttr(segment, "date"),
          };

          return (
            <div key={`embed-card-${index}`} className="my-8">
              <Link
                href={`/posts/${cardData.slug}`}
                className="group block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-black dark:hover:border-white transition-all overflow-hidden shadow-xs hover:shadow-md"
              >
                <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
                  {cardData.coverImage && (
                    <div className="relative w-full sm:w-44 h-32 shrink-0 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cardData.coverImage}
                        alt={cardData.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span className="px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-[9px]">
                        DISPATCH EMBED
                      </span>
                      {cardData.category && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold uppercase">
                          {cardData.category}
                        </span>
                      )}
                      {cardData.date && <span>• {cardData.date}</span>}
                      {cardData.author && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <User className="w-2.5 h-2.5" />
                          @{cardData.author}
                        </span>
                      )}
                    </div>

                    <h4 className="font-mono text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:underline">
                      {cardData.title}
                    </h4>

                    {cardData.summary && (
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                        {cardData.summary}
                      </p>
                    )}

                    <div className="pt-1 inline-flex items-center gap-1 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                      <span>Read dispatch</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        }

        // 5. Standard prose HTML content (with enhanced code blocks & social script hydration)
        return <ProseContent key={`prose-${index}`} html={segment} />;
      })}
    </div>
  );
}
