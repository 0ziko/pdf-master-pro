# On-page SEO — SnakeConverter (sitemap / execution guide)

**Purpose:** “Production-grade” on-page: intent, URLs, unique copy, internal links, schema, CWV, and measurement — not template-only title swaps. For **per-page QA** on new spokes, also use [quality-gate-checklist.md](quality-gate-checklist.md).

**Related:** [url-slug-standard.md](url-slug-standard.md) (paths, hreflang, self-canonical for EN/TR twins).

---

## 1) Before you scale: search intent (mandatory)

Same topic can mean different **search intent**. The format (dedicated page vs on-page block) must follow intent, or you get thin or cannibalized URLs.

| Query / intent (examples) | Preferred format | Notes |
|---------------------------|------------------|--------|
| Unit pair + “convert / converter” | Primary **micro** spoke, e.g. `/convert/inches-to-cm` | Main transactional intent. |
| “How many … in …” / “how to convert …” (short informational) | **Expanded FAQ and/or H2** on the existing spoke, or a separate long-tail URL only if rules below are clear. | If separate URL, define **canonical** to avoid overlap with the primary spoke. |
| Very narrow programmatic variation, e.g. “10 inches to cm” | **Optional future** “variation” program | **Do not** launch at scale without **Section 2** (canonical cluster policy). |

**Rule of thumb:** Before adding a new URL, ask: *Is this query already fully answered on page X?* If yes, enrich page X; do not clone.

---

## 2) Canonical, hreflang, and variation hierarchy (mandatory)

**EN ↔ TR (existing):**

- Each language version has a **self-referential** `canonical` on its own URL.
- `hreflang="en"`, `hreflang="tr"`, `hreflang="x-default"` (EN URL) on paired pages — see [url-slug-standard.md](url-slug-standard.md).

**Same language, multiple URLs targeting overlapping queries:**

- Pick **one primary** URL for the main commercial intent.
- **Either:** secondary URLs use `rel=canonical` to the primary, **or** use `noindex` (product decision; default for variation tests: **canonical cluster to primary**).
- **Hubs** (`index`, `units`, `calc`, …) keep their own canonical; link down to micro spokes. Spokes are self-canonical (unless a deliberate duplicate variation strategy is documented).

**Cannibalization check (before publish):**

- [ ] This query is not the primary target of another live URL in the same language.
- [ ] If two pages are close, the weaker one is merged, noindexed, or canonicalized — documented in the PR or issue.

---

## 3) Keyword / product term mapping (actionable)

Use **one** primary product word per page type; keep the site’s voice consistent (avoid “Converter” in title and “Tool” in H1 for the same page without reason).

| Page family | Title / H1 term | Example |
|-------------|-------------------|---------|
| Unit micro (`/convert/…`) | **Converter** (or “Convert X to Y” in H1) | Inches to cm **converter** (title) / **Convert** inches to **centimeters** (H1). |
| Calculator micro (`/calculators/…`) | **Calculator** / **Calculate** in H1 | **Percentage** calculator. |
| PDF / file LP | **Tool** or intent noun (merge, compress, …) | “Merge PDF” / “**PDF** compressor” per page. |
| Dev (encoding, hash, …) | **Tool** or **Generator** (if output is generated) | “**UUID** generator”. |

**Title length:** aim **~55–60 characters** for the visible SERP (pixel width also matters; avoid trailing junk).

**Pattern (default):** `PrimaryQuery + short benefit` `|` `SnakeConverter`  
(Exact phrasing is flexible; do not stuff.)

**Meta description (formula):**

- Primary **keyword** once + **speed** (instant, fast) + **no signup** + **browser / local** (whichever is accurate).
- Target **~150–160 characters** with a full sentence.

**H1:**

- Natural **sentence** or title case line: e.g. *Convert inches to centimeters*.  
- Avoid: *Inches to CM Converter Free Online* (token stuffing).

**Soft duplicate ban:**

- **Unique** `<title>`, **unique** `meta name="description"`, and **unique first sentence** of the intro on every page (including regenerated micros).

---

## 4) Mobile, CLS, and Core Web Vitals (CWV) — for tool pages

**Goal:** Real users and Google reward stable, fast UIs. Meta tags do not fix bad LCP/CLS.

- **Above the fold:** real **H1** + one line of static text in HTML (not delayed by JS).
- **Tool UI:** container with **min-height** or skeleton to reduce **Cumulative Layout Shift (CLS)** when the script mounts.
- **JS:** load heavy script **defer** / non-blocking where possible; avoid blocking the first paint of main content.
- **Ads / third-party (future):** reserve space so new banners do not push the tool (layout shift).

**Measure:** after significant changes, spot-check in Lighthouse / PageSpeed (mobile) on **one hub, one micro spoke, one heavy LP** — especially pages that load `units.js`, `app.js`, or large PDF/Canvas. Operasyonel adımlar: [seo-faz4-qa.md](seo-faz4-qa.md) §2.

---

## 5) E-E-A-T (concrete) — for conversion and YMYL-adjacent trust

- **Formulas / factors:** one honest line, e.g. 1 in = 2.54 cm (conventional definition) — do not overclaim.
- **“How we calculate”** short block on micros/hubs where it helps (and **EN + TR** together when the page has both languages — see `js/i18n.js` and project i18n conventions).
- **Last updated:** optional visible line or `dateModified` in structured data for pages that change when formulas or UI change.

For **competitive** LP (PDF tools), add: FAQ, how it works, and trust copy — see [quality-gate-checklist.md](quality-gate-checklist.md).

---

## 6) JSON-LD and social

- **Micro pages / tools:** at minimum **WebPage** (name, description) + where applicable **SoftwareApplication** (free, `offers` price 0) + **FAQPage** (unique questions, no contradictions). Prefer a single `@graph` with consistent entities.
- **OG / Twitter:** `og:title` / `og:description` aligned with title and meta; `og:url` = canonical.

---

## 7) Internal linking (at scale, automate)

- **Generator output** ( `scripts/generate-micro-pages.cjs` ): every spoke should get **2–3 related** same-category links + link back to the **parent hub** — implemented in code, not by hand. See Faz 1 implementation tasks in the product plan.
- Hubs should link to **top** and **category** spokes; spokes link **up** to hub and **sideways** to related spokes (see [url-slug-standard.md](url-slug-standard.md#internal-links)).

---

## 8) Search Console and indexing (staged)

- Do **not** “Inspect” / request indexing for **all** new URLs in one day.
- Roll out: small batch (e.g. sample **micros + hub**), monitor **Coverage** / **Pages**, then expand.
- **Bing Webmaster:** add property and sitemap for additional coverage.

---

## 9) Faz 5 (ongoing): measure and prune (mandatory at scale)

- In **Google Search Console**, find queries with **high impressions, low position** — improve that page’s content and internal links.
- **Zero** clicks + **thin** duplicate: merge, `noindex`, or remove; avoid site-wide dilution.
- If **programmatic variation** pages go live, review them in this pass for **canonical** and performance.
- **Periyot ve adım listesi (uygulama rehberi):** [seo-faz5-iteration.md](seo-faz5-iteration.md).

---

## 10) Where this doc fits in the repo

| Doc | Role |
|-----|------|
| **seo-onpage-checklist.md** (this) | Strategy + mandatory rules for SEO and URL intent. |
| **url-slug-standard.md** | Slug patterns, hreflang, canonical per language, internal link norms. |
| **quality-gate-checklist.md** | Ship checklist for a **single** new spoke (length, FAQ, build). |
| **seo-faz4-qa.md** | Faz 4: duplicate title script, Lighthouse/PSI, GSC/Bing (operational checklist). |
| **seo-faz5-iteration.md** | Faz 5: GSC yineleme + budama (periyot, `npm run seo:faz5:preflight`, kayıt şablonu). |
| **seo-operating-model.md** | Hub-and-spoke, ship sırası, `seo:qa` (duplicate + mikro bütünlük), staging. |

If rules conflict, fix **one** source of truth and link the others.
