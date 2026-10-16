import { describe, expect, it } from "vitest";
import { searchConsoleTools } from "../src/tools/search-console.js";
import { indexingTools } from "../src/tools/indexing.js";
import { performanceTools } from "../src/tools/performance.js";

function names(tools: { name: string }[]) {
  return tools.map((t) => t.name);
}

describe("new tool catalogs", () => {
  it("registers Search Console tools", () => {
    expect(names(searchConsoleTools)).toEqual(
      expect.arrayContaining([
        "list_search_console_sites",
        "get_top_queries",
        "get_top_search_pages",
        "submit_sitemap",
        "inspect_url",
      ])
    );
  });

  it("registers Indexing API tools", () => {
    expect(names(indexingTools)).toEqual(
      expect.arrayContaining([
        "get_url_notification_metadata",
        "publish_url_notification",
      ])
    );
  });

  it("registers PageSpeed and CrUX tools", () => {
    expect(names(performanceTools)).toEqual(
      expect.arrayContaining(["run_pagespeed", "query_crux"])
    );
  });

  it("rejects sitemap submit without confirm", async () => {
    const tool = searchConsoleTools.find((t) => t.name === "submit_sitemap");
    const result = await tool!.handler({
      siteUrl: "https://example.com/",
      feedpath: "https://example.com/sitemap.xml",
      confirm: false,
    });
    expect(JSON.stringify(result)).toMatch(/confirm=true/);
  });

  it("rejects Indexing write when the env flag is off", async () => {
    delete process.env.INDEXING_WRITE_ENABLED;
    const tool = indexingTools.find((t) => t.name === "publish_url_notification");
    const result = await tool!.handler({
      url: "https://example.com/job",
      type: "URL_UPDATED",
      confirm: true,
    });
    expect(JSON.stringify(result)).toMatch(/INDEXING_WRITE_ENABLED/);
  });
});
