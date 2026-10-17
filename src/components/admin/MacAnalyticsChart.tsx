"use client";

import * as React from "react";
import { fetchVisitorAnalyticsAction } from "@/app/actions/setting-actions";
import type {
  DailyTrafficPoint,
  CountryTrafficStat,
  RecentVisitor,
  VisitorAnalyticsOverview,
} from "@/lib/analytics";
import {
  Globe,
  Calendar,
  TrendingUp,
  Activity,
  Layers,
  Users,
  ShieldCheck,
  Eye,
  MapPin,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

export interface MacAnalyticsChartProps {
  initialOverview?: VisitorAnalyticsOverview;
  initialData?: DailyTrafficPoint[];
  totalVisits?: number;
  todayVisits?: number;
}

function CountryFlagBadge({
  flagUrl,
  flagEmoji,
  country,
  countryCode,
}: {
  flagUrl: string | null;
  flagEmoji: string;
  country: string;
  countryCode: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="inline-flex items-center gap-1.5">
      {flagUrl && !imgError ? (
        <img
          src={flagUrl}
          alt={country}
          className="w-4.5 h-3 object-cover rounded-xs border border-zinc-200 dark:border-zinc-700 shadow-2xs shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-sm leading-none shrink-0" title={country}>
          {flagEmoji || "🌐"}
        </span>
      )}
      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[140px] sm:max-w-[180px]">
        {country}
      </span>
      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
        {countryCode}
      </span>
    </div>
  );
}

export function MacAnalyticsChart({
  initialOverview,
  initialData,
  totalVisits,
  todayVisits,
}: MacAnalyticsChartProps) {
  const [timeRange, setTimeRange] = React.useState<7 | 30 | 90>(7);
  const [metricView, setMetricView] = React.useState<"unique" | "pageviews">("unique");
  const [isLoading, setIsLoading] = React.useState(false);

  // Core telemetry state
  const [trafficData, setTrafficData] = React.useState<DailyTrafficPoint[]>(
    initialOverview?.trafficHistory ?? initialData ?? []
  );
  const [countries, setCountries] = React.useState<CountryTrafficStat[]>(
    initialOverview?.countryDistribution ?? []
  );
  const [recentVisitors, setRecentVisitors] = React.useState<RecentVisitor[]>(
    initialOverview?.recentVisitors ?? []
  );
  const [uniqueTotal, setUniqueTotal] = React.useState<number>(
    initialOverview?.totalUniqueVisitors ?? totalVisits ?? 0
  );
  const [uniqueToday, setUniqueToday] = React.useState<number>(
    initialOverview?.todayUniqueVisitors ?? todayVisits ?? 0
  );
  const [pageviewsTotal, setPageviewsTotal] = React.useState<number>(
    initialOverview?.totalPageviews ?? totalVisits ?? 0
  );
  const [pageviewsToday, setPageviewsToday] = React.useState<number>(
    initialOverview?.todayPageviews ?? todayVisits ?? 0
  );
  const [topCountry, setTopCountry] = React.useState<string>(
    initialOverview?.topCountry ?? "Global"
  );
  const [countriesCount, setCountriesCount] = React.useState<number>(
    initialOverview?.countriesCount ?? 0
  );

  // Interactive tooltip state
  const [hoveredPoint, setHoveredPoint] = React.useState<DailyTrafficPoint | null>(null);
  const [hoverX, setHoverX] = React.useState<number | null>(null);

  // Range change handler
  const handleRangeChange = async (days: 7 | 30 | 90) => {
    if (days === timeRange && !isLoading) return;
    setTimeRange(days);
    setIsLoading(true);
    try {
      const res = await fetchVisitorAnalyticsAction(days);
      if (res) {
        setTrafficData(res.trafficHistory);
        setCountries(res.countryDistribution);
        setRecentVisitors(res.recentVisitors);
        setUniqueTotal(res.totalUniqueVisitors);
        setUniqueToday(res.todayUniqueVisitors);
        setPageviewsTotal(res.totalPageviews);
        setPageviewsToday(res.todayPageviews);
        setTopCountry(res.topCountry);
        setCountriesCount(res.countriesCount);
      }
    } catch (err) {
      console.error("Failed to fetch visitor analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculations for graph geometry based on active metric view
  const values = trafficData.map((d) =>
    metricView === "unique" ? d.count : (d.pageviews ?? d.count)
  );
  const maxVal = Math.max(...values, 5); // At least 5 for scale
  const rangeSum = values.reduce((a, b) => a + b, 0);
  const avgPerDay =
    trafficData.length > 0 ? (rangeSum / trafficData.length).toFixed(1) : "0";
  const peakVal = Math.max(...values, 0);

  // SVG dimensions
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Calculate coordinates for points
  const points = trafficData.map((item, idx) => {
    const val = metricView === "unique" ? item.count : (item.pageviews ?? item.count);
    const x = paddingX + (idx / Math.max(trafficData.length - 1, 1)) * chartW;
    const y = paddingY + chartH - (val / maxVal) * chartH;
    return { x, y, item, val };
  });

  // Construct smooth bezier SVG path
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Area path for gradient fill underneath
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`
      : "";

  return (
    <div className="space-y-6">
      {/* Sleek Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Unique Visitors */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 p-5 shadow-xs backdrop-blur-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Unique Visitors
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {uniqueTotal.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Filtered for unique IPs</span>
          </div>
        </div>

        {/* Unique Visitors Today */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 p-5 shadow-xs backdrop-blur-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Visitors Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {uniqueToday.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live unique visitors today</span>
          </div>
        </div>

        {/* Total Pageviews */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 p-5 shadow-xs backdrop-blur-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Total Pageviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {pageviewsTotal.toLocaleString()}
          </p>
          <div className="mt-2 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
            <span>{pageviewsToday.toLocaleString()} views today</span>
            <span className="text-[10px] text-zinc-400">Cumulative</span>
          </div>
        </div>

        {/* Geographic Reach / Top Country */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 p-5 shadow-xs backdrop-blur-md transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Top Country
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            {topCountry}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{countriesCount > 0 ? `${countriesCount} countries active` : "Global reach"}</span>
          </div>
        </div>
      </div>

      {/* Main Line Chart Surface with Window Controls */}
      <div className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {/* Window Header */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block border border-red-600/30" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/30" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/30" />
            </div>

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 mx-1" />

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Site Traffic Trend
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                • {timeRange} Days
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Toggle: Unique Visitors vs Total Pageviews */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setMetricView("unique")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] ${
                  metricView === "unique"
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Unique</span>
              </button>
              <button
                type="button"
                onClick={() => setMetricView("pageviews")}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] ${
                  metricView === "pageviews"
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Pageviews</span>
              </button>
            </div>

            {/* Segmented Time-Range Filter Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleRangeChange(7)}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  timeRange === 7
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange(30)}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  timeRange === 30
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                30D
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange(90)}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  timeRange === 90
                    ? "bg-white dark:bg-zinc-950 text-black dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
              >
                90D
              </button>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="p-6 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-2xs flex items-center justify-center z-20">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Updating telemetry...</span>
              </div>
            </div>
          )}

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-30 transform -translate-x-1/2 py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-xl font-mono text-xs border border-white/10 dark:border-black/10 transition-all"
              style={{
                left: hoverX !== null ? `${hoverX}px` : "50%",
                top: "30px",
              }}
            >
              <p className="text-[10px] opacity-70 border-b border-white/10 dark:border-black/10 pb-1 mb-1">
                {hoveredPoint.date} ({hoveredPoint.label})
              </p>
              <div className="space-y-0.5">
                <p className="font-bold text-sm">
                  {hoveredPoint.count} Unique Visitors
                </p>
                <p className="text-[11px] opacity-80">
                  {hoveredPoint.pageviews ?? hoveredPoint.count} Pageviews
                </p>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => {
                setHoveredPoint(null);
                setHoverX(null);
              }}
            >
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + chartH * (1 - ratio);
                const labelVal = Math.round(maxVal * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800/80 stroke-dasharray-[3_3]"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-zinc-400 dark:fill-zinc-600"
                    >
                      {labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              {areaD && (
                <path
                  d={areaD}
                  fill="url(#trafficGradient)"
                  className="text-zinc-900 dark:text-zinc-100 transition-all duration-300"
                />
              )}

              {/* Main Line Curve */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-zinc-900 dark:text-zinc-100 transition-all duration-300"
                />
              )}

              {/* Data Points & Hover Targets */}
              {points.map((pt, i) => {
                const isHovered = hoveredPoint?.date === pt.item.date;
                const step = timeRange === 90 ? 12 : timeRange === 30 ? 5 : 1;
                const showLabel = i % step === 0 || i === points.length - 1;

                return (
                  <g key={pt.item.date}>
                    {/* Hover Vertical Guide Line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={paddingY + chartH}
                        stroke="currentColor"
                        className="text-zinc-400 dark:text-zinc-600"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Interactive Invisible Target */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={timeRange === 90 ? 8 : 12}
                      className="fill-transparent cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredPoint(pt.item);
                        const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                        if (rect) {
                          setHoverX(pt.x * (rect.width / width));
                        }
                      }}
                    />

                    {/* Visual Dot */}
                    {(isHovered || timeRange === 7) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : 3.5}
                        className={`transition-all ${
                          isHovered
                            ? "fill-white dark:fill-black stroke-black dark:stroke-white stroke-[2.5]"
                            : "fill-black dark:fill-white"
                        }`}
                      />
                    )}

                    {/* Date label at bottom */}
                    {showLabel && (
                      <text
                        x={pt.x}
                        y={height - 8}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-zinc-400 dark:fill-zinc-500"
                      >
                        {pt.item.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Grid: Country Distribution & Recent Visitors Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Geographic Country Distribution (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-4">
            <div>
              <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Traffic by Country</span>
              </h2>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Resolved via visitor IP location
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium border border-zinc-200 dark:border-zinc-800">
              {countries.length} Regions
            </span>
          </div>

          {countries.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-400">
              <Globe className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-1" />
              <span>Awaiting incoming visitor location telemetry</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {countries.map((c, idx) => (
                <div key={c.countryCode + idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <CountryFlagBadge
                      flagUrl={c.flagUrl}
                      flagEmoji={c.flagEmoji}
                      country={c.country}
                      countryCode={c.countryCode}
                    />
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.uniqueVisitors.toLocaleString()}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400 w-9 text-right">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(c.percentage, 4))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Visitors Activity Table (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-4">
            <div>
              <h2 className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Recent Visitor Activity</span>
              </h2>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Real-time stream with duplicate IP filtering
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>

          {recentVisitors.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-400">
              <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-1" />
              <span>No visitor events logged yet</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Country</th>
                    <th className="pb-2 font-semibold">City / Network</th>
                    <th className="pb-2 font-semibold">Visitor IP</th>
                    <th className="pb-2 font-semibold">Route</th>
                    <th className="pb-2 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/70 dark:divide-zinc-900/70">
                  {recentVisitors.map((v) => (
                    <tr
                      key={v.id}
                      className="group hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Country with Flag */}
                      <td className="py-2.5 pr-2 whitespace-nowrap">
                        <CountryFlagBadge
                          flagUrl={v.flagUrl}
                          flagEmoji={v.flagEmoji}
                          country={v.country}
                          countryCode={v.countryCode}
                        />
                      </td>

                      {/* City */}
                      <td className="py-2.5 pr-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap max-w-[100px] truncate">
                        {v.city || "—"}
                      </td>

                      {/* Masked IP Address */}
                      <td className="py-2.5 pr-2 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/70 dark:border-zinc-800/70">
                          {v.maskedIp}
                        </span>
                      </td>

                      {/* Visited Path */}
                      <td className="py-2.5 pr-2 text-zinc-500 whitespace-nowrap max-w-[110px] truncate">
                        <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                          {v.path}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-2.5 text-right text-zinc-400 whitespace-nowrap text-[11px]">
                        {v.timeAgo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export aliases for clean backward compatibility
export const SiteTrafficTrend = MacAnalyticsChart;
