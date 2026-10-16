# Install GA-to-Grok as a Claude skill

The skill is the same `SKILL.md` used by Agensi and Grok. Claude Code loads it from a skills folder.

## Where to put it

| Scope | Path |
|-------|------|
| This project | `.claude/skills/ga-to-grok/` |
| Your user (all projects) | `~/.claude/skills/ga-to-grok/` |

The folder must contain `SKILL.md`. `references/` is loaded on demand.

## Install (project)

From the repo root:

```bash
mkdir -p .claude/skills
# copy
cp -R skills/ga-to-grok .claude/skills/ga-to-grok
# or symlink so updates stay in sync
ln -s ../../skills/ga-to-grok .claude/skills/ga-to-grok
```

Windows (PowerShell, copy):

```powershell
New-Item -ItemType Directory -Force -Path .claude\skills | Out-Null
Copy-Item -Recurse -Force skills\ga-to-grok .claude\skills\ga-to-grok
```

## Install (user)

```bash
mkdir -p ~/.claude/skills
cp -R skills/ga-to-grok ~/.claude/skills/ga-to-grok
```

Restart Claude Code (or start a new session) so it picks up the skill.

## Connect live data (required)

The skill does not store credentials. Claude needs the MCP server connected.

### Project MCP (`.mcp.json`)

This repo already ships [`.mcp.json`](../.mcp.json) for local stdio:

```json
{
  "mcpServers": {
    "ga-to-grok": {
      "command": "node",
      "args": ["dist/index.js", "--transport", "stdio"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/absolute/path/to/sa.json"
      }
    }
  }
}
```

Build first: `npm install && npm run build`.

### Remote HTTP

Point Claude at your deployed server (`https://your-host/mcp`) via Claude’s MCP / connector settings. Set `MCP_API_TOKEN` on the server and send `Authorization: Bearer <token>`.

## Verify

1. Skill is listed (description mentions GA4, GTM, Search Console).
2. MCP tools are visible (`list_properties`, `get_traffic_overview`, …).
3. Ask: “List my GA4 properties.”

If tools are missing, the skill will explain setup and will not invent numbers.

## Notes

- Frontmatter needs `name` and `description`. `name` must match the folder (`ga-to-grok`).
- Writes stay gated (`confirm=true` + env flags). Do not enable them unless you intend to mutate GTM / Search Console / Indexing.
