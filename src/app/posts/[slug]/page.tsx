import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { recordPostView } from "@/lib/analytics";
import { getCategoriesWithCounts } from "@/app/actions/category-actions";
import { getPosts } from "@/app/actions/post-actions";
import { getSocialLinks } from "@/app/actions/setting-actions";
import { VideoEmbed } from "@/components/VideoEmbed";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { SiteSidebar } from "@/components/HomeSidebar";
import { AdBanner } from "@/components/AdBanner";
import { ArticleContentRenderer } from "@/components/ArticleContentRenderer";
import { ArrowLeft, Clock, Calendar, Eye, Share2 } from "lucide-react";
import { formatCoverImageUrl, getAbsoluteCoverImageUrl } from "@/lib/imageHelper";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) return { title: "Post Not Found — WANBLOG" };

  const absoluteCover = getAbsoluteCoverImageUrl(post.coverImage);

  return {
    title: `${post.title} — WANBLOG`,
    description: post.summary,
    openGraph: {
      title: `${post.title} — WANBLOG`,
      description: post.summary,
      type: "article",
      url: `/posts/${post.slug}`,
      images: absoluteCover ? [{ url: absoluteCover }] : [],
      publishedTime: post.createdAt.toISOString(),
      authors: [post.authorUsername],
      tags: post.tags ? post.tags.split(",").map((t) => t.trim()) : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — WANBLOG`,
      description: post.summary,
      images: absoluteCover ? [absoluteCover] : [],
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;

  // Concurrent loading of post, author, counts, and unified sidebar data
  const [post, categoriesWithCounts, allPosts, socialLinks] = await Promise.all([
    prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
        likes: true,
      },
    }),
    getCategoriesWithCounts(),
    getPosts(),
    getSocialLinks(),
  ]);

  if (!post || !post.published) {
    notFound();
  }

  // Increment view count asynchronously without blocking page render
  void recordPostView(post.id);

  const currentUser = await getCurrentUser();
  const isLikedByCurrentUser = currentUser
    ? post.likes.some((l) => l.authorUsername === currentUser.username)
    : false;

  const hashtagsList = post.hashtags
    ? post.hashtags
        .split(/[\s,]+/)
        .filter((t) => t.trim().length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`))
    : [];

  const tagsList = post.tags
    ? post.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const displayCoverImage = formatCoverImageUrl(post.coverImage);
  const absoluteCoverImage = getAbsoluteCoverImageUrl(post.coverImage);

  // JSON-LD Structured Data Schema for Google AdSense & SEO Validation
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: absoluteCoverImage || undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorUsername,
    },
    publisher: {
      "@type": "Organization",
      name: "WANBLOG",
      logo: {
        "@type": "ImageObject",
        url: "https://wanblog.internal/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://wanblog.internal/posts/${post.slug}`,
    },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://wanblog.internal/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category,
        item: `https://wanblog.internal/?cat=${encodeURIComponent(post.category)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://wanblog.internal/posts/${post.slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-4">
        {/* Main Article Content Column */}
        <article className="lg:col-span-8 min-w-0">
          {/* Back Navigation Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to dispatches</span>
          </Link>

          {/* Meta Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-4">
              <Link
                href={`/?cat=${encodeURIComponent(post.category)}`}
                className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold uppercase tracking-wider text-[11px]"
              >
                {post.category}
              </Link>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime} min read</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={new Date(post.createdAt).toISOString()}>
                  {formatDate(post.createdAt)}
                </time>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{((post.views || 0) + 1).toLocaleString()} views</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight mb-4">
              {post.title}
            </h1>

            {/* Rich Summary (rendered as HTML if Tiptap formatted or plain text) */}
            <div
              className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal mb-6"
              dangerouslySetInnerHTML={{ __html: post.summary }}
            />

            {/* Author Byline */}
            <div className="flex items-center justify-between py-4 border-y border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black font-mono font-bold flex items-center justify-center text-sm">
                  {post.authorUsername.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    @{post.authorUsername}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Contributing Author
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <LikeButton
                  postId={post.id}
                  initialLikesCount={post.likes.length}
                  initialIsLiked={isLikedByCurrentUser}
                  currentUsername={currentUser?.username}
                />
              </div>
            </div>
          </header>

          {/* Featured Cover Image: Always displayed when present */}
          {displayCoverImage && (
            <div className="relative aspect-video sm:aspect-[16/9] min-h-[260px] sm:min-h-[380px] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 mb-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <Image
                src={displayCoverImage}
                alt={post.title}
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="(max-width: 800px) 100vw, 800px"
              />
            </div>
          )}

          {/* Featured Media: Embedded Video Player */}
          {post.videoUrl && (
            <div className="mb-8">
              <VideoEmbed url={post.videoUrl} title={post.title} />
            </div>
          )}

          {/* In-Article Native Ad Slot */}
          <AdBanner slot="in-article" />

          {/* Main Prose Content: Rendered safely with Tiptap/Prose styling, custom HTML embeds, and post cards */}
          <div className="mb-10">
            <ArticleContentRenderer content={post.content} />
          </div>

          {/* Hashtags and Category Footer */}
          <div className="pt-6 pb-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {hashtagsList.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
              {tagsList.map((tag) => (
                <Link
                  key={tag}
                  href={`/?q=${encodeURIComponent(tag)}`}
                  className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div>
              <LikeButton
                postId={post.id}
                initialLikesCount={post.likes.length}
                initialIsLiked={isLikedByCurrentUser}
                currentUsername={currentUser?.username}
              />
            </div>
          </div>

          {/* Comment Thread */}
          <CommentSection
            postId={post.id}
            comments={post.comments}
            currentUsername={currentUser?.username}
          />
        </article>

        {/* Right-Hand Consistent Sidebar */}
        <div className="lg:col-span-4">
          <SiteSidebar
            categoriesWithCounts={categoriesWithCounts}
            latestPosts={allPosts}
            socialLinks={socialLinks}
            currentPostSlug={post.slug}
          />
        </div>
      </div>
    </>
  );
}
