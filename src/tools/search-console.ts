import { z } from "zod";
import {
  listSearchConsoleSites,
  getSearchConsoleSite,
  listSitemaps,
  getSitemap,
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
