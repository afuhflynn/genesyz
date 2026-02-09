/**
 * Location Research Context
 * Builds context for AI agents based on location
 */

import type { LocationContext } from "./types";

export interface LocationResearchContext {
  searchQueryModifier: string;
  marketContext: string;
  regulatoryContext: string;
  culturalContext: string;
  economicContext: string;
  fallbackInstructions: string;
}

/**
 * Build research context for a location
 */
export function buildLocationResearchContext(
  location: LocationContext,
): LocationResearchContext {
  if (location.isGlobal) {
    return buildGlobalContext();
  }

  const baseContext: LocationResearchContext = {
    searchQueryModifier: buildSearchQueryModifier(location),
    marketContext: buildMarketContext(location),
    regulatoryContext: buildRegulatoryContext(location),
    culturalContext: buildCulturalContext(location),
    economicContext: buildEconomicContext(location),
    fallbackInstructions: buildFallbackInstructions(location),
  };

  return baseContext;
}

/**
 * Build search query modifier for location
 */
function buildSearchQueryModifier(location: LocationContext): string {
  if (location.isGlobal) {
    return "global market";
  }

  const parts: string[] = [];

  if (location.city) {
    parts.push(location.city);
  }

  if (location.region) {
    parts.push(location.region);
  }

  if (location.country) {
    parts.push(location.country);
  }

  if (parts.length === 0) {
    return "global market";
  }

  return parts.join(" ") + " market";
}

/**
 * Build market context for location
 */
function buildMarketContext(location: LocationContext): string {
  if (location.isGlobal) {
    return "Research should cover global market trends and international competitors.";
  }

  const contexts: string[] = [];

  contexts.push(
    `Primary target market: ${location.city || location.region || location.country}.`,
  );

  if (location.countryCode === "US") {
    contexts.push(
      "US market characteristics: Large addressable market, high competition, English-speaking, mature digital infrastructure.",
    );
  } else if (location.countryCode === "GB") {
    contexts.push(
      "UK market characteristics: Mature market, English-speaking, strong startup ecosystem, GDPR compliance required.",
    );
  } else if (
    location.countryCode === "NG" ||
    location.countryCode === "KE" ||
    location.countryCode === "GH" ||
    location.countryCode === "ZA"
  ) {
    contexts.push(
      `African market characteristics: Growing digital adoption, mobile-first, unique payment ecosystems, emerging market opportunities.`,
    );
  } else if (
    ["DE", "FR", "ES", "IT", "NL"].includes(location.countryCode || "")
  ) {
    contexts.push(
      "European market characteristics: GDPR compliance required, diverse languages, strong consumer protection, established economies.",
    );
  } else if (
    ["IN", "CN", "JP", "KR", "SG"].includes(location.countryCode || "")
  ) {
    contexts.push(
      "Asian market characteristics: High mobile penetration, unique digital ecosystems, diverse cultural considerations.",
    );
  }

  return contexts.join(" ");
}

/**
 * Build regulatory context for location
 */
function buildRegulatoryContext(location: LocationContext): string {
  if (location.isGlobal) {
    return "Consider major regulatory frameworks: GDPR (EU), CCPA (California), and other relevant regulations based on target markets.";
  }

  const regulations: string[] = [];

  if (location.countryCode === "US") {
    regulations.push(
      "US regulatory considerations: Industry-specific regulations vary by state. California CCPA for privacy. SEC regulations if fundraising.",
    );
  } else if (
    ["DE", "FR", "ES", "IT", "NL", "GB"].includes(location.countryCode || "")
  ) {
    regulations.push(
      "European regulatory considerations: GDPR mandatory for data handling. Strong consumer protection laws. May need local business registration.",
    );
  } else if (location.countryCode === "NG") {
    regulations.push(
      "Nigerian regulatory considerations: NDPR (Nigeria Data Protection Regulation) for data. CAC registration required. Industry-specific licenses may apply.",
    );
  } else if (location.countryCode === "KE") {
    regulations.push(
      "Kenyan regulatory considerations: Data Protection Act 2019. Business registration required. M-Pesa integration considerations for payments.",
    );
  }

  if (regulations.length === 0) {
    return `Research ${location.country} specific regulations for your industry, including data protection, business registration, and any sector-specific requirements.`;
  }

  return regulations.join(" ");
}

/**
 * Build cultural context for location
 */
function buildCulturalContext(location: LocationContext): string {
  if (location.isGlobal) {
    return "Design for global cultural sensitivity and localization capabilities.";
  }

  // Add cultural nuances for specific regions
  const culturalNotes: Record<string, string> = {
    US: "Direct communication style preferred. Individualistic culture. Mobile-first but desktop still significant for B2B.",
    NG: "Relationship-driven business culture. Mobile-first (Android dominant). Trust and reputation critical. Local language support valuable.",
    KE: "Tech-savvy population. Mobile money ecosystem (M-Pesa) deeply integrated. English and Swahili important.",
    GB: "Professional and polite communication. Quality and reliability highly valued. B2B decision-making can be conservative.",
    IN: "Price-sensitive market. Multiple languages important. Mobile-first. Trust-building through reviews and testimonials critical.",
  };

  const note = location.countryCode
    ? culturalNotes[location.countryCode]
    : null;

  if (note) {
    return `Cultural considerations: ${note}`;
  }

  return `Research cultural nuances for ${location.country}, including communication styles, consumer behavior, and local business practices.`;
}

/**
 * Build economic context for location
 */
function buildEconomicContext(location: LocationContext): string {
  if (location.isGlobal) {
    return "Consider varying economic conditions across target regions. Pricing strategy should accommodate different purchasing power.";
  }

  const contexts: string[] = [];

  contexts.push(`Currency: ${location.currency || "Research local currency"}.`);

  if (location.countryCode === "US") {
    contexts.push(
      "High purchasing power but also high customer acquisition costs. Subscription models work well.",
    );
  } else if (["NG", "KE", "GH", "IN"].includes(location.countryCode || "")) {
    contexts.push(
      "Emerging market with growing middle class. Price sensitivity high. Freemium or pay-as-you-go models often more successful than subscriptions.",
    );
  } else if (["DE", "FR", "GB"].includes(location.countryCode || "")) {
    contexts.push(
      "High purchasing power. Quality over price. Strong subscription economy. B2B budgets typically available.",
    );
  }

  return contexts.join(" ");
}

/**
 * Build fallback instructions for when location data is insufficient
 */
function buildFallbackInstructions(location: LocationContext): string {
  if (location.isGlobal) {
    return "Research global market data. If insufficient global data available, focus on major English-speaking markets (US, UK, Canada, Australia) as reference points.";
  }

  return `If insufficient data available for ${location.city || location.region || location.country}, expand search to ${location.country || "regional"} level, then to global markets. Always note data limitations in your analysis.`;
}

/**
 * Build global context
 */
function buildGlobalContext(): LocationResearchContext {
  return {
    searchQueryModifier: "global market worldwide",
    marketContext:
      "Global market research covering multiple regions and international competitors. Consider regional variations and localization requirements.",
    regulatoryContext:
      "Research must consider major regulatory frameworks: GDPR (EU), CCPA (California), and other relevant regulations. Compliance requirements vary by region.",
    culturalContext:
      "Design for cultural sensitivity and localization. Consider language support, regional preferences, and local business practices.",
    economicContext:
      "Global economic considerations with varying purchasing power across regions. Pricing strategy should accommodate different markets.",
    fallbackInstructions:
      "If global data is insufficient, research major markets (US, EU, China, India) and extrapolate trends. Note any regional variations.",
  };
}

/**
 * Format location context for AI prompt
 */
export function formatLocationForPrompt(
  context: LocationResearchContext,
): string {
  return `
## Location Context

**Search Focus:** ${context.searchQueryModifier}

**Market Context:**
${context.marketContext}

**Regulatory Context:**
${context.regulatoryContext}

**Cultural Context:**
${context.culturalContext}

**Economic Context:**
${context.economicContext}

**Research Strategy:**
${context.fallbackInstructions}
`.trim();
}

/**
 * Get location-specific search queries
 */
export function getLocationSearchQueries(
  baseQuery: string,
  location: LocationContext,
): string[] {
  const queries: string[] = [];

  // Location-specific query
  const locationModifier = buildSearchQueryModifier(location);
  queries.push(`${baseQuery} ${locationModifier}`);

  // Regional query (if city-level)
  if (location.city && location.country) {
    queries.push(`${baseQuery} ${location.country} market`);
  }

  // Always include global query as fallback
  queries.push(`${baseQuery} global market trends`);

  return queries;
}
