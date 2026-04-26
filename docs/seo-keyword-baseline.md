# SEO keyword baseline — SnakeConverter

## Purpose

Use Search Console (and optionally Ahrefs / Google Keyword Planner) to **measure and prioritize** which spoke pages to add next. This file is a **process + seed list**, not a source of traffic guarantees.

## Local / CI

After clone, generate spoke HTML and refresh `sitemap.xml` (see `scripts/micro-routes.cjs` for the URL list): `npm run seo`. Production builds also run this via `node build.js` so Cloudflare deploys always include the latest spokes.

## How to use

1. Export **GSC** queries: Performance → Search results → last 3 months → filter by `snakeconverter.com` → download.
2. Tag each query: `unit` | `calc` | `finance` | `date` | `brand` | `other`.
3. For high-impression, low-CTR rows: check title/H1 on the **landing** URL (spoke or hub) and the SERP preview.
4. Add confirmed winners to **Backlog (priority)** below; ship new spoke pages in batches of 20–50.

## Seed / high-value intents (industry)

Aligns with the micro-page plan (long-tail, one intent per URL).

| Cluster        | Example queries (EN)        | Notes |
|----------------|-----------------------------|--------|
| Length         | cm to inches, feet to meters | High volume; core spoke |
| Weight         | kg to lbs, lbs to kg, oz to g | E‑commerce adjacency |
| Temperature    | celsius to fahrenheit         | Evergreen |
| Volume         | liters to gallons, ml to oz | US + UK gallon variants in copy |
| Speed          | kmh to mph, mph to kmh     | |
| Data           | MB to GB, GB to TB, Mbps to MB/s | Dev / IT |
| Percentage     | percentage calculator, X% of Y | |
| Date           | days between dates, age calculator | |
| Finance        | loan calculator, compound interest | Higher RPM, lower volume |

## Backlog (priority) — fill from your data

| Query / intent | Proposed URL slug | Status |
|----------------|-------------------|--------|
| (add from GSC) | | |

## TR market

Repeat the same process in **Google Search Console** for Turkish property or filter by country `Turkey` and `page` under `/tr/`. Add rows to the backlog for `tr/convert/...` and `tr/calculators/...` when you localise.
