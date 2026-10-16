import { z } from "zod";
import { runPagespeed } from "../google/pagespeed.js";
import { queryCrux } from "../google/crux.js";
import { success, fail } from "./response.js";
import { strict } from "./schema.js";

const strategy = z.enum(["mobile", "desktop"]).optional();
const formFactor = z
  .enum(["PHONE", "DESKTOP", "TABLET", "ALL_FORM_FACTORS"])
  .optional();

export const performanceTools = [
  {
    name: "run_pagespeed",
    description:
      "Run a PageSpeed Insights (Lighthouse) audit on a URL. Returns category scores and Core Web Vitals. Optional API key via PAGESPEED_API_KEY or GOOGLE_API_KEY.",
    schema: strict({
      url: z.string().url(),
      strategy,
      categories: z
        .array(z.enum(["performance", "accessibility", "best-practices", "seo"]))
        .optional(),
      locale: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        return success(await runPagespeed(args));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "run_pagespeed_batch",
    description:
      "Run PageSpeed Insights on multiple URLs (sequential). Keep batches small (recommended ≤ 5) to respect rate limits.",
    schema: strict({
      urls: z.array(z.string().url()).min(1).max(10),
      strategy,
      categories: z
        .array(z.enum(["performance", "accessibility", "best-practices", "seo"]))
        .optional(),
    }),
    handler: async (args: any) => {
      try {
        const results = [];
        for (const url of args.urls) {
          try {
            const data = await runPagespeed({
              url,
              strategy: args.strategy,
              categories: args.categories,
            });
            results.push({ url, ok: true, data });
          } catch (err: any) {
            results.push({ url, ok: false, error: err?.message || String(err) });
          }
        }
        return success({ count: results.length, results });
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "query_crux",
    description:
      "Query Chrome UX Report (CrUX) real-user Core Web Vitals for an origin or a specific URL. Optional API key via CRUX_API_KEY or GOOGLE_API_KEY.",
    schema: strict({
      origin: z.string().optional(),
      url: z.string().url().optional(),
      formFactor,
      metrics: z.array(z.string()).optional(),
    }),
    handler: async (args: any) => {
      try {
        if (!args.origin && !args.url) {
          return fail("Provide either origin or url");
        }
        return success(await queryCrux(args));
      } catch (err) {
        return fail(err);
      }
    },
  },
  {
    name: "query_crux_batch",
    description:
      "Query CrUX for multiple origins or URLs. Keep batches small (recommended ≤ 10).",
    schema: strict({
      targets: z
        .array(
          z.object({
            origin: z.string().optional(),
            url: z.string().url().optional(),
          })
        )
        .min(1)
        .max(20),
      formFactor,
      metrics: z.array(z.string()).optional(),
    }),
    handler: async (args: any) => {
      try {
        const results = [];
        for (const t of args.targets) {
          const label = t.url || t.origin;
          try {
            const data = await queryCrux({
              origin: t.origin,
              url: t.url,
              formFactor: args.formFactor,
              metrics: args.metrics,
            });
            results.push({ target: label, ok: true, data });
          } catch (err: any) {
            results.push({
              target: label,
              ok: false,
              error: err?.message || String(err),
            });
          }
        }
        return success({ count: results.length, results });
      } catch (err) {
        return fail(err);
      }
    },
  },
];
