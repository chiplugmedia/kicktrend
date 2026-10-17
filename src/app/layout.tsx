import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/app/actions/category-actions";
import { getSiteSettings } from "@/lib/settings";
import { SiteShell } from "@/components/SiteShell";
import { AdSenseSnippetInjector } from "@/components/AdSenseSnippetInjector";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const baseUrl = settings.siteUrl?.startsWith("http")
    ? settings.siteUrl
    : "http://localhost:3000";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: settings.metaTitle || `${settings.siteName} — Minimalist Engineering & Design Journal`,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.metaDescription,
    keywords: settings.metaKeywords.split(",").map((k) => k.trim()),
    authors: [{ name: `${settings.siteName} Editorial` }],
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      url: baseUrl,
      siteName: settings.siteName,
      images: settings.ogImage ? [{ url: settings.ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: settings.ogImage ? [settings.ogImage] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, categories, settings] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        {/* Conditional Google AdSense Script - Loaded ONLY when site is approved */}
        {settings.adsenseApproved && !settings.adsenseSnippet && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {/* Dynamic AdSense Header/Body Code Snippet - Injected ONLY when Site Approved is ON */}
        {settings.adsenseApproved && settings.adsenseSnippet && (
          <AdSenseSnippetInjector snippet={settings.adsenseSnippet} />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteShell
            currentUser={currentUser}
            categories={categories}
            settings={settings}
          >
            {children}
          </SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
