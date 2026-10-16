# Google Growth

Agent skill for live **GA4**, **GTM**, **Search Console**, **PageSpeed**, and **CrUX**.

It teaches the agent how to brief, audit, and prioritize. It does **not** include credentials or the MCP server.

## What you get

- Weekly analytics briefings from real API data
- SEO and performance priority tables (Search Console + CrUX + PageSpeed)
- GTM and server-side tracking audits
- Gated writes only (sitemap, Indexing API, GTM tags)

## Prerequisite

Connect the open-source MCP server: https://github.com/Geoking2104/google-growth

Without that connection the skill explains setup and refuses to invent numbers.

## Install

Unzip so `SKILL.md` sits at the root of `google-growth/`:

```text
google-growth/
  SKILL.md
  README.md
  VERSION.txt
  references/
  agents/
```

| Agent | Path |
|-------|------|
| Claude | `~/.claude/skills/google-growth/` |
| Codex | `~/.codex/skills/google-growth/` |
| Cursor | `~/.cursor/skills/google-growth/` |

## License

Apache-2.0
