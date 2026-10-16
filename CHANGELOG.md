# Changelog

## 0.7.0 — 2026-10-16

### Added

- Search Console tools: sites, sitemaps, Search Analytics, URL inspection, gated sitemap submit
- Google Indexing API tools (read metadata, gated URL_UPDATED / URL_DELETED)
- PageSpeed Insights and Chrome UX Report (CrUX) tools
- Marketer-oriented skill workflows (briefing, SEO & performance audit)
- Claude Code and Codex install guides, plus `scripts/install-skill.sh`
- CLI commands: `list-search-sites`, `search-overview`, `top-queries`, `inspect-url`, `pagespeed`, `crux`

### Changed

- README, GROK_SETUP, DEPLOYMENT, and PRESENTATION cover the new domains
- `.env.example`, `.mcp.json`, `.grok/config.toml`, and `docker-compose.yml` document the new env vars
- Package version aligned with the skill at `0.7.0`

### Notes

- Writes stay disabled unless the matching env flag is `true` and the tool receives `confirm=true`
- Indexing API is officially intended for job postings and livestream structured data
