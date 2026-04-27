# Faz 4 — QA, ölçüm, izleme (plan uyumu)

Bu dosya depodaki on-page SEO planı **Faz 4** maddesinin uygulanabilir kontrol listesidir. Kurallar: [seo-onpage-checklist.md](seo-onpage-checklist.md).

## 1) Otomatik: çift title / description

```bash
node scripts/seo-duplicate-titles.cjs
```

Aynı `<title>` veya aynı `meta name="description"` birden çok sayfada varsa script çıkış kodu 1 verir; PR öncesi düzeltin.

## 2) Lighthouse / PageSpeed Insights (mobil)

- **1 hub** — ör. `units.html` veya `index.html`
- **1 mikro spoke** — ör. `convert/inches-to-cm.html`
- **1 ağır LP** — ör. `compress-pdf.html` veya `pdf.html` (büyük JS)

Hedef: LCP/CLS regresyonu yok; [seo-onpage-checklist](seo-onpage-checklist.md) CWV bölümü. Sonuçları (tarih + URL) not defterine veya issue’a yazın.

## 3) Arama motorları

- **Google Search Console:** sitemap (`sitemap.xml`) gönderildi mi, hata/uyarı, Coverage.
- **Bing Webmaster:** site eklendi mi, aynı sitemap.
- Aşamalı URL inceleme — [checklist §8](seo-onpage-checklist.md#8-search-console-and-indexing-staged) (tek günde tüm URL’leri istemeyin).

## 4) (İsteğe bağlı) SERP spot-check

2–3 hedef sorguda SERP’e bakıp rakip title/FAQ kıyas notu; “tam kazanma süresi” öngürüsü değil, beklenti kalibrasyonu içindir.

## İlişkili

- [seo-onpage-checklist.md](seo-onpage-checklist.md) — bütün kurallar
- [quality-gate-checklist.md](quality-gate-checklist.md) — tek sayfa ship öncesi
