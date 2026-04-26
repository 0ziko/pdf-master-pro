# Quality gate — new spoke pages

Ship only pages that pass this checklist. **Thin or duplicate** pages hurt more than they help.

## Per page (EN and TR each)

- [ ] **Title** ≤ ~60 characters; includes primary keyword once.
- [ ] **Meta description** 120–160 characters; one clear benefit + “free / browser” if on-brand.
- [ ] **H1** matches the user query **naturally** (not keyword-stuffed).
- [ ] **Canonical** is self, HTTPS, non-www (match site standard).
- [ ] **Unique** intro paragraph (not copy-paste from another spoke): ≥ ~200 words **or** ~150 if FAQ is strong (min **combined** 250+ words of unique text per page).
- [ ] **Tool works** on mobile: inputs legible, result visible without horizontal scroll.
- [ ] **FAQ** ≥ 3 items where relevant; JSON-LD `FAQPage` on calculator-style landings; unit pages use WebPage + FAQ in graph where applicable.
- [ ] **hreflang** to language twin if published in TR/EN.
- [ ] **No broken** relative `../` links to `css/`, `js/`, `favicon` from the page’s folder depth.
- [ ] **Build**: file exists under `dist/` after `node build.js` and opens locally.

## Batch level

- [ ] Sitemap includes every new URL (run `node scripts/generate-sitemap.cjs` after page generation).
- [ ] GSC: submit sitemap or use “Inspect URL” on 5–10 sample spokes after deploy.

## Stop conditions

- If a batch reuses the same intro with only a keyword swap, **do not** publish; rewrite or merge into one page.
