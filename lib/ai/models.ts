import { google } from "@ai-sdk/google";

export const model = google("gemini-2.5-flash");

export function getModel() {
  return model;
}
