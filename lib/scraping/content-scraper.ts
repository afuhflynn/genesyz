/**
 * Content Scraper
 * Scrapes and extracts content from URLs using webfetch
 */

import { webfetch } from "@/lib/ai/webfetch";
import type { ExtractedUrl } from "./url-extractor";

export interface ScrapedContent {
  url: string;
  title: string | null;
  description: string | null;
  content: string;
  metadata: {
    contentType?: string;
    lastModified?: string;
    author?: string;
    keywords?: string[];
    wordCount: number;
    readingTimeMinutes: number;
    hasImages: boolean;
    hasVideos: boolean;
  };
  status: "success" | "error";
  error?: string;
  scrapedAt: Date;
}

export interface ScrapeOptions {
  maxLength?: number; // Maximum content length to extract
  includeImages?: boolean;
  timeout?: number; // Request timeout in ms
  userAgent?: string;
  retryCount?: number;
}

const DEFAULT_OPTIONS: ScrapeOptions = {
  maxLength: 10000,
  includeImages: false,
  timeout: 30000,
  retryCount: 2,
};

/**
 * Scrape content from a single URL
 */
export async function scrapeUrl(
  url: string,
  options: ScrapeOptions = {},
): Promise<ScrapedContent> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Validate URL first
    const urlObj = new URL(url);

    // Fetch content using webfetch
    const content = await webfetch(url, {
      maxLength: opts.maxLength,
      timeout: opts.timeout,
    });

    // Extract metadata from content
    const metadata = extractMetadata(content, url);

    return {
      url,
      title: metadata.title,
      description: metadata.description,
      content: cleanContent(content),
      metadata: {
        contentType: "text/html",
        wordCount: countWords(content),
        readingTimeMinutes: estimateReadingTime(content),
        hasImages: content.includes("<img") || content.includes("!["),
        hasVideos:
          content.includes("<video") || content.includes("youtube.com/embed"),
        ...metadata,
      },
      status: "success",
      scrapedAt: new Date(),
    };
  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error);

    return {
      url,
      title: null,
      description: null,
      content: "",
      metadata: {
        wordCount: 0,
        readingTimeMinutes: 0,
        hasImages: false,
        hasVideos: false,
      },
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      scrapedAt: new Date(),
    };
  }
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeUrls(
  urls: ExtractedUrl[],
  options: ScrapeOptions = {},
): Promise<ScrapedContent[]> {
  // Filter only valid URLs
  const validUrls = urls.filter((u) => u.isValid);

  if (validUrls.length === 0) {
    return [];
  }

  // Scrape in parallel with concurrency limit
  const CONCURRENCY_LIMIT = 3;
  const results: ScrapedContent[] = [];

  for (let i = 0; i < validUrls.length; i += CONCURRENCY_LIMIT) {
    const batch = validUrls.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(
      batch.map((url) => scrapeUrl(url.normalizedUrl, options)),
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(
  content: string,
  url: string,
): {
  title: string | null;
  description: string | null;
  author?: string;
  keywords?: string[];
} {
  const metadata: {
    title: string | null;
    description: string | null;
    author?: string;
    keywords?: string[];
  } = {
    title: null,
    description: null,
  };

  try {
    // Extract title
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      metadata.title = decodeHtmlEntities(titleMatch[1].trim());
    }

    // Extract meta description
    const descMatch = content.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    );
    if (descMatch) {
      metadata.description = decodeHtmlEntities(descMatch[1].trim());
    }

    // Extract OG description if no meta description
    if (!metadata.description) {
      const ogDescMatch = content.match(
        /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
      );
      if (ogDescMatch) {
        metadata.description = decodeHtmlEntities(ogDescMatch[1].trim());
      }
    }

    // Extract author
    const authorMatch = content.match(
      /<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    );
    if (authorMatch) {
      metadata.author = decodeHtmlEntities(authorMatch[1].trim());
    }

    // Extract keywords
    const keywordsMatch = content.match(
      /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i,
    );
    if (keywordsMatch) {
      metadata.keywords = keywordsMatch[1]
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    }
  } catch (error) {
    console.error("Error extracting metadata:", error);
  }

  return metadata;
}

/**
 * Clean extracted content
 */
function cleanContent(content: string): string {
  if (!content) return "";

  return (
    content
      // Remove scripts
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      // Remove styles
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove nav and footer
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      // Convert headers to markdown
      .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, "### $1\n\n")
      // Convert paragraphs
      .replace(/<p[^>]*>([^<]*)<\/p>/gi, "$1\n\n")
      // Convert lists
      .replace(/<li[^>]*>([^<]*)<\/li>/gi, "- $1\n")
      // Convert links
      .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi, "[$2]($1)")
      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, "")
      // Decode HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&#\d+;/g, (match) => {
        const code = parseInt(match.replace(/&#/, "").replace(/;/, ""));
        return String.fromCharCode(code);
      })
      // Normalize whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return "";

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ");
}

/**
 * Count words in content
 */
function countWords(content: string): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).length;
}

/**
 * Estimate reading time in minutes
 */
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = countWords(content);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Summarize scraped content for AI context
 */
export function summarizeContent(
  scrapedContents: ScrapedContent[],
  maxTotalLength: number = 5000,
): string {
  if (scrapedContents.length === 0) {
    return "";
  }

  let summary = "## Scraped URL Content\n\n";
  let currentLength = summary.length;

  for (const content of scrapedContents) {
    if (content.status !== "success" || !content.content) {
      continue;
    }

    const urlSection = `### ${content.title || content.url}\n`;
    const description = content.description
      ? `**Description:** ${content.description}\n\n`
      : "";

    // Calculate how much content we can include
    const remainingSpace =
      maxTotalLength -
      currentLength -
      urlSection.length -
      description.length -
      100;
    const contentExcerpt =
      remainingSpace > 0
        ? content.content.substring(0, remainingSpace) +
          (content.content.length > remainingSpace ? "..." : "")
        : "";

    const section = `${urlSection}${description}${contentExcerpt}\n\n`;

    if (currentLength + section.length > maxTotalLength) {
      summary += "_Additional URLs truncated for length..._\n";
      break;
    }

    summary += section;
    currentLength += section.length;
  }

  return summary.trim();
}

/**
 * Retry scraping with exponential backoff
 */
export async function scrapeWithRetry(
  url: string,
  options: ScrapeOptions = {},
  retries: number = 2,
): Promise<ScrapedContent> {
  let lastError: Error | undefined;

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await scrapeUrl(url, options);
      if (result.status === "success") {
        return result;
      }

      // If failed but we have retries left, wait and try again
      if (i < retries) {
        const delay = 2 ** i * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (i < retries) {
        const delay = 2 ** i * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    url,
    title: null,
    description: null,
    content: "",
    metadata: {
      wordCount: 0,
      readingTimeMinutes: 0,
      hasImages: false,
      hasVideos: false,
    },
    status: "error",
    error: lastError?.message || "Failed after retries",
    scrapedAt: new Date(),
  };
}
