# Assistant de configuration Google Growth

## Démarrer

Prérequis : Node.js 20 ou plus récent. Depuis le dossier du dépôt :

```powershell
npm install
npm run build
npm run setup
```

Le navigateur ouvre l’assistant sur `http://127.0.0.1:4178`. L’assistant écoute exclusivement sur la boucle locale. Gardez la fenêtre de terminal ouverte jusqu’à la fin. Arrêtez-le avec `Ctrl+C`.

## Parcours

1. Sélectionnez Codex, Claude Code, Grok Build ou Grok Web.
2. Dans Google Cloud, activez Analytics Data API, Analytics Admin API et Search Console API. Ajoutez l’adresse e-mail du compte de service comme Lecteur dans GA4. Ajoutez-la également à la propriété Search Console si vous voulez vérifier les données SEO.
3. Téléversez le JSON du compte de service téléchargé depuis Google Cloud. Il est écrit dans `~/.config/google-growth/service-account.json` (sous Windows, le dossier `.config` se trouve dans votre profil utilisateur). Seul le serveur local reçoit ce fichier; la clé privée n’est jamais ajoutée à la configuration MCP ou transmise au modèle. Une clé existante est sauvegardée avant remplacement.
4. Générez la configuration du client. Codex écrit le bloc `mcp_servers.google-growth` dans `%CODEX_HOME%\config.toml` (ou `%USERPROFILE%\.codex\config.toml`). Claude Code met à jour `.mcp.json` dans le dépôt. Grok Build met à jour `.grok/config.toml`. Un fichier de configuration existant est sauvegardé en `.bak`.
5. Redémarrez le client MCP, puis lancez le diagnostic. Il vérifie l’accès GA4, Search Console et l’échange MCP STDIO local. Une absence de propriété Search Console est signalée comme accès non configuré; elle n’empêche pas d’utiliser GA4.
6. Les résultats demandés à l’assistant restent dans la conversation. Pour créer un fichier local, utilisez `npm run cli -- traffic --property <ID> --format md|csv --output <chemin>`.

## Particularités des clients

- **Codex** : le réglage est global à l’utilisateur; redémarrez Codex pour charger le serveur.
- **Claude Code** : le réglage est au dépôt via `.mcp.json`; redémarrez Claude Code.
- **Grok Build** : configuration locale au dépôt; redémarrez Grok Build depuis le dossier du dépôt.
- **Grok Web** : une configuration locale ne peut pas être atteinte par un connecteur Web. Déployez le serveur sur un hôte HTTPS public, définissez `MCP_API_TOKEN` et créez un connecteur personnalisé avec l’URL `/mcp` et le header `Authorization: Bearer <jeton>`. N’envoyez jamais la clé de compte de service au connecteur.

## Sécurité

Les API sont utilisées en lecture seule par défaut. Les autorisations Google « Lecteur » suffisent pour les rapports GA4. Les mutations restent bloquées sans activation explicite des drapeaux de permission et confirmation de l’outil. Le transport HTTP n’écoute que sur `127.0.0.1` par défaut. Toute écoute sur une interface non locale est refusée sans `MCP_API_TOKEN`; configurez un jeton long et aléatoire sur un hôte distant. CORS est désactivé par défaut et peut être limité avec `CORS_ORIGIN` si un client navigateur en a besoin.

## Résoudre les problèmes

- **Aucune propriété GA4** : vérifiez que Analytics Data et Analytics Admin API sont actives et que l’adresse e-mail du JSON est ajoutée en Lecteur à la propriété GA4.
- **Aucun site Search Console** : ajoutez le compte de service comme utilisateur de la propriété Search Console. Cette autorisation est indépendante du rôle GA4.
- **Le handshake STDIO échoue** : vérifiez que `npm run build` a réussi; redémarrez le client après génération de la configuration.
- **Grok Web n’est pas joignable** : utilisez une URL HTTPS publique, un jeton bearer côté serveur et dans la configuration du connecteur.
