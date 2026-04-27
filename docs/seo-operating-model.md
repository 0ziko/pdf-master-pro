# SEO operating model (Hub-and-Spoke + ship discipline)

**Purpose:** Ürün yorumlarıyla hizalanmış, depodaki checklist dosyalarını tamamlayan **tek** operasyonel çerçeve. Ayrıntılı kurallar: [seo-onpage-checklist.md](seo-onpage-checklist.md).

## Mimari: Hub — Spoke

| Rol | Ne işe yarar | SnakeConverter’da |
|-----|----------------|---------------------|
| **Hub** | Niyet + otorite + iç link | `units.html`, `calc.html`, kök LP’ler (`unit-converter.html`, `compress-pdf.html`, …) |
| **Spoke** | Uzun kuyruk, tek sorgu | `convert/`, `calculators/`, `tr/convert/`, `tr/calculators/` |

Kod: `scripts/generate-micro-pages.cjs` — regen: `npm run seo`.

## Tamamlanan teknik temel (Phase 0–1 + E-E-A-T)

- JSON-LD: `WebPage` + `dateModified` (mikro + uygun LP’ler).
- Görünür **last updated** ve **Trust & method** / metodoloji (kök LP: `lp.eeat.*`, i18n EN+TR).
- Mikro: kategori başına farklı **Methodology** metni, intro’da arama niyetine yönelik **semantic** satır, ters çift (ör. inç↔cm) **related** listesinde öncelik.
- Mikro footer: gizlilik + istemci tarafı cümlesi (`microFooterTrustP`).
- `npm run seo:qa` = çift `title`/`description` + **mikro bütünlük** (canonical, hreflang, hub linki).

## QA — sıfır tolerans (ship öncesi)

1. `npm run seo:qa` — duplicate meta yok; konuşmacı HTML’de canonical + hreflang + `units`/`calc` linki.
2. Uzun `<title>`: script **uyarır** (~62+ karakter — SERP kırpması riski; piksel ölçümü ileri adım).
3. **Bing** mülk + sitemap: GSC sonrası (planlı; ayrı oturum).
4. Staging tavsiyesi: tüm URL’leri aynı gün **index isteme**; küçük parti (ör. hub + 5–10 spoke), Coverage izle, ölçekle. [Checklist §8](seo-onpage-checklist.md#8-search-console-and-indexing-staged).

**İleride (isteğe bağlı script’ler):** `noindex` + canonical hedef uyumu, piksel genişliği, render-only içerik denetimi — şu an manuel/araç dışı.

## Thin content / programmatic risk

- `dateModified` + benzersiz metodoloji + semantic intro + ters/yan spoke linkleri: **kopya şablon** sinyalini kırmak için.
- Hâlâ zayıf kalan niyetler: Faz 5’te **birleştir / noindex / canonical** — [seo-faz5-iteration.md](seo-faz5-iteration.md) (önce: `npm run seo:faz5:preflight` veya tam `ship:qa`).

## Lighthouse (mobil) & Bing (GSC “sonra” adım)

- **Lighthouse / PSI** için örnek URL’ler, LCP·INP·CLS odağı: [seo-faz4-qa.md §2](seo-faz4-qa.md#2-lighthouse--pagespeed-insights-mobil).
- **Bing Webmaster:** GSC’den import veya ayrı doğrulama; aynı `sitemap.xml`: [seo-faz4-qa.md §3](seo-faz4-qa.md#3-arama-motorları).

## Yayın sırası (öneri)

**Tek komut (yerelde):** `npm run ship:qa` — mikro + sitemap regen, duplicate + mikro bütünlük QA, ardından `build.js`.

Ayrıntılı adım adım:

1. `npm run seo` *(veya doğrudan `ship:qa`)*
2. `npm run seo:qa` *( `ship:qa` içinde de var)*
3. `node build.js` *( `ship:qa` içinde de var)*
4. `git push` → Cloudflare
5. GSC: sitemap gönder / güncel URL’leri **aşamalı** incele

## Doc haritası

| Dosya | Rol |
|-------|-----|
| [seo-onpage-checklist.md](seo-onpage-checklist.md) | Strateji + zorunlu kurallar |
| [seo-faz4-qa.md](seo-faz4-qa.md) | Faz 4 operasyon |
| [seo-faz5-iteration.md](seo-faz5-iteration.md) | Faz 5 GSC yineleme |
| [quality-gate-checklist.md](quality-gate-checklist.md) | Tek sayfa ship |
| **seo-operating-model.md** (bu dosya) | Hub-spoke + ship disiplini |
