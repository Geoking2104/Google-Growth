---
name: google-growth
description: Use live Google Analytics 4, Tag Manager, Search Console, PageSpeed, and CrUX for growth briefings and SEO audits. Trigger on GA4, GTM, Search Console, PageSpeed, CrUX, ecommerce, traffic reports, SEO audits, or when the user mentions Google Growth or GA-to-Grok.
license: Apache-2.0
metadata:
  source: https://github.com/Geoking2104/GA-to-Grok
  version: "0.8.0"
  display_name: Google Growth
---

# Google Growth

Work with **GA4 + GTM + Search Console + PageSpeed + CrUX** via the open-source MCP server https://github.com/Geoking2104/GA-to-Grok.

This skill is for marketers, growth teams, and agencies who want answers from live Google data — not from pasted screenshots. It works with Grok, Claude, and Codex.

**Prerequisite:** The GA-to-Grok MCP server must be running and connected. The skill never stores credentials. If tools are missing, stop and explain setup (see `references/setup.md`). Do not invent metrics.

## Why use this skill (vs a classic LLM)

| Classic LLM | Google Growth |
|---|---|
| Works on what you paste (exports, screenshots) | Calls Google APIs directly |
| Can invent numbers | Cites only tool results |
| One source at a time, manual | Crosses GA4, Search Console, PageSpeed, CrUX |
| Advice only | Can act (gated writes: GTM, sitemap, Indexing API) |
| Method changes every chat | Reproducible workflows |

### Concrete benefits for marketers

1. **Real numbers** — traffic, queries, Core Web Vitals come from the APIs, not from memory.
2. **Less friction** — no export → paste → reformat loop. Ask in plain language.
3. **Cross-source insight** — pages that rank well but convert poorly, or rank well and load slowly.
4. **Prioritized actions** — reports end with a short list of what to fix first.
5. **Safe by default** — reads are open; writes need explicit flags + `confirm=true`.
6. **Reusable** — an agent can run the same briefing or SEO audit every week.

## First action every session

1. Discover live MCP tools. Names vary by prefix (`ga-to-grok__…` or a custom connector name).
   - Search for tools containing `ga4`, `gtm`, `search_console`, `pagespeed`, `crux`, `indexing`.
2. If nothing matches, the MCP is not connected. Explain the shortest path in `references/setup.md`. Do not invent numbers.
3. Call tools with the exact discovered name. Prefer business tools over raw `run_report`.

## How to choose a tool

| User intent | Tool |
|---|---|
| List GA4 properties | `list_properties` |
| Traffic overview | `get_traffic_overview` |
| Top pages / channels / devices | `get_top_pages`, `get_acquisition`, `get_devices` |
| Ecommerce | `analyze_ecommerce_data` |
| Search Console sites | `list_search_console_sites` |
| Top queries / pages in Search | `get_top_queries`, `get_top_search_pages` |
| Index status | `inspect_url` |
| Page speed (lab) | `run_pagespeed` |
| Real-user vitals | `query_crux` |
| Submit a sitemap (write) | `submit_sitemap` (gated) |

Full catalog — `references/tools.md`.

Dates: `today`, `yesterday`, `7daysAgo`, `28daysAgo`, or `YYYY-MM-DD`. Default to 7 or 28 days if vague.

## Standard workflows

### A. Weekly analytics briefing (marketer)

1. `list_properties` if needed
2. `get_traffic_overview` (period)
3. `get_acquisition` + `get_top_pages` + `get_devices`
4. `get_events_summary`
5. If ecommerce — `analyze_ecommerce_data`
6. Summarize: users, sessions, top sources, anomalies. Cite dates and property id.

### B. SEO & performance audit

1. `list_search_console_sites` → exact `siteUrl`
2. `get_top_search_pages` (28 days, limit 10–15)
3. `query_crux` on origin (PHONE) and key URLs
4. `run_pagespeed` (mobile) on home + priority pages
5. Optional: `inspect_url` on critical pages
6. Output a priority table:
   - Page | Search clicks | LCP/INP/CLS field | Lab score | Priority
   - Then 3–5 concrete actions

If a source fails (403, no CrUX data, quota), say so and continue with the others. Never invent figures.

### C. GTM web audit

1. `list_gtm_accounts` → containers → workspaces
2. `audit_ga4_setup_v2`
3. `validate_ecommerce_events` if relevant
4. Report grade, blockers, fixes. Do not publish.

### D. Server-side tracking / cutover

Follow order in `references/sgtm.md`. Do not skip steps.

### E. Custom event (write)

1. Analyze first
2. `suggest_custom_event_config`
3. Write only after explicit confirmation — `dryRun=true` then `confirm=true`

## Optimal operation (for marketers)

| Solution | Best for | What you need |
|---|---|---|
| **A. Custom Connector (HTTPS)** | Most teams | Someone deploys the server once; you add the URL in the agent |
| **B. Local stdio** | Developers | Clone, build, Service Account on the machine |
| **C. Skill only** | Docs / method | Installs the method, but **no live data** until A or B is done |

Recommended for a marketing team:

1. One technical owner deploys the MCP (Path A).
2. Service Account invited to GA4, GTM, and Search Console.
3. Optional API keys for PageSpeed and CrUX.
4. Connector added in Grok, Claude, or Codex.
5. Optional: a dedicated agent with the SEO audit workflow saved.

Details — `references/setup.md`.

## Write safety

Writes (GTM tags, sitemap submit, Indexing API, MP secrets) are off by default.

- Never set `confirm=true` unless the user explicitly asked to write.
- Always `dryRun=true` first.
- Server flags (`GA4_WRITE_ENABLED`, `GTM_WRITE_ENABLED`, `SEARCH_CONSOLE_WRITE_ENABLED`, `INDEXING_WRITE_ENABLED`) must be `true`.
- Never print a full secret or Service Account key.

## Common errors

| Symptom | Likely cause | Next step |
|---|---|---|
| Tool not found | MCP not connected | Follow `references/setup.md` |
| 403 | Service Account not invited | Grant Viewer / Read on the property or site |
| Writes blocked | Env flag not `true` | Tell the user; do not retry with confirm |
| Empty results | Narrow dates or no traffic | Widen the range |
| PageSpeed 429 | Quota | Add an API key; reduce batch size |
| No CrUX data | Low traffic page | Fall back to PageSpeed lab |

## Answer style

- Lead with the decision (healthy / needs work / priority pages).
- Then 3–7 numbered actions a marketer can act on.
- Use tables for metrics.
- Match the user's language.
- If MCP is missing, give the shortest connect path — do not guess data.

## Source of truth

Repo — https://github.com/Geoking2104/GA-to-Grok  
MCP server name stays `ga-to-grok`. Skill name is `google-growth`.

- Setup — `references/setup.md`
- Tool catalog — `references/tools.md`
- sGTM — `references/sgtm.md`
