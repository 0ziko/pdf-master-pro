# URL and slug standard — micro pages

## English (default)

| Page type   | Path pattern | Example |
|------------|--------------|---------|
| Unit pair  | `/convert/{slug}.html` served as `convert/{slug}.html` | `convert/cm-to-inches.html` → `https://snakeconverter.com/convert/cm-to-inches` (clean URLs: configure host to strip `.html` if desired) |
| Calculator | `/calculators/{slug}.html` | `calculators/percentage-calculator.html` |

**Slug rules:** lowercase, Latin letters and digits, words separated by **hyphens**. Prefer **primary keyword** order: `kg-to-lbs` not `lbs-from-kg` for the main landing (reverse intent can be a second page later).

## Turkish

| Page type   | Path pattern | Example |
|------------|--------------|---------|
| Unit pair  | `tr/convert/{slug}.html` | `tr/convert/cm-to-inches.html` |
| Calculator | `tr/calculators/{slug}.html` | `tr/calculators/percentage-calculator.html` |

## hreflang

- Each **EN** page that has a **TR** twin includes:  
  `link rel="alternate" hreflang="en" href="…"`  
  `link rel="alternate" hreflang="tr" href="https://snakeconverter.com/tr/...`  
  `link rel="alternate" hreflang="x-default" href="…" ` (EN URL)

- **Canonical:** always self-referential for that language version.

## Internal links

- Hubs: `index.html` → most popular spokes; `units.html` and `calc.html` → category + “popular” spokes.
- Spokes: link to parent hub (`units.html`, `calc.html`, `index.html`) and 2–4 related spokes (e.g. `kg-to-lbs` ↔ `g-to-oz`).

## Conflicts

- Hubs like `units.html` and `unit-converter.html` stay; spokes use **`/convert/...`** to avoid clashing with existing tool names.
- Do not duplicate the same H1 on two URLs in the same language; each spoke needs **unique** intro + FAQ.
