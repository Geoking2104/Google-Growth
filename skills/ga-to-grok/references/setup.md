# Connect the GA-to-Grok MCP server

Source repo — https://github.com/Geoking2104/GA-to-Grok

Apache-2.0 · Node ≥ 20 · Service Account auth.

This skill works with any agent that can call MCP tools (Grok, Claude Code, Cursor, Codex, Gemini CLI, etc.). The MCP server must be running and connected; the skill never stores credentials.

## Prerequisites

Google Cloud project with APIs enabled

- Google Analytics Data API
- Google Analytics Admin API
- Tag Manager API (if GTM / sGTM tools are needed)

Service Account JSON. Grant the SA email

- GA4 property — Viewer (Editor only if creating MP secrets)
- GTM accounts — Read (Edit only for Phase 3 tag/trigger creation)

Scopes used by the server

- analytics.readonly
- analytics.edit (MP secret creation)
- tagmanager.readonly
- tagmanager.edit.containers (Phase 3 writes)

Safety env (recommended in prod)

```
GA4_WRITE_ENABLED=false
GTM_WRITE_ENABLED=false
```

Auth env (pick one)

```
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/sa.json
# or
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
```

Optional default property

```
GA4_PROPERTY_ID=123456789
```

Transport

```
TRANSPORT=stdio   # local / Grok Build
# or
TRANSPORT=http
PORT=3000
```

## Path A — Remote HTTPS (most users)

1. Deploy the server with `TRANSPORT=http` and public HTTPS (Docker / Fly / Railway / VPS).
2. Preferred endpoint: `https://your-host.example.com/mcp` (Streamable HTTP).
   Legacy clients can use `/sse`.
3. Add the URL as a Custom Connector / MCP server in your agent.
4. Optional: set `MCP_API_TOKEN` on the server and send `Authorization: Bearer <token>`.

Quick local tunnel for tests

```
git clone https://github.com/Geoking2104/GA-to-Grok.git
cd GA-to-Grok
npm install && npm run build
# set credentials in .env
npm run start:http
# then ngrok http 3000 → https://xxxx.ngrok-free.app/mcp
```

Docker sketch

```
docker run -p 3000:3000 \
  -e TRANSPORT=http \
  -e GOOGLE_CREDENTIALS_JSON='...' \
  -e GA4_PROPERTY_ID=123456789 \
  ga-to-grok
```

Docs in the repo — `docs/GROK_SETUP.md`, `docs/DEPLOYMENT.md`, `docs/VPS_DEPLOY.md`.

## Path B — Local stdio (developers)

```
git clone https://github.com/Geoking2104/GA-to-Grok.git
cd GA-to-Grok
npm install && npm run build
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
```

The repo ships `.grok/config.toml` and `.mcp.json` for Grok Build / Cursor / Claude Code. Tools appear with a prefix such as `ga-to-grok__<tool_name>`.

Register in Grok Build

```
grok mcp add --scope project ga-to-grok -- node dist/index.js --transport stdio
grok mcp add --transport http ga-to-grok https://your-host.example.com/mcp
```

Details — `docs/GROK_BUILD.md`.

## Path C — skill only

Installing this skill does not start the MCP server. You still need Path A or B for live data.

## If tools are missing

1. Confirm the agent can list MCP tools and that a GA4/GTM-related tool appears.
2. Confirm the Service Account email is invited to the GA4 property (and GTM account) in Google Admin.
3. Confirm the required APIs are enabled and `TRANSPORT` matches how the agent is attached (stdio vs HTTP).
4. Do not invent traffic or revenue.
