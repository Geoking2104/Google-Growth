# GA-to-Grok

**Open-source MCP server** connecting **Google Analytics 4**, **Google Tag Manager** (web + **server-side**), **Measurement Protocol**, **Search Console**, the **Indexing API**, **PageSpeed Insights**, and **CrUX** to **Grok** (xAI) and any MCP-capable agent.

Grok can read live Google data, audit setups, cross organic search with site speed, and (when explicitly enabled) submit sitemaps or notify the Indexing API — via **MCP tools** or a **CLI**.

> Compatible with **Grok Build**, **Grok Connectors** (Custom MCP), **Claude Code**, **Codex**, Cursor (`.mcp.json`), and self-hosted deployments.  
> **Apache-2.0** license · Node ≥ 20

---

## Why use it (vs a classic LLM)

| Classic LLM | GA-to-Grok |
|-------------|------------|
| Works on pasted exports and screenshots | Calls Google APIs directly |
| Can invent numbers | Cites only tool results |
| One source at a time, manual | Crosses GA4, Search Console, PageSpeed, CrUX |
| Advice only | Can act (gated writes) |
| Method changes every chat | Reproducible workflows (skill + agents) |

### For marketers

1. **Real numbers** — traffic, queries, Core Web Vitals come from the APIs.
2. **Less friction** — no export → paste → reformat loop.
3. **Cross-source insight** — pages that rank well but convert poorly, or rank well and load slowly.
4. **Prioritized actions** — reports end with what to fix first.
5. **Safe by default** — reads are open; writes need flags + `confirm=true`.

The agent-facing method lives in [`skills/ga-to-grok/`](skills/ga-to-grok/) (same skill for Agensi, Claude, and Codex).

---

## What you can do

| Domain | Capabilities |
|--------|----------------|
| **GA4** | Reports, realtime, traffic, acquisition, devices, events, ecommerce analysis |
| **GTM Web** | Tags, triggers, variables, GA4 audit v2, ecommerce schema validation |
| **sGTM** | List server containers, clients, MP client audit, dual-tagging, cutover, health |
| **Measurement Protocol** | List/verify secrets, suggest config, create secrets (write), direct + sGTM modes |
| **Search Console** | Sites, sitemaps, Search Analytics (queries, pages, devices, countries), URL inspection |
| **Indexing API** | Notify Google of URL updates/deletes (gated); read notification metadata |
| **PageSpeed & CrUX** | Lighthouse lab scores and real-user Core Web Vitals |
| **Custom events** | Discover, analyze, suggest GTM config; Phase 3 write (trigger + tag) |
| **Ops** | CLI per step, Redis cache, Docker, GitHub Actions CI + live validation |

---

## Architecture (high level)

```text
                    ┌────────────────────┐
                    │   Grok / Agents     │
                    │  (MCP tools + CLI)  │
                    └──────────┬──────────┘
                                │ STDIO or HTTP (Streamable /mcp + /sse)
                               ▼
                    ┌─────────────────────┐
                    │    GA-to-Grok       │
                    │  Service Account    │
                    └──────────┬──────────┘
     ┌──────────────────────┼──────────────────────┐
     ▼                   ▼                   ▼
 GA4 Data/Admin      GTM Web + sGTM      Search Console
 + MP secrets        tags / clients      + Indexing API
                                         + PageSpeed / CrUX
```

---

## Connect — three solutions

| Solution | Best for | What you need |
|----------|----------|----------------|
| **A. Custom Connector (HTTPS)** | Marketing teams, Grok web | Deploy once; add URL in [grok.com/connectors](https://grok.com/connectors) |
| **B. Local stdio** | Developers | Clone, build, Service Account on the machine |
| **C. Skill only** | Method / docs | Installs workflows, **no live data** until A or B |

Recommended for a marketing team: Solution A, Service Account invited to GA4 / GTM / Search Console, optional PageSpeed and CrUX API keys, then a test prompt such as “List my GA4 properties”.

Step-by-step: [`skills/ga-to-grok/references/setup.md`](skills/ga-to-grok/references/setup.md) · [docs/GROK_SETUP.md](docs/GROK_SETUP.md)

---

## 1. Prerequisites

1. **Google Cloud project** with APIs enabled:
   - Google Analytics Data API
   - Google Analytics Admin API
   - Tag Manager API
   - Search Console API (for SEO tools)
2. **Service Account** JSON key
3. Grant the SA email:
   - GA4 property: **Viewer** (or Editor if you create MP secrets)
   - GTM accounts: **Read** (or **Edit** for Phase 3 tag creation)
   - Search Console property: user with access (write if submitting sitemaps)
4. Optional API keys for performance tools (`PAGESPEED_API_KEY`, `CRUX_API_KEY`, or `GOOGLE_API_KEY`)
5. Node.js **≥ 20**

### Scopes used

```text
analytics.readonly
analytics.edit                    # MP secret creation
tagmanager.readonly
tagmanager.edit.containers        # Phase 3 GTM writes
webmasters.readonly               # Search Console read
webmasters                        # sitemap submit (gated)
indexing                          # Indexing API (gated)
```

Writes are gated by `confirm=true`, optional `dryRun`, and env flags (all **disabled by default**):

```bash
GA4_WRITE_ENABLED=true
GTM_WRITE_ENABLED=true
SEARCH_CONSOLE_WRITE_ENABLED=true
INDEXING_WRITE_ENABLED=true
```

### Reliability & safety features

- **Input validation (zod):** every tool validates its arguments. Invalid arguments are rejected before any Google API call.
- **Enriched errors:** Google failures surface `status` + `reason` (e.g. `[status 403 | permissionDenied]`).
- **Retry & pagination:** gaxios retries on 429/5xx; `run_report` paginates past GA4's row cap.
- **HTTP auth:** set `MCP_API_TOKEN` on any remote deployment; clients send `Authorization: Bearer <token>`.
- **Logging:** `LOG_LEVEL` (`debug` | `info` | `warn` | `error`). Logs stay on stderr so STDIO keeps stdout for MCP.

---

## 2. Install & configure

```bash
git clone https://github.com/Geoking2104/GA-to-Grok.git
cd GA-to-Grok
npm install
cp .env.example .env
```

Edit `.env`:

```bash
# Auth (pick one)
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/sa.json
# or
GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'

# Optional defaults
GA4_PROPERTY_ID=123456789

# Transport
TRANSPORT=stdio          # or http
PORT=3000

# Optional performance keys
PAGESPEED_API_KEY=
CRUX_API_KEY=
# or GOOGLE_API_KEY=

# Optional Redis
REDIS_URL=redis://localhost:6379

# Optional HTTP auth (recommended for any remote/public deployment).
# MCP_API_TOKEN=change-me-to-a-long-random-string

LOG_LEVEL=info

# Safety: writes DISABLED by default.
GA4_WRITE_ENABLED=false
GTM_WRITE_ENABLED=false
SEARCH_CONSOLE_WRITE_ENABLED=false
INDEXING_WRITE_ENABLED=false
```

Build:

```bash
npm run build
```

---

## 3. Grok Build packaging (ready out of the box)

| File | Role |
|------|------|
| `.grok/config.toml` | Project-scoped MCP server (`ga-to-grok`) |
| `.mcp.json` | Claude Code / Cursor / Grok compatibility |
| `.grok/plugins/ga-to-grok/` | Plugin stub |
| `skills/ga-to-grok/` | Shared skill (Agensi, Claude, Codex) |
| `docs/GROK_BUILD.md` | Full packaging guide |

### Local (stdio)

```bash
npm run build
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
grok mcp add --scope project ga-to-grok -- node dist/index.js --transport stdio
```

### Remote HTTP

```bash
grok mcp add --transport http ga-to-grok https://your-host.example.com/mcp
```

### grok.com Connectors

1. Deploy with `TRANSPORT=http` + public HTTPS
2. [grok.com/connectors](https://grok.com/connectors) → **New Connector → Custom**
3. URL: `https://your-server.com/mcp` (or `/sse` for legacy clients)

Details: **[docs/GROK_BUILD.md](docs/GROK_BUILD.md)** · [docs/GROK_SETUP.md](docs/GROK_SETUP.md)

---

## 4. Run the MCP server

```bash
npm run start:stdio          # local
npm run start:http           # http://localhost:3000/mcp  and  /sse
docker compose up -d         # see docs/DEPLOYMENT.md
```

---

## 5. Skill for Agensi, Claude, and Codex

Canonical skill: `skills/ga-to-grok/` (`SKILL.md` + `references/`).

| Agent | Install path | Guide |
|-------|----------------|-------|
| Agensi | zip of `ga-to-grok/` | below |
| Claude Code | `.claude/skills/ga-to-grok/` or `~/.claude/skills/ga-to-grok/` | [docs/CLAUDE_SETUP.md](docs/CLAUDE_SETUP.md) |
| Codex | `.codex/skills/ga-to-grok/` or `~/.codex/skills/ga-to-grok/` | [docs/CODEX_SETUP.md](docs/CODEX_SETUP.md) |

Install into this repo:

```bash
./scripts/install-skill.sh both          # copy into .claude and .codex
./scripts/install-skill.sh claude --link # symlink
./scripts/install-skill.sh codex --user  # user-wide
```

The skill does not replace MCP. Connect the server (stdio or HTTPS) or the agent will refuse to invent numbers.

Agensi zip:

```text
ga-to-grok/
  SKILL.md
  VERSION.txt
  references/
```

Codex metadata: `skills/ga-to-grok/agents/openai.yaml`.

---

## 6. CLI — full validation workflow

```bash
npm run cli -- help
npm run cli -- list-properties
npm run cli -- audit-web --account WEB --container WEB --property 123
npm run cli -- cutover-checklist ...
```

Full reference: [docs/CLI.md](docs/CLI.md)

---

## 7. Main MCP tools

### GA4

| Tool | Description |
|------|-------------|
| `list_properties` / `get_property_details` | Discovery |
| `get_traffic_overview` | Users, sessions, bounce rate… |
| `get_top_pages` / `get_acquisition` / `get_devices` | Breakdowns |
| `get_events_summary` / `run_report` / `run_realtime_report` | Events & reports |
| `analyze_ecommerce_data` | Funnel, revenue, AOV, data quality |

### GTM Web / sGTM / MP

| Tool | Description |
|------|-------------|
| `audit_ga4_setup_v2` | Full audit + optional live GA4 |
| `validate_ecommerce_events` | Official ecommerce schema |
| `create_ga4_event_setup` | Phase 3 write (confirm required) |
| `audit_sgtm_setup` / `compare_dual_tagging` / `cutover_checklist` | Server-side path |
| `verify_ga4_secrets` / `configure_measurement_protocol` | Secrets & setup |

### Search Console

| Tool | Description |
|------|-------------|
| `list_search_console_sites` / `get_search_console_site` | Properties |
| `list_sitemaps` / `get_sitemap` / `submit_sitemap` | Sitemaps (submit is gated) |
| `get_search_overview` / `get_top_queries` / `get_top_search_pages` | Performance |
| `get_query_page_pairs` / `get_search_by_device` / `get_search_by_country` / `get_search_trend` | Breakdowns |
| `inspect_url` / `inspect_urls` | Index status |

### Indexing API

| Tool | Description |
|------|-------------|
| `get_url_notification_metadata` | Last notify status |
| `publish_url_notification` / `publish_url_notifications` | URL_UPDATED / URL_DELETED (gated) |

### PageSpeed & CrUX

| Tool | Description |
|------|-------------|
| `run_pagespeed` / `run_pagespeed_batch` | Lighthouse lab scores |
| `query_crux` / `query_crux_batch` | Real-user Core Web Vitals |

Full catalog for agents: [`skills/ga-to-grok/references/tools.md`](skills/ga-to-grok/references/tools.md)

---

## 8. Standard workflows

### Weekly analytics briefing

`list_properties` → `get_traffic_overview` → acquisition / pages / devices → events → ecommerce if relevant.

### SEO & performance audit

`list_search_console_sites` → `get_top_search_pages` → `query_crux` → `run_pagespeed` → optional `inspect_url` → priority table + 3–5 actions.

### Server-side tracking / cutover

See [docs/SERVER_SIDE_TRACKING_ARCHITECTURE.md](docs/SERVER_SIDE_TRACKING_ARCHITECTURE.md).

Example report shapes: [`skills/ga-to-grok/references/examples.md`](skills/ga-to-grok/references/examples.md)

---

## 9. CI/CD

| Workflow | When | What |
|----------|------|------|
| **CI** | push / PR | typecheck + lint + test + build + CLI smoke |
| **Validate** | manual (+ optional weekly cron) | live pipeline with SA secret |

```bash
npm run lint
npm test
npm run typecheck
```

→ [docs/CI_CD.md](docs/CI_CD.md)

---

## 10. Documentation index

| Doc | Content |
|-----|---------|
| **[skills/ga-to-grok/SKILL.md](skills/ga-to-grok/SKILL.md)** | **Agent skill (marketer workflows)** |
| **[docs/CLAUDE_SETUP.md](docs/CLAUDE_SETUP.md)** | **Claude Code skill install** |
| **[docs/CODEX_SETUP.md](docs/CODEX_SETUP.md)** | **Codex skill install** |
| [skills/ga-to-grok/references/setup.md](skills/ga-to-grok/references/setup.md) | Connect — 3 solutions |
| [PRESENTATION.md](docs/PRESENTATION.md) | Pitch & marketing guide |
| [GROK_BUILD.md](docs/GROK_BUILD.md) | Grok Build packaging |
| [GROK_SETUP.md](docs/GROK_SETUP.md) | Connectors + Build overview |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker / Fly / Railway |
| [CLI.md](docs/CLI.md) | All CLI commands |
| [CI_CD.md](docs/CI_CD.md) | GitHub Actions |
| [GTM_INTEGRATION.md](docs/GTM_INTEGRATION.md) | GTM ↔ GA4 specs |
| [PHASE3_WRITE.md](docs/PHASE3_WRITE.md) | Controlled GTM writes |
| [MEASUREMENT_PROTOCOL.md](docs/MEASUREMENT_PROTOCOL.md) | MP setup |
| [SERVER_SIDE_TRACKING_ARCHITECTURE.md](docs/SERVER_SIDE_TRACKING_ARCHITECTURE.md) | sGTM architecture |
| [CACHING.md](docs/CACHING.md) | Redis |

---

## 11. Project layout

```text
.grok/config.toml
.mcp.json
skills/ga-to-grok/          # shared skill (Agensi, Claude, Codex)
  agents/openai.yaml      # Codex appearance metadata
scripts/install-skill.sh  # copies skill into .claude / .codex
src/
  google/                 # data-api, gtm, search-console, indexing, pagespeed, crux
  tools/                  # tool definitions + zod schemas
  auth/ cache/ utils/
docs/
```

---

## License

Apache-2.0

---

Built for the Grok ecosystem by [Geoking2104](https://github.com/Geoking2104) / **KayrosLab**
