# Install GA-to-Grok as a Codex skill

Codex uses the same `SKILL.md` format (`name` + `description` required). Extra keys are ignored.

## Where to put it

| Scope | Path |
|-------|------|
| This project (Codex) | `.codex/skills/ga-to-grok/` |
| This project (agents) | `.agents/skills/ga-to-grok/` |
| Your user | `~/.codex/skills/ga-to-grok/` or `~/.agents/skills/ga-to-grok/` |

Prefer **one** location so you do not load the skill twice. Project-scoped is best for a team.

## Install (project)

```bash
mkdir -p .codex/skills
cp -R skills/ga-to-grok .codex/skills/ga-to-grok
# or
ln -s ../../skills/ga-to-grok .codex/skills/ga-to-grok
```

Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force -Path .codex\skills | Out-Null
Copy-Item -Recurse -Force skills\ga-to-grok .codex\skills\ga-to-grok
```

Restart Codex if the skill does not appear.

## Codex metadata

`skills/ga-to-grok/agents/openai.yaml` sets the display name and a default prompt. Codex reads it when present; other agents ignore it.

## Connect live data (required)

The skill is a method. Live numbers come from the MCP server.

### Local stdio

```bash
npm install && npm run build
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/sa.json
```

Register the server in Codex MCP settings (stdio):

```text
command: node
args: dist/index.js --transport stdio
```

### Remote HTTP

URL: `https://your-host.example.com/mcp`  
Header: `Authorization: Bearer <MCP_API_TOKEN>` if the server sets a token.

## Verify

1. Skill `ga-to-grok` is listed. Invoke with `$ga-to-grok` or ask in plain language.
2. MCP tools are available.
3. Ask: “Traffic overview for the last 7 days.”

If MCP is not connected, the skill must say so and must not invent metrics.

## Notes

- `description` should stay a single line under 500–1024 characters (Codex sanitizes it).
- Indexing API writes are officially intended for job postings and livestream structured data.
