"use client";

import * as React from "react";
import { Play } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  title?: string;
}

export function VideoEmbed({ url, title = "Embedded Video" }: VideoEmbedProps) {
  if (!url) return null;

  const getEmbedInfo = (rawUrl: string) => {
    // YouTube
    const ytMatch = rawUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      return {
        type: "iframe" as const,
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
      };
    }

    // Vimeo
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch) {
      const vimeoId = vimeoMatch[3] || vimeoMatch[1];
      return {
        type: "iframe" as const,
        src: `https://player.vimeo.com/video/${vimeoId}`,
      };
    }

    // HTML5 native video
    return {
      type: "video" as const,
      src: rawUrl,
    };
  };

  const embedInfo = getEmbedInfo(url);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-black aspect-video my-6 shadow-sm">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium bg-black/80 text-white rounded border border-white/10 backdrop-blur-sm">
        <Play className="w-3 h-3 fill-white" />
        <span>VIDEO</span>
      </div>

      {embedInfo.type === "iframe" ? (
        <iframe
          src={embedInfo.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <video
          src={embedInfo.src}
          controls
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
