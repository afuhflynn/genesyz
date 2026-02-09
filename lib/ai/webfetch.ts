/**
 * Web Fetch Utility
 * Fetches and extracts content from URLs
 */

import axios from "axios";

interface WebFetchOptions {
  maxLength?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

/**
 * Fetch content from a URL
 */
export async function webfetch(
  url: string,
  options: WebFetchOptions = {},
): Promise<string> {
  const { maxLength = 10000, timeout = 30000, headers = {} } = options;

  try {
    const response = await axios.get(url, {
      headers: {
        ...DEFAULT_HEADERS,
        ...headers,
      },
      timeout,
      maxContentLength: maxLength * 2, // Allow some overhead
      responseType: "text",
      // Follow redirects
      maxRedirects: 5,
      // Validate status
      validateStatus: (status) => status >= 200 && status < 300,
    });

    let content = response.data;

    // If content is not a string, convert it
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }

    // Truncate if too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + "...";
    }

    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error(`Request timeout for ${url}`);
      }
      if (error.response) {
        throw new Error(
          `HTTP ${error.response.status}: ${error.response.statusText} for ${url}`,
        );
      }
      if (error.request) {
        throw new Error(`Network error: Could not reach ${url}`);
      }
    }
    throw error;
  }
}

/**
 * Check if a URL is reachable
 */
export async function isUrlReachable(
  url: string,
  timeout: number = 5000,
): Promise<boolean> {
  try {
    await axios.head(url, {
      timeout,
      maxRedirects: 3,
      headers: DEFAULT_HEADERS,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get content type from URL
 */
export async function getContentType(url: string): Promise<string | null> {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      maxRedirects: 3,
      headers: DEFAULT_HEADERS,
    });
    return response.headers["content-type"] || null;
  } catch {
    return null;
  }
}
