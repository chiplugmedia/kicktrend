/**
 * Utilities for resolving visitor IP addresses and Geographic Location
 */

const ipCache = new Map<string, { country: string; countryCode: string; city?: string | null }>();

// Seed with localhost/private entries
ipCache.set("127.0.0.1", { country: "Local Network", countryCode: "LOC", city: "Localhost" });
ipCache.set("::1", { country: "Local Network", countryCode: "LOC", city: "Localhost" });
ipCache.set("localhost", { country: "Local Network", countryCode: "LOC", city: "Localhost" });

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/, "").trim();
  if (clean === "127.0.0.1" || clean === "::1" || clean === "localhost") return true;
  if (clean.startsWith("10.") || clean.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(clean)) return true;
  if (clean.startsWith("fe80:") || clean.startsWith("fc00:")) return true;
  return false;
}

export function extractClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const cfIp = headersList.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  const clientIp = headersList.get("x-client-ip");
  if (clientIp?.trim()) return clientIp.trim();

  return "127.0.0.1";
}

export async function resolveLocationFromIp(
  ip: string,
  headersList?: Headers
): Promise<{ country: string; countryCode: string; city: string | null }> {
  const cleanIp = ip.replace(/^::ffff:/, "").trim();

  // 1. Check in-memory cache
  if (ipCache.has(cleanIp)) {
    const cached = ipCache.get(cleanIp)!;
    return { country: cached.country, countryCode: cached.countryCode, city: cached.city || null };
  }

  // 2. Check edge headers if hosted on Vercel / Cloudflare
  if (headersList) {
    const edgeCountryCode =
      headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry");
    const edgeCity = headersList.get("x-vercel-ip-city");

    if (edgeCountryCode && edgeCountryCode !== "XX") {
      const code = edgeCountryCode.toUpperCase();
      const countryName = getCountryNameFromCode(code);
      const res = { country: countryName, countryCode: code, city: edgeCity || null };
      ipCache.set(cleanIp, res);
      return res;
    }
  }

  // 3. Local/private IP check
  if (isPrivateIp(cleanIp)) {
    const res = { country: "Local Network", countryCode: "LOC", city: "Localhost" };
    ipCache.set(cleanIp, res);
    return res;
  }

  // 4. External IP-to-Geo lookup with strict 1.2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,city`, {
      signal: controller.signal,
      cache: "force-cache",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success" && data.countryCode) {
        const result = {
          country: data.country || getCountryNameFromCode(data.countryCode),
          countryCode: data.countryCode.toUpperCase(),
          city: data.city || null,
        };
        ipCache.set(cleanIp, result);
        return result;
      }
    }
  } catch {
    // Timeout or network error: fallback gracefully without crashing
  }

  const fallback = { country: "International", countryCode: "UN", city: null };
  ipCache.set(cleanIp, fallback);
  return fallback;
}

export function getCountryFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2 || countryCode === "XX" || countryCode === "UN" || countryCode === "LOC") {
    return "🌐";
  }
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getCountryFlagImgUrl(countryCode: string): string | null {
  if (!countryCode || countryCode.length !== 2 || countryCode === "XX" || countryCode === "UN" || countryCode === "LOC") {
    return null;
  }
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

export function maskIpAddress(ip: string): string {
  if (!ip) return "Unknown";
  if (isPrivateIp(ip)) return ip;
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (ip.includes(":")) {
    const segments = ip.split(":");
    return `${segments[0]}:${segments[1]}::****`;
  }
  return ip;
}

const COMMON_COUNTRIES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  AU: "Australia",
  NG: "Nigeria",
  IN: "India",
  BR: "Brazil",
  NL: "Netherlands",
  SG: "Singapore",
  ZA: "South Africa",
  KE: "Kenya",
  GH: "Ghana",
  ES: "Spain",
  IT: "Italy",
  SE: "Sweden",
  CH: "Switzerland",
  AE: "United Arab Emirates",
  LOC: "Local Network",
  UN: "International",
};

export function getCountryNameFromCode(code: string): string {
  const upper = (code || "").toUpperCase();
  if (COMMON_COUNTRIES[upper]) return COMMON_COUNTRIES[upper];
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(upper) || upper;
  } catch {
    return upper;
  }
}
