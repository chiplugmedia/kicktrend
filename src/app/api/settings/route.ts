import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const upserts = [];

    if (body.siteName !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_name" },
          update: { value: String(body.siteName).trim() },
          create: { key: "site_name", value: String(body.siteName).trim() },
        })
      );
    }

    if (body.siteLogo !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_logo" },
          update: { value: String(body.siteLogo).trim() },
          create: { key: "site_logo", value: String(body.siteLogo).trim() },
        })
      );
    }

    if (body.siteAbout !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_about" },
          update: { value: String(body.siteAbout).trim() },
          create: { key: "site_about", value: String(body.siteAbout).trim() },
        })
      );
    }

    if (body.adsenseApproved !== undefined) {
      const boolVal = body.adsenseApproved ? "true" : "false";
      upserts.push(
        prisma.setting.upsert({
          where: { key: "adsense_approved" },
          update: { value: boolVal },
          create: { key: "adsense_approved", value: boolVal },
        })
      );
    }

    if (body.adsenseSnippet !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "adsense_snippet" },
          update: { value: String(body.adsenseSnippet) },
          create: { key: "adsense_snippet", value: String(body.adsenseSnippet) },
        })
      );
    }

    if (body.metaTitle !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_title" },
          update: { value: String(body.metaTitle).trim() },
          create: { key: "meta_title", value: String(body.metaTitle).trim() },
        })
      );
    }

    if (body.metaDescription !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_description" },
          update: { value: String(body.metaDescription).trim() },
          create: { key: "meta_description", value: String(body.metaDescription).trim() },
        })
      );
    }

    if (body.metaKeywords !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "meta_keywords" },
          update: { value: String(body.metaKeywords).trim() },
          create: { key: "meta_keywords", value: String(body.metaKeywords).trim() },
        })
      );
    }

    if (body.ogImage !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "og_image" },
          update: { value: String(body.ogImage).trim() },
          create: { key: "og_image", value: String(body.ogImage).trim() },
        })
      );
    }

    if (body.siteUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "site_url" },
          update: { value: String(body.siteUrl).trim() },
          create: { key: "site_url", value: String(body.siteUrl).trim() },
        })
      );
    }

    if (body.twitterUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "twitter_url" },
          update: { value: String(body.twitterUrl).trim() },
          create: { key: "twitter_url", value: String(body.twitterUrl).trim() },
        })
      );
    }

    if (body.tiktokUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "tiktok_url" },
          update: { value: String(body.tiktokUrl).trim() },
          create: { key: "tiktok_url", value: String(body.tiktokUrl).trim() },
        })
      );
    }

    if (body.instagramUrl !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key: "instagram_url" },
          update: { value: String(body.instagramUrl).trim() },
          create: { key: "instagram_url", value: String(body.instagramUrl).trim() },
        })
      );
    }

    if (upserts.length > 0) {
      await prisma.$transaction(upserts);
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/about");

    const updated = await getSiteSettings();

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully.",
      settings: updated,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Authentication")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update settings." },
      { status: 500 }
    );
  }
}
