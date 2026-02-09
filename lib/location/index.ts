/**
 * Location Module
 * Location detection, validation, and research context
 */

export {
  detectBestLocation,
  detectLocationFromIp,
  detectLocationFromText,
  formatLocation,
  getGlobalLocation,
  getLocationSearchSuggestions,
  validateLocation,
} from "./detector";
export {
  buildLocationResearchContext,
  formatLocationForPrompt,
  getLocationSearchQueries,
  type LocationResearchContext,
} from "./research-context";
export type {
  DetectedLocation,
  LocationContext,
  LocationSuggestion,
  LocationValidationResult,
} from "./types";
