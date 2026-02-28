/**
 * URL Extraction Utility
 * Extracts and validates URLs from text content
 */

// Comprehensive URL regex that matches most common URL formats
const URL_REGEX =
  /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;

// More strict regex for validation
const STRICT_URL_REGEX =
  /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

// Common URL shorteners and tracking domains to potentially expand
const SHORTENED_DOMAINS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "buff.ly",
  "short.link",
];

export interface ExtractedUrl {
  url: string;
  normalizedUrl: string;
  isValid: boolean;
  domain: string;
  isShortened: boolean;
  context?: string; // Surrounding text for context
}

/**
 * Extract all URLs from text content
 */
export function extractUrls(text: string): ExtractedUrl[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const matches = text.match(URL_REGEX);
  if (!matches) {
    return [];
  }

  const extractedUrls: ExtractedUrl[] = [];
  const seenUrls = new Set<string>();

  for (const match of matches) {
    const normalized = normalizeUrl(match);

    // Skip duplicates
    if (seenUrls.has(normalized)) {
      continue;
    }
    seenUrls.add(normalized);

    const domain = extractDomain(normalized);
    const isShortened = SHORTENED_DOMAINS.some(
      (short) => domain === short || domain.endsWith(`.${short}`),
    );

    // Get context (50 chars before and after)
    const index = text.indexOf(match);
    const contextStart = Math.max(0, index - 50);
    const contextEnd = Math.min(text.length, index + match.length + 50);
    const context = text.substring(contextStart, contextEnd).trim();

    extractedUrls.push({
      url: match,
      normalizedUrl: normalized,
      isValid: isValidUrl(normalized),
      domain,
      isShortened,
      context: context !== match ? context : undefined,
    });
  }

  return extractedUrls;
}

/**
 * Normalize a URL (add protocol, clean up)
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add protocol if missing
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slashes for consistency
  normalized = normalized.replace(/\/$/, "");

  // Remove common tracking parameters
  const urlObj = new URL(normalized);
  const trackingParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
  ];

  trackingParams.forEach((param) => {
    urlObj.searchParams.delete(param);
  });

  return urlObj.toString();
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // Must have http or https protocol
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return false;
    }

    // Must have a valid hostname
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return false;
    }

    // Must have a valid TLD (at least one dot in hostname)
    if (!urlObj.hostname.includes(".")) {
      return false;
    }

    // Additional regex validation
    if (!STRICT_URL_REGEX.test(url)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

/**
 * Check if URL is from a common social media platform
 */
export function isSocialMediaUrl(url: string): boolean {
  const domain = extractDomain(url).toLowerCase();
  const socialDomains = [
    "twitter.com",
    "x.com",
    "facebook.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "tiktok.com",
  ];

  return socialDomains.some(
    (social) => domain === social || domain.endsWith(`.${social}`),
  );
}

/**
 * Check if URL is likely a documentation/resource page
 */
export function isDocumentationUrl(url: string): boolean {
  const docKeywords = [
    "docs.",
    "documentation",
    "wiki",
    "help.",
    "support.",
    "api.",
  ];
  const lowerUrl = url.toLowerCase();

  return docKeywords.some((keyword) => lowerUrl.includes(keyword));
}

/**
 * Extract URLs from multiple text sources
 */
export function extractUrlsFromSources(sources: {
  text?: string;
  transcription?: string;
  ocrText?: string;
}): ExtractedUrl[] {
  const allUrls: ExtractedUrl[] = [];
  const seenUrls = new Set<string>();

  // Extract from each source
  const texts = [sources.text, sources.transcription, sources.ocrText].filter(
    (t): t is string => typeof t === "string" && t.length > 0,
  );

  for (const text of texts) {
    const urls = extractUrls(text);
    for (const url of urls) {
      if (!seenUrls.has(url.normalizedUrl)) {
        seenUrls.add(url.normalizedUrl);
        allUrls.push(url);
      }
    }
  }

  return allUrls;
}

/**
 * Filter URLs by type/purpose
 */
export function filterUrls(
  urls: ExtractedUrl[],
  options: {
    includeSocial?: boolean;
    includeDocs?: boolean;
    onlyValid?: boolean;
    maxUrls?: number;
  } = {},
): ExtractedUrl[] {
  let filtered = [...urls];

  if (options.onlyValid !== false) {
    filtered = filtered.filter((u) => u.isValid);
  }

  if (options.includeSocial === false) {
    filtered = filtered.filter((u) => !isSocialMediaUrl(u.normalizedUrl));
  }

  if (options.includeDocs === false) {
    filtered = filtered.filter((u) => !isDocumentationUrl(u.normalizedUrl));
  }

  if (options.maxUrls && options.maxUrls > 0) {
    filtered = filtered.slice(0, options.maxUrls);
  }

  return filtered;
}

/**
 * Get unique domains from URLs
 */
export function getUniqueDomains(urls: ExtractedUrl[]): string[] {
  const domains = new Set(urls.map((u) => u.domain));
  return Array.from(domains).filter((d) => d.length > 0);
}

/**
 * Coerce unknown URL-like values to normalized string URLs.
 * Keeps only valid, non-empty, deduplicated strings.
 */
export function sanitizeUrlStrings(input: unknown[]): string[] {
  const normalizedUrls: string[] = [];

  for (const value of input) {
    let candidate: string | null = null;

    if (typeof value === "string") {
      candidate = value;
    } else if (value instanceof URL) {
      candidate = value.toString();
    } else if (value && typeof value === "object") {
      const maybeRecord = value as Record<string, unknown>;
      const normalizedUrl = maybeRecord.normalizedUrl;
      const url = maybeRecord.url;

      if (typeof normalizedUrl === "string") {
        candidate = normalizedUrl;
      } else if (normalizedUrl instanceof URL) {
        candidate = normalizedUrl.toString();
      } else if (typeof url === "string") {
        candidate = url;
      } else if (url instanceof URL) {
        candidate = url.toString();
      }
    }

    if (!candidate) continue;

    const trimmed = candidate.trim();
    if (!trimmed) continue;

    try {
      const normalized = normalizeUrl(trimmed);
      if (isValidUrl(normalized)) {
        normalizedUrls.push(normalized);
      }
    } catch {
      // ignore malformed URL candidates
    }
  }

  return Array.from(new Set(normalizedUrls));
}
