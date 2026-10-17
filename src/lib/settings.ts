import { prisma } from "@/lib/prisma";

export interface SiteSettings {
  siteName: string;
  siteLogo: string;
  siteAbout: string;
  adsenseApproved: boolean;
  adsenseSnippet: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  siteUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "WANBLOG",
  siteLogo: "",
  siteAbout:
    "An unfiltered engineering journal and design essay collection dedicated to modern software architecture, high-density aesthetics, and crisp typography.",
  adsenseApproved: false,
  adsenseSnippet: "",
  metaTitle: "WANBLOG — Minimalist Engineering & Design Journal",
  metaDescription:
    "A high-performance, minimalist black and white publication powered by Next.js, Tailwind CSS, and Prisma ORM.",
  metaKeywords: "tech blog, engineering, design, nextjs, minimalist blog, prisma",
  ogImage: "",
  siteUrl: "http://localhost:3000",
  twitterUrl: "https://x.com/wanblog",
  tiktokUrl: "https://tiktok.com/@wanblog",
  instagramUrl: "https://instagram.com/wanblog",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.setting.findMany();
    const map = new Map<string, string>();
    for (const s of settings) {
      map.set(s.key, s.value);
    }

    return {
      siteName: map.get("site_name") || DEFAULT_SETTINGS.siteName,
      siteLogo: map.get("site_logo") || DEFAULT_SETTINGS.siteLogo,
      siteAbout: map.get("site_about") || DEFAULT_SETTINGS.siteAbout,
      adsenseApproved: map.get("adsense_approved") === "true",
      adsenseSnippet: map.get("adsense_snippet") || DEFAULT_SETTINGS.adsenseSnippet,
      metaTitle: map.get("meta_title") || DEFAULT_SETTINGS.metaTitle,
      metaDescription: map.get("meta_description") || DEFAULT_SETTINGS.metaDescription,
      metaKeywords: map.get("meta_keywords") || DEFAULT_SETTINGS.metaKeywords,
      ogImage: map.get("og_image") || DEFAULT_SETTINGS.ogImage,
      siteUrl: map.get("site_url") || DEFAULT_SETTINGS.siteUrl,
      twitterUrl: map.get("twitter_url") || DEFAULT_SETTINGS.twitterUrl,
      tiktokUrl: map.get("tiktok_url") || DEFAULT_SETTINGS.tiktokUrl,
      instagramUrl: map.get("instagram_url") || DEFAULT_SETTINGS.instagramUrl,
    };
  } catch (err) {
    console.error("Failed to fetch site settings:", err);
    return DEFAULT_SETTINGS;
  }
}
