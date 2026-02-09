/**
 * Location Detector
 * Detects location from IP address and text content
 */

import type {
  DetectedLocation,
  LocationContext,
  LocationSuggestion,
} from "./types";

// Common country codes mapping
const COUNTRY_CODES: Record<string, string> = {
  "united states": "US",
  usa: "US",
  us: "US",
  america: "US",
  "united kingdom": "GB",
  uk: "GB",
  britain: "GB",
  england: "GB",
  canada: "CA",
  australia: "AU",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  brazil: "BR",
  india: "IN",
  china: "CN",
  japan: "JP",
  "south korea": "KR",
  singapore: "SG",
  "hong kong": "HK",
  mexico: "MX",
  nigeria: "NG",
  "south africa": "ZA",
  kenya: "KE",
  ghana: "GH",
  ethiopia: "ET",
  egypt: "EG",
  morocco: "MA",
  tanzania: "TZ",
  uganda: "UG",
  algeria: "DZ",
  sudan: "SD",
};

// Country to currency mapping
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BR: "BRL",
  IN: "INR",
  CN: "CNY",
  JP: "JPY",
  KR: "KRW",
  SG: "SGD",
  HK: "HKD",
  MX: "MXN",
  NG: "NGN",
  ZA: "ZAR",
  KE: "KES",
  GH: "GHS",
  ET: "ETB",
  EG: "EGP",
  MA: "MAD",
  TZ: "TZS",
  UG: "UGX",
  DZ: "DZD",
  SD: "SDG",
};

// Country to timezone mapping (primary timezone)
const COUNTRY_TIMEZONE: Record<string, string> = {
  US: "America/New_York",
  GB: "Europe/London",
  CA: "America/Toronto",
  AU: "Australia/Sydney",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  ES: "Europe/Madrid",
  IT: "Europe/Rome",
  NL: "Europe/Amsterdam",
  BR: "America/Sao_Paulo",
  IN: "Asia/Kolkata",
  CN: "Asia/Shanghai",
  JP: "Asia/Tokyo",
  KR: "Asia/Seoul",
  SG: "Asia/Singapore",
  HK: "Asia/Hong_Kong",
  MX: "America/Mexico_City",
  NG: "Africa/Lagos",
  ZA: "Africa/Johannesburg",
  KE: "Africa/Nairobi",
  GH: "Africa/Accra",
  ET: "Africa/Addis_Ababa",
  EG: "Africa/Cairo",
  MA: "Africa/Casablanca",
  TZ: "Africa/Dar_es_Salaam",
  UG: "Africa/Kampala",
  DZ: "Africa/Algiers",
  SD: "Africa/Khartoum",
};

/**
 * Detect location from IP address using a geolocation service
 * In production, this would use a service like MaxMind, ipapi.co, or similar
 */
export async function detectLocationFromIp(
  ipAddress?: string,
): Promise<DetectedLocation | null> {
  try {
    // For development/testing, return null or mock data
    // In production, integrate with a geolocation API

    if (
      !ipAddress ||
      ipAddress === "127.0.0.1" ||
      ipAddress.startsWith("192.168.")
    ) {
      return null; // Local IPs can't be geolocated
    }

    // Example integration (commented out - implement with actual service):
    // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    // const data = await response.json();
    // return {
    //   ip: ipAddress,
    //   context: {
    //     country: data.country_name,
    //     countryCode: data.country_code,
    //     region: data.region,
    //     city: data.city,
    //     timezone: data.timezone,
    //     isGlobal: false,
    //   },
    //   detectionMethod: "ip",
    //   confidence: 0.8,
    // };

    // For now, return null - implement actual IP geolocation service
    return null;
  } catch (error) {
    console.error("Error detecting location from IP:", error);
    return null;
  }
}

/**
 * Detect location mentions in text
 */
export function detectLocationFromText(text: string): LocationSuggestion[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lowerText = text.toLowerCase();
  const suggestions: LocationSuggestion[] = [];

  // Check for country mentions
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lowerText.includes(name)) {
      const suggestion = createLocationSuggestion(name, code);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }

  // Check for city/region patterns (basic)
  const cityPatterns = [
    /in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),?\s*(?:USA?|United States|America)/i,
    /in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),?\s*(?:UK|United Kingdom|Britain)/i,
    /based\s+in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /located\s+in\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i,
    /targeting?\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+market/i,
  ];

  for (const pattern of cityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cityName = match[1];
      // Try to determine country from context
      const countryCode = inferCountryFromContext(text, cityName);

      if (countryCode) {
        const suggestion = createLocationSuggestion(
          `${cityName}, ${countryCode}`,
          countryCode,
          cityName,
        );
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }
  }

  // Remove duplicates
  const uniqueUrls = new Set<string>();
  return suggestions.filter((s) => {
    if (uniqueUrls.has(s.name)) {
      return false;
    }
    uniqueUrls.add(s.name);
    return true;
  });
}

/**
 * Infer country from context text
 */
function inferCountryFromContext(text: string, city: string): string | null {
  const lowerText = text.toLowerCase();

  // Check for country context near the city
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lowerText.includes(name)) {
      return code;
    }
  }

  // Default to US for major US cities (simplified)
  const majorUsCities = [
    "new york",
    "los angeles",
    "chicago",
    "houston",
    "phoenix",
    "philadelphia",
    "san antonio",
    "san diego",
    "dallas",
    "san jose",
    "austin",
    "jacksonville",
    "san francisco",
    "columbus",
    "charlotte",
    "seattle",
    "denver",
    "washington",
    "boston",
    "nashville",
  ];

  if (majorUsCities.includes(city.toLowerCase())) {
    return "US";
  }

  return null;
}

/**
 * Create a location suggestion from detected data
 */
function createLocationSuggestion(
  name: string,
  countryCode: string,
  city?: string,
): LocationSuggestion | null {
  const upperCode = countryCode.toUpperCase();

  if (
    !COUNTRY_CODES[name.toLowerCase()] &&
    !COUNTRY_CODES[countryCode.toLowerCase()]
  ) {
    // Unknown country
    return null;
  }

  const countryName = getCountryName(upperCode);

  return {
    name: city ? `${city}, ${countryName}` : countryName,
    context: {
      country: countryName,
      countryCode: upperCode,
      city: city,
      timezone: COUNTRY_TIMEZONE[upperCode],
      currency: COUNTRY_CURRENCY[upperCode],
      isGlobal: false,
    },
    confidence: city ? 0.7 : 0.6,
    type: city ? "exact" : "regional",
  };
}

/**
 * Get full country name from code
 */
function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    NL: "Netherlands",
    BR: "Brazil",
    IN: "India",
    CN: "China",
    JP: "Japan",
    KR: "South Korea",
    SG: "Singapore",
    HK: "Hong Kong",
    MX: "Mexico",
    NG: "Nigeria",
    ZA: "South Africa",
    KE: "Kenya",
    GH: "Ghana",
    ET: "Ethiopia",
    EG: "Egypt",
    MA: "Morocco",
    TZ: "Tanzania",
    UG: "Uganda",
    DZ: "Algeria",
    SD: "Sudan",
  };

  return countryNames[code] || code;
}

/**
 * Get global location context
 */
export function getGlobalLocation(): LocationContext {
  return {
    country: "Global",
    countryCode: "GLOBAL",
    isGlobal: true,
  };
}

/**
 * Format location for display
 */
export function formatLocation(context: LocationContext): string {
  if (context.isGlobal) {
    return "Global";
  }

  if (context.city && context.country) {
    return `${context.city}, ${context.country}`;
  }

  if (context.country) {
    return context.country;
  }

  return "Unknown Location";
}

/**
 * Get location search suggestions
 */
export function getLocationSearchSuggestions(
  query: string,
): LocationSuggestion[] {
  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const suggestions: LocationSuggestion[] = [];

  // Search countries
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (name.includes(lowerQuery)) {
      const suggestion = createLocationSuggestion(name, code);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }
  }

  // Limit results
  return suggestions.slice(0, 10);
}

/**
 * Detect best location from multiple sources
 * Priority: user_input > text_analysis > ip_detection > global
 */
export async function detectBestLocation(options: {
  userInput?: string;
  textContent?: string;
  ipAddress?: string;
}): Promise<DetectedLocation> {
  const { userInput, textContent, ipAddress } = options;

  // 1. Check user input first
  if (userInput) {
    const validation = await validateLocation(userInput);
    if (validation.isValid) {
      return {
        context: validation.context,
        detectionMethod: "user_input",
        confidence: 0.95,
      };
    }
  }

  // 2. Try IP detection
  if (ipAddress) {
    const ipLocation = await detectLocationFromIp(ipAddress);
    if (ipLocation) {
      return ipLocation;
    }
  }

  // 3. Analyze text content
  if (textContent) {
    const textLocations = detectLocationFromText(textContent);
    if (textLocations.length > 0) {
      // Use highest confidence suggestion
      const best = textLocations.reduce((prev, current) =>
        current.confidence > prev.confidence ? current : prev,
      );

      return {
        context: best.context,
        detectionMethod: "text",
        confidence: best.confidence,
      };
    }
  }

  // 4. Default to global
  return {
    context: getGlobalLocation(),
    detectionMethod: "default",
    confidence: 0.3,
  };
}

/**
 * Validate a location string
 * In production, this would use a geocoding API like Google Maps or Mapbox
 */
export async function validateLocation(location: string): Promise<{
  isValid: boolean;
  context: LocationContext;
  error?: string;
}> {
  if (!location || location.trim().length === 0) {
    return {
      isValid: false,
      context: getGlobalLocation(),
      error: "Location cannot be empty",
    };
  }

  const trimmed = location.trim().toLowerCase();

  // Check for global keywords
  if (
    ["global", "worldwide", "international", "everywhere"].includes(trimmed)
  ) {
    return {
      isValid: true,
      context: getGlobalLocation(),
    };
  }

  // Check if it's a known country
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (name === trimmed || code.toLowerCase() === trimmed) {
      return {
        isValid: true,
        context: {
          country: getCountryName(code),
          countryCode: code,
          timezone: COUNTRY_TIMEZONE[code],
          currency: COUNTRY_CURRENCY[code],
          isGlobal: false,
        },
      };
    }
  }

  // For more complex validations (cities, regions), implement geocoding API
  // Example (commented out):
  // const response = await fetch(`https://api.geocoding-service.com/geocode?address=${encodeURIComponent(location)}`);
  // const data = await response.json();
  // if (data.results && data.results.length > 0) {
  //   return { isValid: true, context: mapGeocodingResult(data.results[0]) };
  // }

  // For now, accept any non-empty string as potentially valid
  // In production, use proper geocoding validation
  return {
    isValid: true,
    context: {
      country: location,
      countryCode: "UNKNOWN",
      isGlobal: false,
    },
  };
}
