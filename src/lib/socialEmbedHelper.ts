/**
 * Helper utility for parsing social media URLs, extracting platform data,
 * generating responsive embed codes, and loading social widget scripts.
 */

export type SocialPlatform =
  | "twitter"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "spotify"
  | "generic";

export interface ParsedSocialData {
  platform: SocialPlatform;
  url: string;
  embedHtml: string;
  id?: string;
  author?: string;
}

/**
 * Detect social platform and generate standardized embed markup
 */
export function parseSocialUrl(inputUrl: string): ParsedSocialData {
  const cleanUrl = inputUrl.trim();

  // 1. YouTube
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    return {
      platform: "youtube",
      url: cleanUrl,
      id: videoId,
      embedHtml: `<div class="social-embed-youtube aspect-video w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black my-6 shadow-sm"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full h-full border-0"></iframe></div>`,
    };
  }

  // 2. X / Twitter
  const twitterMatch = cleanUrl.match(
    /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/i
  );
  if (twitterMatch) {
    const author = twitterMatch[1];
    const tweetId = twitterMatch[2];
    const canonicalUrl = `https://twitter.com/${author}/status/${tweetId}`;
    return {
      platform: "twitter",
      url: canonicalUrl,
      id: tweetId,
      author,
      embedHtml: `<div class="social-embed-twitter flex justify-center my-6"><blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><a href="${canonicalUrl}">Loading tweet by @${author}...</a></blockquote></div><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
    };
  }

  // 3. Instagram
  const igMatch = cleanUrl.match(
    /instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i
  );
  if (igMatch) {
    const shortcode = igMatch[1];
    const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;
    return {
      platform: "instagram",
      url: canonicalUrl,
      id: shortcode,
      embedHtml: `<div class="social-embed-instagram flex justify-center my-6"><blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${canonicalUrl}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%;"><a href="${canonicalUrl}">View Instagram Post</a></blockquote></div><script async src="//www.instagram.com/embed.js"></script>`,
    };
  }

  // 4. TikTok
  const tiktokMatch = cleanUrl.match(
    /tiktok\.com\/@([a-zA-Z0-9_.-]+)\/video\/(\d+)/i
  );
  if (tiktokMatch) {
    const author = tiktokMatch[1];
    const videoId = tiktokMatch[2];
    const canonicalUrl = `https://www.tiktok.com/@${author}/video/${videoId}`;
    return {
      platform: "tiktok",
      url: canonicalUrl,
      id: videoId,
      author,
      embedHtml: `<div class="social-embed-tiktok flex justify-center my-6"><blockquote class="tiktok-embed" cite="${canonicalUrl}" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="@${author}" href="https://www.tiktok.com/@${author}">@${author}</a></section></blockquote></div><script async src="https://www.tiktok.com/embed.js"></script>`,
    };
  }

  // 5. Facebook
  const isFb = /(?:facebook\.com|fb\.watch)/i.test(cleanUrl);
  if (isFb) {
    const encoded = encodeURIComponent(cleanUrl);
    const isVideo = cleanUrl.includes("/videos/") || cleanUrl.includes("/watch/") || cleanUrl.includes("fb.watch");
    const pluginUrl = isVideo
      ? `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=500`
      : `https://www.facebook.com/plugins/post.php?href=${encoded}&show_text=true&width=500`;

    return {
      platform: "facebook",
      url: cleanUrl,
      embedHtml: `<div class="social-embed-facebook flex justify-center my-6"><iframe src="${pluginUrl}" width="500" height="480" style="border:none;overflow:hidden;border-radius:12px;max-width:100%;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe></div>`,
    };
  }

  // 6. Spotify
  const spotifyMatch = cleanUrl.match(
    /open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i
  );
  if (spotifyMatch) {
    const type = spotifyMatch[1];
    const id = spotifyMatch[2];
    return {
      platform: "spotify",
      url: cleanUrl,
      id,
      embedHtml: `<div class="social-embed-spotify my-6"><iframe style="border-radius:12px" src="https://open.spotify.com/embed/${type}/${id}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`,
    };
  }

  // 7. Generic / Iframe / Fallback
  return {
    platform: "generic",
    url: cleanUrl,
    embedHtml: `<div class="social-embed-generic my-6"><iframe src="${cleanUrl}" class="w-full h-96 rounded-xl border border-zinc-200 dark:border-zinc-800" allowfullscreen loading="lazy"></iframe></div>`,
  };
}

/**
 * Dynamically load and initialize third-party social widget SDKs
 * (Twitter / X, Instagram, TikTok, Facebook) inside an HTML container.
 */
export function hydrateSocialWidgets(containerElement: HTMLElement | null) {
  if (!containerElement || typeof window === "undefined") return;

  // 1. Twitter / X Widget
  if (containerElement.querySelector(".twitter-tweet, [data-dnt]")) {
    if ((window as any).twttr?.widgets?.load) {
      (window as any).twttr.widgets.load(containerElement);
    } else {
      loadScriptOnce("https://platform.twitter.com/widgets.js", () => {
        (window as any).twttr?.widgets?.load(containerElement);
      });
    }
  }

  // 2. Instagram Widget
  if (containerElement.querySelector(".instagram-media")) {
    if ((window as any).instgrm?.Embeds?.process) {
      (window as any).instgrm.Embeds.process();
    } else {
      loadScriptOnce("https://www.instagram.com/embed.js", () => {
        (window as any).instgrm?.Embeds?.process();
      });
    }
  }

  // 3. TikTok Widget
  if (containerElement.querySelector(".tiktok-embed")) {
    loadScriptOnce("https://www.tiktok.com/embed.js");
  }

  // 4. Facebook SDK
  if (containerElement.querySelector(".fb-post, .fb-video, .fb-page")) {
    if (!(document.getElementById("fb-root"))) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }
    if ((window as any).FB?.XFBML?.parse) {
      (window as any).FB.XFBML.parse(containerElement);
    } else {
      loadScriptOnce("https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0", () => {
        (window as any).FB?.XFBML?.parse(containerElement);
      });
    }
  }
}

/**
 * Ensures a script tag is appended only once to document body
 */
function loadScriptOnce(src: string, onLoad?: () => void) {
  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
  if (existing) {
    if (onLoad) {
      if (existing.getAttribute("data-loaded") === "true") {
        onLoad();
      } else {
        existing.addEventListener("load", onLoad);
      }
    }
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.setAttribute("data-loaded", "false");
  script.onload = () => {
    script.setAttribute("data-loaded", "true");
    if (onLoad) onLoad();
  };
  document.body.appendChild(script);
}

/**
 * Execute embedded <script> tags within a container safely.
 * Standard innerHTML does not execute scripts. This extracts and evaluates them.
 */
export function executeEmbeddedScripts(container: HTMLElement | null) {
  if (!container || typeof window === "undefined") return;

  const scriptTags = container.querySelectorAll("script");
  scriptTags.forEach((oldScript) => {
    // Avoid re-running external social platform scripts handled by hydrateSocialWidgets
    const src = oldScript.src;
    if (
      src.includes("platform.twitter.com") ||
      src.includes("instagram.com/embed.js") ||
      src.includes("tiktok.com/embed.js") ||
      src.includes("connect.facebook.net")
    ) {
      return;
    }

    const newScript = document.createElement("script");
    // Copy all attributes
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }

    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

/**
 * Extract a high-quality preview thumbnail from video platform URLs (YouTube, Vimeo)
 */
export function getVideoThumbnail(url: string | null | undefined): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube standard / shorts / embed / youtu.be
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  return null;
}
