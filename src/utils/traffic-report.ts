const METRICS = [
  "Active users",
  "Sessions",
  "Page views",
  "Bounce rate",
  "Average session duration",
  "New users",
];
const COLUMNS = ["Date", ...METRICS];

function rowValues(row: any): string[] {
  return [
    ...(row?.dimensionValues || []).map((item: any) => String(item.value ?? "")),
    ...(row?.metricValues || []).map((item: any) => String(item.value ?? "")),
  ];
}

/** Format a GA4 traffic overview as a Markdown report or CSV table. */
export function formatTrafficReport(data: any, format: "md" | "csv"): string {
  const daily = Array.isArray(data?.daily) ? data.daily : [];
  if (format === "csv") {
    const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    return [COLUMNS.map(quote).join(","), ...daily.map((row: any) => rowValues(row).map(quote).join(","))].join("\n") + "\n";
  }

  const total = rowValues(data?.totals);
  return [
    "# Rapport de trafic Google Analytics",
    "",
    `Période : ${data?.period?.startDate || "—"} au ${data?.period?.endDate || "—"}`,
    "",
    "## Totaux",
    "",
    ...METRICS.map((name, index) => `- **${name} :** ${total[index] || "0"}`),
    "",
    "## Évolution quotidienne",
    "",
    `| ${COLUMNS.join(" | ")} |`,
    `| ${COLUMNS.map(() => "---").join(" | ")} |`,
    ...daily.map((row: any) => `| ${rowValues(row).join(" | ")} |`),
    "",
    "Données en lecture seule fournies par Google Analytics 4.",
    "",
  ].join("\n");
}
