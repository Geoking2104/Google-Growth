import { describe, expect, it } from "vitest";
import { formatTrafficReport } from "../src/utils/traffic-report.js";

const sample = {
  period: { startDate: "2026-10-01", endDate: "2026-10-07" },
  totals: { metricValues: ["100", "140", "500", "0.25", "42.5", "60"].map((value) => ({ value })) },
  daily: [{
    dimensionValues: [{ value: "20261001" }],
    metricValues: ["10", "14", "50", "0.2", "40", "6"].map((value) => ({ value })),
  }],
};

describe("formatTrafficReport", () => {
  it("renders a Markdown report with period, totals, and daily rows", () => {
    const report = formatTrafficReport(sample, "md");
    expect(report).toContain("Période : 2026-10-01 au 2026-10-07");
    expect(report).toContain("**Sessions :** 140");
    expect(report).toContain("| 20261001 | 10 | 14 | 50 | 0.2 | 40 | 6 |");
  });

  it("quotes and escapes CSV fields", () => {
    const report = formatTrafficReport({
      daily: [{ dimensionValues: [{ value: '2026,"10"' }], metricValues: [{ value: "5" }] }],
    }, "csv");
    expect(report.split("\n")[0]).toContain('"Date","Active users"');
    expect(report).toContain('"2026,""10""","5"');
  });

  it("produces a valid header even when no daily rows are present", () => {
    expect(formatTrafficReport({}, "csv").split("\n")[0].split(",")).toHaveLength(7);
  });
});
