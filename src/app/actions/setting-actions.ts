"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  getTrafficHistory,
  DailyTrafficPoint,
  getCountryDistribution,
  CountryTrafficStat,
  getRecentVisitors,
  RecentVisitor,
  getVisitorAnalyticsOverview,
  VisitorAnalyticsOverview,
} from "@/lib/analytics";
import { getSiteSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/settings";

export { getSiteSettings };
export type { SiteSettings };

export async function updateSiteSettingsAction(newSettings: Partial<SiteSettings>) {
  try {
    await requireAdmin();

    const upserts = [];

    if (newSettings.siteName !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_name" },
          update: { value: newSettings.siteName.trim() },
          create: { key: "site_name", value: newSettings.siteName.trim() },
        })
      );
    }

    if (newSettings.siteLogo !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_logo" },
          update: { value: newSettings.siteLogo.trim() },
          create: { key: "site_logo", value: newSettings.siteLogo.trim() },
        })
      );
    }

    if (newSettings.siteAbout !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_about" },
          update: { value: newSettings.siteAbout.trim() },
          create: { key: "site_about", value: newSettings.siteAbout.trim() },
        })
      );
    }

    if (newSettings.adsenseApproved !== undefined) {
      const boolVal = newSettings.adsenseApproved ? "true" : "false";
      upserts.push(
        prisma.setting.upsert({
          where: { key: "adsense_approved" },
          update: { value: boolVal },
          create: { key: "adsense_approved", value: boolVal },
        })
      );
    }

    if (newSettings.adsenseSnippet !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "adsense_snippet" },
          update: { value: newSettings.adsenseSnippet },
          create: { key: "adsense_snippet", value: newSettings.adsenseSnippet },
        })
      );
    }

    if (newSettings.metaTitle !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_title" },
          update: { value: newSettings.metaTitle.trim() },
          create: { key: "meta_title", value: newSettings.metaTitle.trim() },
        })
      );
    }

    if (newSettings.metaDescription !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_description" },
          update: { value: newSettings.metaDescription.trim() },
          create: { key: "meta_description", value: newSettings.metaDescription.trim() },
        })
      );
    }

    if (newSettings.metaKeywords !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_keywords" },
          update: { value: newSettings.metaKeywords.trim() },
          create: { key: "meta_keywords", value: newSettings.metaKeywords.trim() },
        })
      );
    }

    if (newSettings.ogImage !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "og_image" },
          update: { value: newSettings.ogImage.trim() },
          create: { key: "og_image", value: newSettings.ogImage.trim() },
        })
      );
    }

    if (newSettings.siteUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_url" },
          update: { value: newSettings.siteUrl.trim() },
          create: { key: "site_url", value: newSettings.siteUrl.trim() },
        })
      );
    }

    if (newSettings.twitterUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "twitter_url" },
          update: { value: newSettings.twitterUrl.trim() },
          create: { key: "twitter_url", value: newSettings.twitterUrl.trim() },
        })
      );
    }

    if (newSettings.tiktokUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "tiktok_url" },
          update: { value: newSettings.tiktokUrl.trim() },
          create: { key: "tiktok_url", value: newSettings.tiktokUrl.trim() },
        })
      );
    }

    if (newSettings.instagramUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "instagram_url" },
          update: { value: newSettings.instagramUrl.trim() },
          create: { key: "instagram_url", value: newSettings.instagramUrl.trim() },
        })
      );
    }

    if (upserts.length > 0) {
      await prisma.$transaction(upserts);
    }

    // Revalidate paths globally
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/about");

    const updated = await getSiteSettings();
    return { success: true, settings: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update settings" };
  }
}

// Backward compatibility for social links
export interface SocialLinks {
  twitterUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const settings = await getSiteSettings();
  return {
    twitterUrl: settings.twitterUrl,
    tiktokUrl: settings.tiktokUrl,
    instagramUrl: settings.instagramUrl,
  };
}

export async function updateSocialLinksAction(links: SocialLinks) {
  return await updateSiteSettingsAction({
    twitterUrl: links.twitterUrl,
    tiktokUrl: links.tiktokUrl,
    instagramUrl: links.instagramUrl,
  });
}

export async function fetchTrafficHistoryAction(days: number): Promise<DailyTrafficPoint[]> {
  return await getTrafficHistory(days);
}

export async function fetchVisitorAnalyticsAction(days: number): Promise<VisitorAnalyticsOverview> {
  return await getVisitorAnalyticsOverview(days);
}

export async function fetchCountryDistributionAction(days = 30): Promise<CountryTrafficStat[]> {
  return await getCountryDistribution(days);
}

export async function fetchRecentVisitorsAction(limit = 10): Promise<RecentVisitor[]> {
  return await getRecentVisitors(limit);
}

