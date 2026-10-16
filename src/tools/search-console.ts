import { z } from "zod";
import {
  listSearchConsoleSites,
  getSearchConsoleSite,
  listSitemaps,
  getSitemap,
  submitSitemap,
  querySearchAnalytics,
  inspectUrl,
} from "../google/search-console.js";
import { success, fail } from "./response.js";
import { strict } from "./schema.js";

const siteUrl = z
  .string()
  .min(1)
  .describe(
    "Exact Search Console property identifier (copy from list_search_console_sites). Example: https://example.com/ or sc-domain:example.com"
  );

const dateStr = z
  .string()
  .optional()
  .describe("YYYY-MM-DD or relative (28daysAgo, 7daysAgo, yesterday)");

const rowLimit = z.number().int().min(1).max(25000).optional();

const searchType = z
  .enum(["web", "image", "video", "news", "discover", "googleNews"])
  .optional();

function assertSearchConsoleWriteEnabled() {
  if (process.env.SEARCH_CONSOLE_WRITE_ENABLED !== "true") {
    throw new Error(
      "Search Console writes are disabled. Set SEARCH_CONSOLE_WRITE_ENABLED=true to allow sitemap submission."
    );
  }
}

export const searchConsoleTools = [
  // ─── Sites ──────────────────────────────────────────────
  {
    name: "list_search_console_sites",
    description:
      "List all Search Console properties (URL-prefix and domain) accessible by the Service Account. Always call this first to obtain the exact siteUrl.",
    schema: strict({}),
    handler: async () => {
      try {
        return success(await listSearchConsoleSites());
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_search_console_site",
    description:
      "Get details of a single Search Console property (permission level, etc.).",
    schema: strict({ siteUrl }),
    handler: async (args: any) => {
      try {
        return success(await getSearchConsoleSite(args.siteUrl));
      } catch (err) {
        return fail(err);
      }
    },
  },

  // ─── Sitemaps (indexing surface) ───────────────────────────
  {
    name: "list_sitemaps",
    description:
      "List all sitemaps submitted for a Search Console property, including processing status, errors and warnings.",
    schema: strict({ siteUrl }),
    handler: async (args: any) => {
      try {
        return success(await listSitemaps(args.siteUrl));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_sitemap",
    description:
      "Get detailed status of a specific sitemap (path, last downloaded, errors, warnings, contents).",
    schema: strict({
      siteUrl,
      feedpath: z
        .string()
        .min(1)
        .describe("Sitemap path or full URL as returned by list_sitemaps"),
    }),
    handler: async (args: any) => {
      try {
        return success(await getSitemap(args.siteUrl, args.feedpath));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "submit_sitemap",
    description:
      "WRITE: Submit (add) a sitemap to a Search Console property. Requires SEARCH_CONSOLE_WRITE_ENABLED=true on the server and confirm=true. Use dryRun=true first to preview. The Service Account needs the full webmasters scope and write access on the property.",
    schema: strict({
      siteUrl,
      feedpath: z
        .string()
        .min(1)
        .describe(
          "Sitemap path or full URL to submit (e.g. https://example.com/sitemap.xml or sitemap.xml)"
        ),
      dryRun: z.boolean().optional(),
      confirm: z.boolean().optional(),
    }),
    handler: async (args: any) => {
      try {
        if (args.dryRun) {
          return success({
            dryRun: true,
            wouldSubmit: {
              siteUrl: args.siteUrl,
              feedpath: args.feedpath,
            },
            message:
              "Dry run only. Set dryRun=false and confirm=true to actually submit.",
          });
        }
        if (args.confirm !== true) {
          return fail(
            "Refusing to submit sitemap without confirm=true. Run with dryRun=true first, then confirm=true."
          );
        }
        assertSearchConsoleWriteEnabled();
        const result = await submitSitemap(args.siteUrl, args.feedpath);
        return success(result);
      } catch (err) {
        return fail(err);
      }
    },
  },

  // ─── Search Analytics (performance) ─────────────────────────────
  {
    name: "get_search_overview",
    description:
      "Search Console totals (clicks, impressions, CTR, average position). No query/page dimensions for more complete counts.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          type: args.type,
          dimensions: [],
          rowLimit: 1,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          totals: result.rows[0] || {},
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_top_queries",
    description: "Top search queries by clicks/impressions.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      limit: rowLimit,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: args.limit ?? 20,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          queries: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_top_search_pages",
    description: "Top landing pages in Google Search.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      limit: rowLimit,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: args.limit ?? 20,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          pages: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_query_page_pairs",
    description: "Top query × page pairs.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      limit: rowLimit,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["query", "page"],
          rowLimit: args.limit ?? 50,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          pairs: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_search_by_device",
    description: "Search performance by device (DESKTOP, MOBILE, TABLET).",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["device"],
          rowLimit: 10,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          devices: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_search_by_country",
    description: "Search performance by country.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      limit: rowLimit,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["country"],
          rowLimit: args.limit ?? 20,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          countries: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "get_search_trend",
    description: "Daily Search Console trend.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      type: searchType,
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          siteUrl: args.siteUrl,
          startDate,
          endDate,
          dimensions: ["date"],
          rowLimit: 100,
          type: args.type,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          trend: result.rows,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "run_search_analytics",
    description:
      "Flexible Search Analytics query. Prefer specialized tools when possible. Dimensions: query, page, country, device, date, searchAppearance.",
    schema: strict({
      siteUrl,
      startDate: dateStr,
      endDate: dateStr,
      dimensions: z.array(z.string()).optional(),
      type: searchType,
      rowLimit,
      startRow: z.number().int().min(0).optional(),
      aggregationType: z.enum(["auto", "byPage", "byProperty"]).optional(),
      dimensionFilterGroups: z.any().optional(),
    }),
    handler: async (args: any) => {
      try {
        const startDate = args.startDate || "28daysAgo";
        const endDate = args.endDate || "3daysAgo";
        const result = await querySearchAnalytics({
          ...args,
          startDate,
          endDate,
        });
        return success({
          siteUrl: args.siteUrl,
          period: { startDate, endDate },
          ...result,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },

  // ─── URL Inspection (indexing) ──────────────────────────────
  {
    name: "inspect_url",
    description:
      "Inspect the index status of a URL in Google Search. Returns verdict (PASS/FAIL/NEUTRAL), coverageState, lastCrawlTime, googleCanonical vs userCanonical, robotsTxtState, indexingState, and referring URLs. Equivalent to URL Inspection in Search Console.",
    schema: strict({
      siteUrl,
      inspectionUrl: z
        .string()
        .url()
        .describe("Fully-qualified URL to inspect (must belong to the siteUrl property)"),
      languageCode: z
        .string()
        .optional()
        .describe("IETF language tag for issue messages, e.g. en-US or fr-FR. Default en-US."),
    }),
    handler: async (args: any) => {
      try {
        return success(await inspectUrl(args));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "inspect_urls",
    description:
      "Inspect multiple URLs (batch). Returns an array of inspection results. Use for checking key pages after a deploy or migration. Note: each inspection is relatively slow; keep batches small (recommended ≤ 10).",
    schema: strict({
      siteUrl,
      inspectionUrls: z
        .array(z.string().url())
        .min(1)
        .max(20)
        .describe("List of fully-qualified URLs to inspect"),
      languageCode: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const results = [];
        for (const url of args.inspectionUrls) {
          try {
            const data = await inspectUrl({
              siteUrl: args.siteUrl,
              inspectionUrl: url,
              languageCode: args.languageCode,
            });
            results.push({ url, ok: true, data });
          } catch (err: any) {
            results.push({ url, ok: false, error: err?.message || String(err) });
          }
        }
        return success({
          siteUrl: args.siteUrl,
          count: results.length,
          results,
        });
      } catch (err) {
        return fail(err);
      }
    },
  },
];
