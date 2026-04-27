# Faz 5 — GSC yineleme + budama (zorunlu süreç)

Programmatic / çok sayfalı büyüme sonrası sitede **dilue** (ince çoğalma) birikimini önlemek için bu süreç planın ayrılmaz parçasıdır. [Ana anlatım §9](seo-onpage-checklist.md#9-faz-5-ongoing-measure-and-prune-mandatory-at-scale).

## Depo öncesi (GSC’ye geçmeden)

1. Hızlı SEO QA (regen yok, build yok): `npm run seo:faz5:preflight` — çift `title`/`description` + mikro bütünlük; sayım çıktısı.
2. Tam ship öncesi (mikro + sitemap regen + build): `npm run ship:qa` — yayından önce bu geçmeli. [Faz 4 §1](seo-faz4-qa.md#1-otomatik-çift-title--description--konuşmacı-bütünlüğü).

## Periyot

- **En az** çeyrekte bir (3 ay) tam pas: GSC + iç link + netleştirme.
- Yeni büyük üretim (yüzlerce yeni URL) sonrası **ek** pas önerilir.

## Adımlar (Google Search Console)

1. **Gösterim yüksek, ortalama konum düşük** sorguları: ilgili sayfada içerik güçlendirme + iç link (hub / ilgili spoke).
2. **Sıfır tıklama + ince** veya kopya niyet: birleştir, kaldır veya `noindex` / `canonical` (ürün kararı) — [§2](seo-onpage-checklist.md#2-canonical-hreflang-and-variation-hierarchy-mandatory) ile tutarlı.
3. Açıldıysa **programmatic variation** URL’leri: aynı passta canonical + performans.
4. Kararları kısaca PR veya issue’da belgeleyin (hangi URL primary).

## Kayıt şablonu (çeyreklik — kopyala doldur)

| Tarih | URL / sayfa | GSC sinyali (kısaca) | Karar (güçlendir / birleştir / noindex / canonical →) | PR/issue |
|-------|-------------|----------------------|--------------------------------------------------------|----------|
| | | | | |

Bing Webmaster aynı mülkte ikincil; aynı kararlar genelde her iki tarafta geçerli.

## Dışa bağımlı araçlar

- GSC, Bing Webmaster (ikincil tarama) — [Faz 4](seo-faz4-qa.md) ile aynı mülk.

Bu dosya “ne zaman ve nasıl”ı sabitler; rakam hedefi vermez (pazar ve SERP değişkendir).
