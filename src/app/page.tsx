import Link from "next/link";
import type { PostSummary } from "@/types";
import { getPosts } from "@/app/actions/post-actions";
import { getCategoriesWithCounts } from "@/app/actions/category-actions";
import { getSocialLinks } from "@/app/actions/setting-actions";
import { recordSiteVisit } from "@/lib/analytics";
import { BlogCard } from "@/components/BlogCard";
import { FilterBar } from "@/components/FilterBar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeSidebar } from "@/components/HomeSidebar";
import { AdBanner } from "@/components/AdBanner";
import { ArrowRight, Sparkles, X } from "lucide-react";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Dynamically increment total site visits asynchronously without blocking rendering
  void recordSiteVisit();

  const resolvedParams = await searchParams;
  const currentQuery = resolvedParams.q || "";
  const currentCategory = resolvedParams.cat || "All";
  const isDefaultView = !currentQuery && currentCategory === "All";

  // Fetch posts, categories with counts, and dynamic social media settings concurrently
  // When in default view, avoid executing the exact same getPosts query twice
  const [filteredPosts, allLatestPosts, categoriesWithCounts, socialLinks] =
    await Promise.all([
      getPosts({
        query: currentQuery,
        category: currentCategory,
      }),
      isDefaultView ? Promise.resolve<PostSummary[]>([]) : getPosts(),
      getCategoriesWithCounts(),
      getSocialLinks(),
    ]);

  const categories =
    categoriesWithCounts.length > 0
      ? categoriesWithCounts.map((c) => c.name)
      : ["Engineering", "Design", "Architecture", "AI", "Philosophy"];

  const popularHashtags = [
    "#technology",
    "#design",
    "#nextjs",
    "#minimalism",
    "#systems",
    "#typescript",
  ];

  // 3 latest posts for the auto-sliding Hero Carousel
  const activeLatestPosts = isDefaultView ? filteredPosts : allLatestPosts;
  const carouselPosts = activeLatestPosts.slice(0, 3);

  return (
    <div className="space-y-12 font-sans">
      {/* 1. Dynamic Editorial Hero Header: Auto-sliding Carousel for 3 Latest Posts */}
      {isDefaultView ? (
        <HeroCarousel posts={carouselPosts} />
      ) : (
        /* Filter / Search Header */
        <section className="pt-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 mb-3">
            <Sparkles className="w-3 h-3 text-black dark:text-white" />
            <span>WANBLOG ARCHIVES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {currentCategory !== "All"
              ? `${currentCategory.toUpperCase()} ARTICLES`
              : currentQuery
              ? `SEARCH: "${currentQuery.toUpperCase()}"`
              : "MONOCHROME DISPATCHES"}
          </h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans">
            Curated essays, architectural breakdowns, and design philosophies.
          </p>
        </section>
      )}

      {/* 2. Main Content & Right-Hand Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Feed & Post Cards */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                {isDefaultView ? "All Dispatches" : "Filtered Results"}
              </h2>
              {/* <span className="text-xs font-mono text-zinc-500">
                {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
              </span> */}
            </div>
{/* 
            <FilterBar
              categories={categories}
              popularHashtags={popularHashtags}
              currentCategory={currentCategory}
              currentQuery={currentQuery}
            /> */}

            {/* Active Filter Indicator */}
            {(currentQuery || (currentCategory && currentCategory !== "All")) && (
              <div className="flex items-center gap-2 mb-6 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                <span>Filtering by:</span>
                {currentCategory !== "All" && (
                  <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    Category: {currentCategory}
                  </span>
                )}
                {currentQuery && (
                  <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{currentQuery}&rdquo;
                  </span>
                )}
                <Link
                  href="/"
                  className="flex items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white underline ml-2"
                >
                  <X className="w-3 h-3" />
                  <span>Clear filters</span>
                </Link>
              </div>
            )}
          </div>

          {/* Blog Post Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.slice(0, 2).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}

              {filteredPosts.length > 2 && (
                <div className="col-span-full">
                  <AdBanner slot="grid-interstitial" />
                </div>
              )}

              {filteredPosts.slice(2).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
              <p className="text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                No matching dispatches found
              </p>
              <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
                We couldn&apos;t find any articles matching your search criteria. Try a broader search term or explore all topics.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-medium hover:opacity-90"
              >
                <span>View all posts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right-Hand Sidebar: Categories, Latest Posts, Social Links */}
        <div className="lg:col-span-4">
          <HomeSidebar
            categoriesWithCounts={categoriesWithCounts}
            latestPosts={activeLatestPosts}
            socialLinks={socialLinks}
          />
        </div>
      </div>
    </div>
  );
}
