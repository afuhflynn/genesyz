/**
 * Location Types
 * Type definitions for location handling
 */

export interface LocationContext {
  country: string;
  countryCode: string;
  region?: string;
  regionCode?: string;
  city?: string;
  timezone?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
  isGlobal: boolean;
}

export interface LocationSuggestion {
  name: string; // Display name (e.g., "San Francisco, CA, USA")
  context: LocationContext;
  confidence: number; // 0-1 confidence score
  type: "exact" | "regional" | "global";
}

export interface DetectedLocation {
  ip?: string;
  context: LocationContext;
  detectionMethod: "ip" | "text" | "user_input" | "default";
  confidence: number;
}

export interface LocationValidationResult {
  isValid: boolean;
  normalizedLocation: string;
  context: LocationContext;
  suggestions: LocationSuggestion[];
  error?: string;
}
