import { headers } from "next/headers";
import { prisma } from "./prisma";
import {
  extractClientIp,
  resolveLocationFromIp,
  getCountryFlagEmoji,
  getCountryFlagImgUrl,
  maskIpAddress,
} from "./geoHelper";

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatTimeAgo(date: Date | string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export interface DailyTrafficPoint {
  date: string;
  label: string;
  count: number; // Unique visitors count
  pageviews: number; // Total pageviews count
}

export interface CountryTrafficStat {
  country: string;
  countryCode: string;
  flagUrl: string | null;
  flagEmoji: string;
  uniqueVisitors: number;
  totalHits: number;
  percentage: number;
}

export interface RecentVisitor {
  id: number;
  maskedIp: string;
  country: string;
  countryCode: string;
  flagUrl: string | null;
  flagEmoji: string;
  city: string | null;
  path: string;
  timeAgo: string;
  createdAt: string;
}

export interface VisitorAnalyticsOverview {
  totalUniqueVisitors: number;
  todayUniqueVisitors: number;
  totalPageviews: number;
  todayPageviews: number;
  topCountry: string;
  countriesCount: number;
  trafficHistory: DailyTrafficPoint[];
  countryDistribution: CountryTrafficStat[];
  recentVisitors: RecentVisitor[];
}

/**
 * Record a visit to the site, resolving geo location from IP and filtering duplicates
 */
export async function recordSiteVisit(
  path = "/",
  directHeaders?: Headers
): Promise<{ totalVisits: number; isUniqueToday: boolean }> {
  try {
    const todayStr = getTodayDateString();

    // 1. Resolve request headers
    let headerList: Headers | undefined = directHeaders;
    if (!headerList) {
      try {
        headerList = await headers();
      } catch {
        // Headers might not be available in non-request contexts
      }
    }

    // 2. Extract visitor IP
    const clientIp = headerList ? extractClientIp(headerList) : "127.0.0.1";

    // 3. Deduplication: Check if this IP has already visited today
    const existing = await prisma.$queryRawUnsafe<any[]>(
      "SELECT id FROM visitorlog WHERE ip = ? AND date = ? LIMIT 1",
      clientIp,
      todayStr
    );

    let isUniqueToday = false;

    if (!existing || existing.length === 0) {
      isUniqueToday = true;
      // Resolve location from IP
      const geo = await resolveLocationFromIp(clientIp, headerList);

      // Record in visitorlog
      await prisma.$executeRawUnsafe(
        "INSERT INTO visitorlog (ip, country, countryCode, city, path, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        clientIp,
        geo.country,
        geo.countryCode,
        geo.city || null,
        path.slice(0, 255),
        todayStr
      );

      // Increment site-wide unique visitor counter
      await prisma.siteStat
        .upsert({
          where: { key: "unique_visits" },
          update: { value: { increment: 1 } },
          create: { key: "unique_visits", value: 1 },
        })
        .catch(() => {});
    }

    // 4. Update raw pageview metrics
    const [stat] = await Promise.all([
      prisma.siteStat.upsert({
        where: { key: "total_visits" },
        update: { value: { increment: 1 } },
        create: { key: "total_visits", value: 1 },
      }),
      prisma.dailyVisit.upsert({
        where: { date: todayStr },
        update: { count: { increment: 1 } },
        create: { date: todayStr, count: 1 },
      }),
    ]);

    return { totalVisits: stat.value, isUniqueToday };
  } catch (error) {
    console.error("Failed to record site visit:", error);
    return { totalVisits: 0, isUniqueToday: false };
  }
}

/**
 * Record post view and corresponding site visit
 */
export async function recordPostView(
  postId: number,
  directHeaders?: Headers
): Promise<void> {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
      select: { slug: true },
    });
    const path = post?.slug ? `/posts/${post.slug}` : "/";
    await recordSiteVisit(path, directHeaders);
  } catch (error) {
    console.error("Failed to increment post view:", error);
  }
}

/**
 * Get total raw pageviews across the site
 */
export async function getTotalSiteVisits(): Promise<number> {
  try {
    const stat = await prisma.siteStat.findUnique({
      where: { key: "total_visits" },
    });
    return stat?.value ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get total unique visitors (distinct IPs logged)
 */
export async function getTotalUniqueVisitors(): Promise<number> {
  try {
    const res = await prisma.$queryRawUnsafe<any[]>(
      "SELECT COUNT(DISTINCT ip) as cnt FROM visitorlog"
    );
    const count = Number(res?.[0]?.cnt ?? 0);
    if (count > 0) return count;

    // Fallback to siteStat unique_visits if visitorlog is empty
    const stat = await prisma.siteStat.findUnique({
      where: { key: "unique_visits" },
    });
    return stat?.value ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get today's total pageviews
 */
export async function getTodayVisits(): Promise<number> {
  try {
    const todayStr = getTodayDateString();
    const record = await prisma.dailyVisit.findUnique({
      where: { date: todayStr },
    });
    return record?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get today's unique visitors (distinct IPs logged today)
 */
export async function getTodayUniqueVisitors(): Promise<number> {
  try {
    const todayStr = getTodayDateString();
    const res = await prisma.$queryRawUnsafe<any[]>(
      "SELECT COUNT(DISTINCT ip) as cnt FROM visitorlog WHERE date = ?",
      todayStr
    );
    return Number(res?.[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Fetch daily traffic points for line chart with both unique visitors and pageviews
 */
export async function getTrafficHistory(days = 7): Promise<DailyTrafficPoint[]> {
  try {
    const dateList: string[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().slice(0, 10));
    }

    const startDate = dateList[0];

    // Fetch daily pageviews from dailyVisit
    const dailyRecords = await prisma.dailyVisit.findMany({
      where: {
        date: { in: dateList },
      },
    });

    const pageviewsMap = new Map<string, number>();
    for (const r of dailyRecords) {
      pageviewsMap.set(r.date, r.count);
    }

    // Fetch daily unique visitors (distinct IPs per day) from visitorlog
    const uniqueRecords = await prisma.$queryRawUnsafe<any[]>(
      "SELECT date, COUNT(DISTINCT ip) as uniqueCount FROM visitorlog WHERE date >= ? GROUP BY date",
      startDate
    );

    const uniqueMap = new Map<string, number>();
    if (Array.isArray(uniqueRecords)) {
      for (const r of uniqueRecords) {
        uniqueMap.set(r.date, Number(r.uniqueCount ?? 0));
      }
    }

    return dateList.map((dStr) => {
      const d = new Date(dStr + "T00:00:00");
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const uniqueCount = uniqueMap.get(dStr) ?? 0;
      const pageviews = pageviewsMap.get(dStr) ?? 0;

      // Ensure count is at least uniqueCount or sensible fallback
      return {
        date: dStr,
        label,
        count: uniqueCount > 0 ? uniqueCount : Math.min(pageviews, 1),
        pageviews,
      };
    });
  } catch (error) {
    console.error("Failed to fetch traffic history:", error);
    return [];
  }
}

/**
 * Get country traffic distribution with flags, visitor counts, and percentages
 */
export async function getCountryDistribution(days = 30): Promise<CountryTrafficStat[]> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT country, countryCode, COUNT(DISTINCT ip) as uniqueVisitors, COUNT(*) as totalHits
       FROM visitorlog
       WHERE date >= ?
       GROUP BY country, countryCode
       ORDER BY uniqueVisitors DESC
       LIMIT 10`,
      cutoffStr
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const totalUniqueInPeriod = rows.reduce(
      (sum, r) => sum + Number(r.uniqueVisitors ?? 0),
      0
    );

    return rows.map((r) => {
      const uniqueCount = Number(r.uniqueVisitors ?? 0);
      const totalHits = Number(r.totalHits ?? 0);
      const countryCode = (r.countryCode || "UN").toUpperCase();
      const percentage =
        totalUniqueInPeriod > 0
          ? Math.round((uniqueCount / totalUniqueInPeriod) * 100)
          : 0;

      return {
        country: r.country || "International",
        countryCode,
        flagUrl: getCountryFlagImgUrl(countryCode),
        flagEmoji: getCountryFlagEmoji(countryCode),
        uniqueVisitors: uniqueCount,
        totalHits,
        percentage,
      };
    });
  } catch (error) {
    console.error("Failed to fetch country distribution:", error);
    return [];
  }
}

/**
 * Get recent unique visitors activity log
 */
export async function getRecentVisitors(limit = 10): Promise<RecentVisitor[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, ip, country, countryCode, city, path, createdAt
       FROM visitorlog
       ORDER BY createdAt DESC
       LIMIT ?`,
      limit
    );

    if (!Array.isArray(rows)) return [];

    return rows.map((r) => {
      const countryCode = (r.countryCode || "UN").toUpperCase();
      return {
        id: Number(r.id),
        maskedIp: maskIpAddress(r.ip || ""),
        country: r.country || "International",
        countryCode,
        flagUrl: getCountryFlagImgUrl(countryCode),
        flagEmoji: getCountryFlagEmoji(countryCode),
        city: r.city || null,
        path: r.path || "/",
        timeAgo: formatTimeAgo(r.createdAt),
        createdAt: new Date(r.createdAt).toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch recent visitors:", error);
    return [];
  }
}

/**
 * Get complete overview of visitor analytics for Admin dashboard
 */
export async function getVisitorAnalyticsOverview(
  days = 7
): Promise<VisitorAnalyticsOverview> {
  const [
    totalPageviews,
    totalUniqueVisitors,
    todayPageviews,
    todayUniqueVisitors,
    trafficHistory,
    countryDistribution,
    recentVisitors,
  ] = await Promise.all([
    getTotalSiteVisits(),
    getTotalUniqueVisitors(),
    getTodayVisits(),
    getTodayUniqueVisitors(),
    getTrafficHistory(days),
    getCountryDistribution(30),
    getRecentVisitors(8),
  ]);

  const topCountry = countryDistribution[0]?.country || "Global";
  const countriesCount = countryDistribution.length;

  return {
    totalUniqueVisitors: Math.max(totalUniqueVisitors, todayUniqueVisitors),
    todayUniqueVisitors,
    totalPageviews,
    todayPageviews,
    topCountry,
    countriesCount,
    trafficHistory,
    countryDistribution,
    recentVisitors,
  };
}
