# Faz 4 — QA, ölçüm, izleme (plan uyumu)

Bu dosya depodaki on-page SEO planı **Faz 4** maddesinin uygulanabilir kontrol listesidir. Kurallar: [seo-onpage-checklist.md](seo-onpage-checklist.md).

## 1) Otomatik: çift title / description + konuşmacı bütünlüğü

```bash
npm run seo:qa
```

Tam regen + QA + production build için (önerilen):

```bash
npm run ship:qa
```

- GSC/Bing çeyreklik pası öncesi hızlı denetim (regen/build yok): `npm run seo:faz5:preflight` — bkz. [seo-faz5-iteration.md](seo-faz5-iteration.md) (Depo öncesi).

- **Duplicate:** aynı `<title>` veya aynı `meta name="description"` → çıkış kodu 1. Uzun `<title>` (~62+ karakter) için uyarı (SERP kırpması).
- **Mikro bütünlük** (`convert/`, `tr/convert/`, `calculators/`, `tr/calculators/`): `rel=canonical` beklenen URL ile eşleşmeli, `hreflang` alternatifi olmalı, `units.html` veya `calc.html` hub linki olmalı; aksi çıkış kodu 1.

Operasyonel çerçeve: [seo-operating-model.md](seo-operating-model.md).

## 2) Lighthouse / PageSpeed Insights (mobil)

**Üçlü set (aynı oturumda, mobil cihaz emülasyonu veya “Mobile” sekmesi):**

| Rol | Örnek canlı URL | Neden |
|-----|------------------|--------|
| Hub | `https://snakeconverter.com/units.html` (veya `index.html`) | Ağır JS + çok kategori |
| Mikro | `https://snakeconverter.com/convert/inches-to-cm.html` | Hafif spoke, CWV referans |
| Ağır LP | `https://snakeconverter.com/compress-pdf.html` (veya `pdf.html`) | PDF / canvas, LCP-CLS riski |

**Nereye?**

- [PageSpeed Insights](https://pagespeed.web.dev/) — URL yapıştır, **Mobile** seç.
- Chrome DevTools → **Lighthouse** → Device: mobile, Categories: Performance (isteğe bağlı: Accessibility, SEO).

**Araç siteleri için metrik odağı (kılavuz hedef, mutlak söz değil):**

- **LCP (Largest Contentful Paint):** ~&lt; 2,5s iyi; metin/hero hızlı boyansın, üçüncü taraf reklam düzeni kaydırmasın.
- **INP (Interaction to Next Paint):** giriş alanları, butonlar — gecikme yok; büyük JS’i bloklama.
- **CLS (Cumulative Layout Shift):** araç kutusu, min-height / boşluk; sayfa yüklenirken zıplama yok.

Regresyon yok, kötüleşme yok diye yorumla. Sonuçları kısaca (tarih + URL + LCP/INP/CLS) not veya issue. Stratejik tavan: [seo-onpage-checklist](seo-onpage-checklist.md) CWV bölümü.

## 3) Arama motorları

- **Google Search Console (✓ hazır):** `sitemap.xml` gönderildi, Coverage/uyarılar; [§8 aşamalı index](seo-onpage-checklist.md#8-search-console-and-indexing-staged) (tek günde tüm URL’leri inceleme isteğinde bulunma).
- **Bing Webmaster Tools** (geçiş adımları):
  1. [Bing Webmaster](https://www.bing.com/webmasters) → **Import** — mümkünse **Import from Google Search Console** (aynı site property’si; bir kerelik eşleştirme).
  2. Import olmazsa: site ekle, DNS/ HTML dosya doğrulama (GSC’de zaten yaptığın yönteme benzer; mümkünse DNS/ TXT).
  3. **Sitemaps** bölümüne ekle: `https://snakeconverter.com/sitemap.xml` (GSC’deki ile aynı).
  4. “Submitted” ve “Last crawled” tarihlerine bak; 404 veya tarama hatası varsa düzelt.
  5. (İleride) Bing’e özel indexleme gerekirse Webmaster arayüzünden URL gönder; günlük kota var — **GSC gibi aşamalı** kullan.

- **Aşamalı URL inceleme** — tüm yeni `convert/` / `calculators/` URL’lerini aynı güne yığma; önce hub + örnek 5–10 spoke.

## 4) (İsteğe bağlı) SERP spot-check

2–3 hedef sorguda SERP’e bakıp rakip title/FAQ kıyas notu; “tam kazanma süresi” öngürüsü değil, beklenti kalibrasyonu içindir.

## İlişkili

- [seo-onpage-checklist.md](seo-onpage-checklist.md) — bütün kurallar
- [quality-gate-checklist.md](quality-gate-checklist.md) — tek sayfa ship öncesi
