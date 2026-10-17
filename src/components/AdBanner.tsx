"use client";

import * as React from "react";

interface AdBannerProps {
  slot: "leaderboard" | "in-article" | "sidebar" | "grid-interstitial";
  adClient?: string;
  adSlot?: string;
  className?: string;
  isApproved?: boolean;
  showPlaceholder?: boolean;
}

export function AdBanner({
  slot,
  adClient = "ca-pub-XXXXXXXXXXXXXXXX",
  adSlot = "1234567890",
  className = "",
  isApproved = false,
  showPlaceholder = false,
}: AdBannerProps) {
  // Dimension styles according to Google AdSense responsive standards
  const slotConfig = {
    leaderboard: {
      label: "LEADERBOARD BANNER",
      dimensions: "w-full max-w-[728px] h-[90px] min-h-[90px]",
      containerStyle: "my-6 mx-auto",
    },
    "in-article": {
      label: "IN-ARTICLE NATIVE AD",
      dimensions: "w-full min-h-[250px] max-w-[650px]",
      containerStyle: "my-8 mx-auto",
    },
    sidebar: {
      label: "SIDEBAR AD SLOT",
      dimensions: "w-full min-h-[250px] max-h-[600px]",
      containerStyle: "my-4",
    },
    "grid-interstitial": {
      label: "FEED SPONSORED INTERSTITIAL",
      dimensions: "w-full h-[120px] sm:h-[150px]",
      containerStyle: "my-6 col-span-full",
    },
  }[slot];

  // Initialize adsbygoogle when approved
  React.useEffect(() => {
    if (isApproved && typeof window !== "undefined") {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {
        // Ignore duplicate push errors in React strict mode
      }
    }
  }, [isApproved]);

  // If not approved and placeholder not requested, DO NOT render anything on frontend
  if (!isApproved && !showPlaceholder) {
    return null;
  }

  // Preview placeholder mode (if site unapproved but preview requested)
  if (!isApproved && showPlaceholder) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-2.5 text-center transition-all ${slotConfig.containerStyle} ${className}`}
        aria-label="AdSense Placement (Pending Approval)"
      >
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 select-none">
          AdSense Unit &middot; {slotConfig.label} (Awaiting Site Approval)
        </span>
      </div>
    );
  }

  // Fully Approved AdSense Live Banner
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 p-3 text-center transition-all ${slotConfig.containerStyle} ${className}`}
      aria-label="Advertisement"
    >
      {/* Subtle Advertisement Disclosure Tag required by Google AdSense policy */}
      <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mb-1.5 select-none">
        Advertisement &bull; {slotConfig.label}
      </span>

      {/* Ad Area Container */}
      <div
        className={`flex items-center justify-center rounded-lg border border-zinc-200/60 dark:border-zinc-850/60 bg-white/60 dark:bg-black/60 ${slotConfig.dimensions}`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
