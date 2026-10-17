"use client";

import * as React from "react";

interface AdSenseSnippetInjectorProps {
  snippet: string;
}

/**
 * AdSenseSnippetInjector safely injects and activates raw AdSense header/body code snippets.
 * Ensures <script> tags execute across both initial server render and client-side soft navigations.
 */
export function AdSenseSnippetInjector({ snippet }: AdSenseSnippetInjectorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current || !snippet) return;

    // Client-side execution of newly mounted <script> elements
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      // Re-create the script element so the browser's JavaScript engine evaluates it
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [snippet]);

  if (!snippet || !snippet.trim()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id="adsense-custom-snippet"
      className="adsense-snippet-container"
      dangerouslySetInnerHTML={{ __html: snippet }}
    />
  );
}
