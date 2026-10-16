# Google Growth MCP tools

Unprefixed names as registered by the GA-to-Grok server. Agents usually prefix them (examples: `ga-to-grok__…` or a custom connector name). Always discover tools in the current agent first.

Common ids

- `propertyId` — numeric GA4 property
- `accountId`, `containerId`, `workspaceId` — GTM ids as strings
- `siteUrl` — exact Search Console property id (from `list_search_console_sites`)
- dates — `today`, `yesterday`, `NdaysAgo`, or `YYYY-MM-DD`

## GA4

| Tool | Typical args | Notes |
|---|---|---|
| `list_properties` | none | Start here |
| `get_property_details` | propertyId | |
| `get_traffic_overview` | propertyId?, dates? | Users, sessions, views, bounce |
| `get_top_pages` | propertyId?, dates, limit? | |
| `get_acquisition` | propertyId?, dates, limit? | Channel / source / medium |
| `get_devices` | propertyId?, dates | Device, OS, browser |
| `get_events_summary` | propertyId?, dates, limit? | |
| `analyze_ecommerce_data` | propertyId, dates?, limit? | Purchases, revenue, AOV, funnel |
| `run_report` | metrics[], dates, dimensions? | Last resort |
| `run_realtime_report` | metrics[], dimensions? | Last ~30 minutes |

## Search Console

| Tool | Typical args | Notes |
|---|---|---|
| `list_search_console_sites` | none | Copy exact `siteUrl` |
| `get_top_queries` | siteUrl, dates?, limit? | |
| `get_top_search_pages` | siteUrl, dates?, limit? | |
| `inspect_url` | siteUrl, inspectionUrl | Index status |
| `submit_sitemap` | siteUrl, feedpath, dryRun?, confirm? | WRITE — gated |

## PageSpeed & CrUX

| Tool | Typical args |
|---|---|
| `run_pagespeed` | url, strategy? |
| `query_crux` | origin? or url?, formFactor? |

## GTM / sGTM / MP

Prefer `audit_ga4_setup_v2`, `validate_ecommerce_events`, `audit_sgtm_setup`, `compare_dual_tagging`, `cutover_checklist`.

Writes need `confirm=true` and the matching env flag. Do not publish GTM workspaces.

Full source of tool names is the running MCP server. Discover before calling.
