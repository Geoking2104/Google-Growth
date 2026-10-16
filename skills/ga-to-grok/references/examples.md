# Example reports (for marketers)

These are the shapes the agent should produce. Never invent the numbers — only fill them from tool results.

## 1. Weekly briefing

**Property** : 123456789  
**Period** : last 28 days

| Metric | Value |
|---|---|
| Users | 42 300 |
| Sessions | 51 100 |
| Top channel | Organic Search |
| Top page | `/` |

**Actions**
1. Organic is the main source — protect SEO on the top 5 pages.
2. Bounce on `/tarifs` is high — review the offer block.
3. Mobile share is 68% — prioritize mobile speed.

## 2. SEO & performance priority table

| Page | Search clicks | LCP field | Score lab | Priority |
|---|---:|---:|---:|---|
| `/` | 8 420 | 3,6 s | 68 | High |
| `/simulateur` | 3 150 | 2,2 s | 84 | Medium |
| `/blog/article` | 1 890 | — | 51 | High |

**Actions**
1. Home — fix LCP (hero image, fonts, TTFB).
2. Blog article — lab score low + high impressions.
3. Confirm indexation on pages with no CrUX data.

## 3. Performance-only snapshot

**URL** : `https://www.example.com/`  
**Strategy** : mobile

| Source | LCP | INP | CLS | Score |
|---|---:|---:|---:|---:|
| PageSpeed (lab) | 2,8 s | 180 ms | 0,05 | 72 |
| CrUX (field) | 3,2 s | 210 ms | 0,06 | — |

**Reading** — lab is optimistic. Prioritize field LCP and INP.

## Thresholds to mention

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP | ≤ 2,5 s | ≤ 4,0 s | > 4,0 s |
| INP | ≤ 200 ms | ≤ 500 ms | > 500 ms |
| CLS | ≤ 0,1 | ≤ 0,25 | > 0,25 |
| Lighthouse | ≥ 90 | 50–89 | < 50 |
