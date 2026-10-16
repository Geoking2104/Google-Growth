import { google } from "googleapis";
import { getAuthClient } from "../auth/service-account.js";

async function getWebmasters() {
  const auth = await getAuthClient();
  return google.webmasters({ version: "v3", auth });
}

async function getSearchConsole() {
  const auth = await getAuthClient();
  return google.searchconsole({ version: "v1", auth });
}

/** List all Search Console properties the Service Account can access. */
export async function listSearchConsoleSites() {
  const wm = await getWebmasters();
  const res = await wm.sites.list();
  return (res.data.siteEntry || []).map((s) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));
}

/** Get details of a single Search Console property. */
export async function getSearchConsoleSite(siteUrl: string) {
  const wm = await getWebmasters();
  const res = await wm.sites.get({ siteUrl });
  return res.data;
}

/** List sitemaps submitted for a property. */
export async function listSitemaps(siteUrl: string) {
  const wm = await getWebmasters();
  const res = await wm.sitemaps.list({ siteUrl });
  return res.data.sitemap || [];
}

/** Get details of one sitemap (processing status, errors, warnings). */
export async function getSitemap(siteUrl: string, feedpath: string) {
  const wm = await getWebmasters();
  const res = await wm.sitemaps.get({ siteUrl, feedpath });
  return res.data;
}

/**
 * Inspect a URL's index status (verdict, coverage, last crawl, canonicals, robots).
 * Equivalent to the URL Inspection tool in Search Console.
 */
export async function inspectUrl(args: {
  siteUrl: string;
  inspectionUrl: string;
  languageCode?: string;
}) {
  const sc = await getSearchConsole();
  const res = await sc.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: args.inspectionUrl,
      siteUrl: args.siteUrl,
      languageCode: args.languageCode || "en-US",
    },
  });
  return res.data;
}
