# GA-to-Grok CLI

Commands aligned with the GA4 / GTM / Search Console / performance workflows.

## Install / build

```bash
npm install
npm run build
npm run cli -- help
```

Environment: see `.env.example`.

---

## Discovery

```bash
npm run cli -- list-properties
npm run cli -- list-sgtm
npm run cli -- list-search-sites
```

## Search Console

```bash
npm run cli -- search-overview --site "https://example.com/"
npm run cli -- top-queries --site "https://example.com/" --limit 20
npm run cli -- inspect-url --site "https://example.com/" --url "https://example.com/page"
```

## Performance

```bash
npm run cli -- pagespeed --url "https://example.com/" --strategy mobile
npm run cli -- crux --origin "https://example.com" --form-factor PHONE
```

## Analytics and sGTM

```bash
npm run cli -- traffic --property 123456789 --start 7daysAgo
npm run cli -- analyze-ecommerce --property 123456789
npm run cli -- audit-web --account 111 --container 222 --property 123456789
npm run cli -- cutover-checklist ...
```

See `npm run cli -- help` for the full list.
