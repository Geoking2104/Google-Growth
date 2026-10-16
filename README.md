# GA-to-Grok

**Open-source MCP server** connecting **Google Analytics 4**, **Google Tag Manager**, **Search Console**, **PageSpeed Insights**, and **CrUX** to **Grok**, **Claude**, and **Codex**.

The **skill** is named **Google Growth** (`google-growth`). The **MCP server** stays `ga-to-grok`.

| Client | How to connect | Skill install |
|--------|----------------|---------------|
| **Grok** (xAI) | [grok.com/connectors](https://grok.com/connectors) or Grok Build | Agensi zip of `skills/google-growth/` |
| **Claude** (Anthropic) | Claude Code MCP / `.mcp.json` | `.claude/skills/google-growth/` |
| **Codex** (OpenAI) | Codex MCP settings | `.codex/skills/google-growth/` |

> Compatible with Grok, Claude Code, Codex, and Cursor. Apache-2.0 · Node ≥ 20

---

## Why use it

| Classic LLM | Google Growth |
|-------------|---------------|
| Pasted exports and screenshots | Calls Google APIs directly |
| Can invent numbers | Cites only tool results |
| One source at a time | Crosses GA4, Search Console, PageSpeed, CrUX |
| Advice only | Gated writes |

Skill: [`skills/google-growth/`](skills/google-growth/)

---

## What you can do

| Domain | Capabilities |
|--------|----------------|
| **GA4** | Traffic, acquisition, events, ecommerce |
| **GTM / sGTM** | Audits, dual-tagging, cutover, Measurement Protocol |
| **Search Console** | Queries, pages, sitemaps, URL inspection |
| **Indexing API** | URL notify (gated) |
| **PageSpeed & CrUX** | Lab scores and real-user Core Web Vitals |

---

## Connect

```bash
./scripts/install-skill.sh both
```

| Client | Guide |
|--------|-------|
| Grok | [docs/GROK_SETUP.md](docs/GROK_SETUP.md) |
| Claude | [docs/CLAUDE_SETUP.md](docs/CLAUDE_SETUP.md) |
| Codex | [docs/CODEX_SETUP.md](docs/CODEX_SETUP.md) |

Setup: [`skills/google-growth/references/setup.md`](skills/google-growth/references/setup.md)

---

## 1. Prerequisites

1. Google Cloud project with Analytics Data, Admin, Tag Manager, and Search Console APIs.
2. Service Account invited on GA4, GTM, and Search Console.
3. Optional keys: `PAGESPEED_API_KEY`, `CRUX_API_KEY`, or `GOOGLE_API_KEY`.
4. Node ≥ 20.

Writes are off by default:

```bash
GA4_WRITE_ENABLED=false
GTM_WRITE_ENABLED=false
SEARCH_CONSOLE_WRITE_ENABLED=false
INDEXING_WRITE_ENABLED=false
```

---

## 2. Install & configure

```bash
git clone https://github.com/Geoking2104/GA-to-Grok.git
cd GA-to-Grok
npm install
cp .env.example .env
npm run build
```

---

## 3. Client packaging

| File | Role |
|------|------|
| `.grok/config.toml` | Grok Build MCP (`ga-to-grok`) |
| `.mcp.json` | Claude / Cursor / Codex stdio |
| `skills/google-growth/` | Canonical skill |
| `skills/ga-to-grok/` | Redirect to google-growth |
| `scripts/install-skill.sh` | Installs into `.claude` and `.codex` |

### Claude

```bash
./scripts/install-skill.sh claude
```

### Codex

```bash
./scripts/install-skill.sh codex
```

### Grok

```bash
grok mcp add --scope project ga-to-grok -- node dist/index.js --transport stdio
```

Or [grok.com/connectors](https://grok.com/connectors) → Custom → `https://your-server.com/mcp`.

---

## 4. Run the server

```bash
npm run start:stdio
npm run start:http
docker compose up -d
```

---

## 5. Skill

Canonical folder: `skills/google-growth/`

| Agent | Path |
|-------|------|
| Agensi | zip of `google-growth/` |
| Claude | `.claude/skills/google-growth/` |
| Codex | `.codex/skills/google-growth/` |

Agensi zip:

```text
google-growth/
  SKILL.md
  references/
```

The skill does not replace MCP. Connect the server or the agent will refuse to invent numbers.

---

## 6. CLI

```bash
npm run cli -- help
npm run cli -- list-properties
npm run cli -- list-search-sites
npm run cli -- pagespeed --url https://example.com/
```

---

## 7. Main tools

| Domain | Tools |
|--------|-------|
| GA4 | `list_properties`, `get_traffic_overview`, `get_acquisition`, `analyze_ecommerce_data` |
| Search Console | `list_search_console_sites`, `get_top_queries`, `get_top_search_pages`, `inspect_url` |
| Performance | `run_pagespeed`, `query_crux` |
| GTM / sGTM | `audit_ga4_setup_v2`, `compare_dual_tagging`, `cutover_checklist` |

Catalog: [`skills/google-growth/references/tools.md`](skills/google-growth/references/tools.md)

---

## 8. Workflows

### Weekly briefing

`list_properties` → `get_traffic_overview` → acquisition / pages / devices.

### SEO & performance

`list_search_console_sites` → `get_top_search_pages` → `query_crux` → `run_pagespeed` → priority table.

Examples: [`skills/google-growth/references/examples.md`](skills/google-growth/references/examples.md)

---

## 9. Documentation

| Doc | Content |
|-----|---------|
| [skills/google-growth/SKILL.md](skills/google-growth/SKILL.md) | Skill |
| [docs/CLAUDE_SETUP.md](docs/CLAUDE_SETUP.md) | Claude |
| [docs/CODEX_SETUP.md](docs/CODEX_SETUP.md) | Codex |
| [docs/GROK_SETUP.md](docs/GROK_SETUP.md) | Grok |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker / Fly / Railway |
| [docs/CLI.md](docs/CLI.md) | CLI |

---

## License

Apache-2.0

Built by [Geoking2104](https://github.com/Geoking2104) / **KayrosLab** for Grok, Claude, and Codex.
