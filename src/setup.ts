#!/usr/bin/env node
import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { listProperties } from "./google/admin-api.js";
import { listSearchConsoleSites } from "./google/search-console.js";

const root = resolve(process.cwd());
const app = express();
const port = Number(process.env.GOOGLE_GROWTH_SETUP_PORT || 4178);
const credentialsPath = join(homedir(), ".config", "google-growth", "service-account.json");

const page = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Configuration Google Growth</title><style>
:root{font:16px/1.5 system-ui,sans-serif;color:#202124;background:#f6f8fc}*{box-sizing:border-box}body{margin:0}.wrap{max-width:900px;margin:34px auto;padding:0 20px}.card{background:white;border:1px solid #dfe3eb;border-radius:16px;padding:24px;margin:16px 0;box-shadow:0 3px 14px #1f293708}h1{font-size:30px;margin:0}h2{font-size:21px;margin:0 0 8px}.muted{color:#5f6368}.step{display:flex;gap:14px}.num{background:#e8f0fe;color:#174ea6;border-radius:50%;width:34px;height:34px;flex:0 0 34px;text-align:center;padding-top:4px;font-weight:700}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}button,.button{border:0;border-radius:8px;padding:10px 16px;background:#1a73e8;color:#fff;font:inherit;cursor:pointer}button.secondary{background:#e8f0fe;color:#174ea6}button:disabled{opacity:.55;cursor:wait}input,select{font:inherit;padding:10px;border:1px solid #c7cbd1;border-radius:8px}.status{padding:10px 12px;border-radius:8px;margin:12px 0;background:#f1f3f4}.ok{background:#e6f4ea;color:#137333}.err{background:#fce8e6;color:#b3261e}pre{white-space:pre-wrap;overflow:auto;background:#f6f8fc;padding:14px;border-radius:8px;font-size:13px}.hidden{display:none}a{color:#1a73e8}.badge{display:inline-block;background:#e6f4ea;color:#137333;padding:3px 8px;border-radius:99px;font-size:13px}.small{font-size:13px}
</style></head><body><main class="wrap"><h1>Configurer Google Growth</h1><p class="muted">Assistant local en 6 étapes. Les identifiants restent sur cet ordinateur et les accès sont en lecture seule.</p>
<section class="card step"><div class="num">1</div><div><h2>Choisissez votre assistant</h2><p class="muted">La configuration générée dépend du client et de son mode de connexion.</p><select id="client"><option value="codex">Codex (application / CLI)</option><option value="claude">Claude Code</option><option value="grok-build">Grok Build (local)</option><option value="grok-web">Grok sur le Web (connecteur hébergé)</option></select></div></section>
<section class="card step"><div class="num">2</div><div><h2>Autorisez Google Analytics et Search Console</h2><p>Dans Google Cloud, activez les API Analytics Data, Analytics Admin et Search Console. Ajoutez l’adresse du compte de service comme <b>Lecteur</b> dans GA4 et comme utilisateur de la propriété Search Console.</p><div class="row"><a target="_blank" rel="noreferrer" href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com">Activer Analytics Data API</a><a target="_blank" rel="noreferrer" href="https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com">Activer Analytics Admin API</a><a target="_blank" rel="noreferrer" href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com">Activer Search Console API</a><a target="_blank" rel="noreferrer" href="https://analytics.google.com/">Ouvrir GA4</a></div><p><input id="keyfile" type="file" accept="application/json,.json"></p><button id="savekey">Enregistrer et vérifier le compte de service</button><div id="keyresult" class="status">Aucun fichier de compte de service enregistré.</div></div></section>
<section class="card step"><div class="num">3</div><div><h2>Connectez le serveur MCP</h2><p class="muted">Générez une configuration prête à copier. Le fichier de configuration du client est sauvegardé avant toute modification.</p><button id="configure">Générer ma configuration</button><div id="configresult" class="status hidden"></div><pre id="snippet" class="hidden"></pre><button id="copy" class="secondary hidden">Copier la configuration</button><p class="small">Après l'enregistrement, redémarrez Codex, Claude Code ou Grok Build pour charger le serveur MCP.</p></div></section>
<section class="card step"><div class="num">4</div><div><h2>Vérifiez les connexions</h2><p class="muted">Ce contrôle interroge les accès en lecture seule et indique séparément les services accessibles.</p><button id="check">Lancer le diagnostic Google</button><div id="checkresult" class="status">Diagnostic non lancé.</div></div></section>
<section class="card step"><div class="num">5</div><div><h2>Rapports et résultats</h2><p>Les rapports générés par un assistant apparaissent dans la conversation. Pour produire un fichier local Markdown ou CSV, utilisez la commande CLI indiquée ci-dessous.</p><pre>npm run cli -- traffic --property ID --start 28daysAgo --end yesterday --format md --output rapport-trafic.md</pre><span class="badge">Aucun enregistrement silencieux des rapports</span></div></section>
<section class="card step"><div class="num">6</div><div><h2>Sécurité par défaut</h2><p>Google Growth n’accorde que des droits de lecture. Les écritures GA4, GTM, Search Console et Indexing restent désactivées. Grok sur le Web requiert une URL HTTPS publique et un jeton MCP fort.</p><p class="small muted">Le fichier JSON est conservé dans le dossier privé de Google Growth. Il n’est jamais inclus dans le texte de configuration ni transmis au modèle.</p></div></section>
<p class="muted small">Cette page écoute uniquement sur 127.0.0.1. Fermez le terminal pour arrêter l’assistant de configuration.</p></main><script>
const $=s=>document.querySelector(s);async function call(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw new Error(data.error||'Erreur');return data}function show(el,text,ok){el.textContent=text;el.className='status '+(ok?'ok':'err')}
$('#savekey').onclick=async()=>{const f=$('#keyfile').files[0];if(!f)return show($('#keyresult'),'Sélectionnez le fichier JSON téléchargé depuis Google Cloud.',false);try{const credentials=JSON.parse(await f.text());const d=await call('/api/credentials',{credentials});show($('#keyresult'),'Compte de service enregistré : '+d.email+'. Les clés privées restent locales.',true)}catch(e){show($('#keyresult'),e.message,false)}};
$('#configure').onclick=async()=>{try{const d=await call('/api/configure',{client:$('#client').value});show($('#configresult'),d.message,true);$('#snippet').textContent=d.snippet;$('#snippet').classList.remove('hidden');$('#copy').classList.remove('hidden')}catch(e){show($('#configresult'),e.message,false)}};
$('#copy').onclick=async()=>{await navigator.clipboard.writeText($('#snippet').textContent);$('#copy').textContent='Copié'};
$('#check').onclick=async()=>{const b=$('#check');b.disabled=true;try{const d=await call('/api/check',{client:$('#client').value});const lines=d.checks.map(x=>(x.ok?'✓ ':'✗ ')+x.name+': '+x.message);show($('#checkresult'),lines.join(' · '),d.checks.every(x=>x.ok));}catch(e){show($('#checkresult'),e.message,false)}finally{b.disabled=false}};
</script></body></html>`;

app.disable("x-powered-by");
app.use((req, res, next) => {
  if (!["127.0.0.1", "localhost", "::1"].includes(req.hostname)) {
    return res.status(403).json({ error: "L’assistant de configuration accepte uniquement les requêtes locales." });
  }
  next();
});
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => res.type("html").send(page));
app.get("/api/status", (_req, res) => res.json({ credentialsConfigured: existsSync(credentialsPath) }));
app.post("/api/credentials", (req, res) => {
  const c = req.body?.credentials;
  if (c?.type !== "service_account" || !c.client_email || !c.private_key) {
    return res.status(400).json({ error: "Ce fichier ne ressemble pas à un fichier JSON de compte de service Google." });
  }
  mkdirSync(dirname(credentialsPath), { recursive: true });
  if (existsSync(credentialsPath)) {
    const backupPath = join(dirname(credentialsPath), `service-account.backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync(backupPath, readFileSync(credentialsPath), { mode: 0o600 });
  }
  writeFileSync(credentialsPath, JSON.stringify(c, null, 2), { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  delete process.env.GOOGLE_CREDENTIALS_JSON;
  res.json({ email: c.client_email });
});
app.post("/api/configure", (req, res) => {
  if (!existsSync(credentialsPath)) return res.status(400).json({ error: "Ajoutez d'abord le fichier JSON du compte de service à l'étape 2." });
  const client = String(req.body?.client || "");
  const serverArgs = [resolve(root, "dist", "index.js"), "--transport", "stdio"];
  const env = { GOOGLE_APPLICATION_CREDENTIALS: credentialsPath, GA4_WRITE_ENABLED: "false", GTM_WRITE_ENABLED: "false", SEARCH_CONSOLE_WRITE_ENABLED: "false", INDEXING_WRITE_ENABLED: "false" };
  let configPath = "";
  let snippet = "";
  if (client === "claude") {
    configPath = join(root, ".mcp.json");
    let cfg: any = {};
    try { if (existsSync(configPath)) cfg = JSON.parse(readFileSync(configPath, "utf8")); } catch { return res.status(400).json({ error: ".mcp.json existe mais n'est pas un JSON valide; corrigez-le avant de continuer." }); }
    cfg.mcpServers ||= {};
    cfg.mcpServers["google-growth"] = { command: process.execPath, args: serverArgs, env };
    snippet = JSON.stringify(cfg, null, 2);
    writeConfig(configPath, snippet + "\n");
  } else if (client === "codex") {
    configPath = join(process.env.CODEX_HOME || join(homedir(), ".codex"), "config.toml");
    snippet = `[mcp_servers.google-growth]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${serverArgs.map((arg) => JSON.stringify(arg)).join(", ")}]\n\n[mcp_servers.google-growth.env]\nGOOGLE_APPLICATION_CREDENTIALS = ${JSON.stringify(credentialsPath)}\nGA4_WRITE_ENABLED = "false"\nGTM_WRITE_ENABLED = "false"\nSEARCH_CONSOLE_WRITE_ENABLED = "false"\nINDEXING_WRITE_ENABLED = "false"`;
    const current = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
    const merged = replaceTomlTable(current, "mcp_servers.google-growth", snippet);
    writeConfig(configPath, merged);
  } else if (client === "grok-build") {
    configPath = join(root, ".grok", "config.toml");
    snippet = `[mcp_servers.google-growth]\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${serverArgs.map((arg) => JSON.stringify(arg)).join(", ")}]\nstartup_timeout_sec = 45\ntool_timeout_sec = 600\n\n[mcp_servers.google-growth.env]\nGOOGLE_APPLICATION_CREDENTIALS = ${JSON.stringify(credentialsPath)}\nGA4_WRITE_ENABLED = "false"\nGTM_WRITE_ENABLED = "false"\nSEARCH_CONSOLE_WRITE_ENABLED = "false"\nINDEXING_WRITE_ENABLED = "false"`;
    const current = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
    writeConfig(configPath, replaceTomlTable(current, "mcp_servers.google-growth", snippet));
  } else if (client === "grok-web") {
    snippet = "Grok Web nécessite un serveur Google Growth déployé sur une URL HTTPS publique, puis un connecteur MCP personnalisé dans https://grok.com/connectors. Configurez MCP_API_TOKEN sur l'hôte et utilisez Authorization: Bearer <jeton>. Le fichier de clé Google ne doit pas être envoyé à Grok.";
    return res.json({ message: "Le connecteur Web ne peut pas être installé localement : suivez ces instructions d'hébergement.", snippet });
  } else return res.status(400).json({ error: "Client non reconnu." });
  res.json({ message: `Configuration enregistrée : ${configPath}. Une sauvegarde .bak est conservée si le fichier existait.`, snippet });
});
app.post("/api/check", async (_req, res) => {
  const checks: { name: string; ok: boolean; message: string }[] = [];
  if (!existsSync(credentialsPath)) return res.status(400).json({ error: "Ajoutez d'abord le fichier JSON de compte de service à l'étape 2." });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
  delete process.env.GOOGLE_CREDENTIALS_JSON;
  try { const d = await listProperties(); checks.push({ name: "Google Analytics", ok: d.properties.length > 0, message: `${d.properties.length} propriété(s) visible(s)` }); }
  catch (e: any) { checks.push({ name: "Google Analytics", ok: false, message: safeError(e) }); }
  try { const sites = await listSearchConsoleSites(); checks.push({ name: "Search Console", ok: sites.length > 0, message: `${sites.length} propriété(s) visible(s)` }); }
  catch (e: any) { checks.push({ name: "Search Console", ok: false, message: safeError(e) }); }
  try {
    const env = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    const client = new Client({ name: "google-growth-setup", version: "0.8.0" }, { capabilities: {} });
    const transport = new StdioClientTransport({ command: process.execPath, args: [resolve(root, "dist", "index.js"), "--transport", "stdio"], env });
    await client.connect(transport);
    const result = await client.listTools();
    await client.close();
    checks.push({ name: "Serveur MCP", ok: result.tools.length > 0, message: `${result.tools.length} outils détectés via STDIO` });
  } catch {
    checks.push({ name: "Serveur MCP", ok: false, message: "Impossible de démarrer le serveur local. Compilez le projet avec npm run build." });
  }
  res.json({ checks });
});

function safeError(e: any) {
  const status = e?.response?.status || e?.code;
  if (status === 403 || status === 7) return "Accès refusé. Vérifiez l'API activée et l'accès du compte de service.";
  if (status === 401 || status === 16) return "Identifiants refusés. Téléchargez un nouveau fichier de compte de service.";
  return "Échec de connexion. Vérifiez le réseau, l'API Google et les autorisations.";
}
function writeConfig(path: string, text: string) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) writeFileSync(path + ".bak", readFileSync(path));
  writeFileSync(path, text, { mode: 0o600 });
}
function replaceTomlTable(current: string, section: string, replacement: string) {
  const header = `[${section}]`;
  const lines = current.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === header);
  if (start < 0) return `${current.trimEnd()}${current.trim() ? "\n\n" : ""}${replacement}\n`;
  let end = start + 1;
  while (end < lines.length) {
    const match = lines[end].trim().match(/^\[([^\]]+)\]$/);
    if (match && match[1] !== section && !match[1].startsWith(`${section}.`)) break;
    end++;
  }
  return [...lines.slice(0, start), replacement, ...lines.slice(end)].join("\n").replace(/\n*$/, "\n");
}

const host = "127.0.0.1";
const server = app.listen(port, host, () => {
  const url = `http://${host}:${port}`;
  console.log(`Google Growth Setup : ${url}`);
  console.log("Ouvrez cette adresse dans votre navigateur. Arrêtez avec Ctrl+C.");
  import("node:child_process").then(({ exec }) => {
    const command = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
    exec(command, () => undefined);
  });
});
process.on("SIGINT", () => server.close(() => process.exit(0)));
