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

## Connect — three solutions

| Solution | Best for | What you need |
|----------|----------|----------------|
| **A. Custom Connector (HTTPS)** | Marketing teams, Grok web | Deploy once; add URL in [grok.com/connectors](https://grok.com/connectors) |
| **B. Local stdio** | Developers | Clone, build, Service Account on the machine |
| **C. Skill only** | Method / docs | Installs workflows, **no live data** until A or B |

Recommended for a marketing team: Solution A, Service Account invited to GA4 / GTM / Search Console, optional PageSpeed and CrUX API keys, then a test prompt such as “List my GA4 properties”.

Step-by-step: [`skills/ga-to-grok/references/setup.md`](skills/ga-to-grok/references/setup.md) · [docs/GROK_SETUP.md](docs/GROK_SETUP.md)

---

## 5. Skill for Agensi, Claude, and Codex

Canonical skill: `skills/ga-to-grok/` (`SKILL.md` + `references/`).

| Agent | Install path | Guide |
|-------|----------------|-------|
| Agensi | zip of `ga-to-grok/` | see below |
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

---

## Documentation index (skill install)

| Doc | Content |
|-----|---------|
| [docs/CLAUDE_SETUP.md](docs/CLAUDE_SETUP.md) | Claude Code skill + MCP |
| [docs/CODEX_SETUP.md](docs/CODEX_SETUP.md) | Codex skill + MCP |
| [skills/ga-to-grok/SKILL.md](skills/ga-to-grok/SKILL.md) | Agent skill |
| [docs/GROK_SETUP.md](docs/GROK_SETUP.md) | Grok connectors |
