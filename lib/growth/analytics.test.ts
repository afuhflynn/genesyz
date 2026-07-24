import { describe, expect, it } from "vitest";
import { buildFunnelInsights } from "./analytics";

describe("buildFunnelInsights", () => {
  it("aggregates stage counts and calculates conversion/drop-off", () => {
    const result = buildFunnelInsights([
      { stage: "AWARENESS", count: 100, value: 0 },
      { stage: "ACQUISITION", count: 25, value: 0 },
      { stage: "ACTIVATION", count: 5, value: 10 },
    ]);
    expect(result.stages[0]).toMatchObject({
      count: 100,
      conversionRate: null,
    });
    expect(result.stages[1]).toMatchObject({
      count: 25,
      conversionRate: 25,
      dropOffRate: 75,
    });
    expect(result.stages[2]).toMatchObject({
      count: 5,
      value: 10,
      conversionRate: 20,
    });
    expect(result.warnings).toContain(
      "Retention is converting below 20% from the previous stage.",
    );
  });

  it("normalizes unknown stages to awareness and reports weak conversion", () => {
    const result = buildFunnelInsights([
      { stage: "UNKNOWN", count: 10, value: null },
      { stage: "ACQUISITION", count: 1, value: null },
    ]);
    expect(result.stages[0].count).toBe(10);
    expect(result.stages[1].warning).toBe(true);
    expect(result.warnings[0]).toContain("Acquisition");
  });
});
