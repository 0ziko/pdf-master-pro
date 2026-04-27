# SnakeConverter — Agent Roles

This file defines how AI agents collaborate on the SnakeConverter project.
Each agent has a focused scope and must not modify files outside it.

---

## Project Overview

**SnakeConverter** is a client-side multi-tool platform deployed on Cloudflare Pages.
No backend. No build step required for development (only `node build.js` for production obfuscation).

Stack: Vanilla JS · Tailwind CSS · HTML5 Canvas · jsPDF · pdf-lib-plus-encrypt

---

## Agent Roles

### UI Agent
**Trigger:** User asks about layout, design, spacing, responsiveness, visual polish.
**Scope:** `css/app.css`, all `.html` files (structure + class names only).
**Must read:** `C:\Users\ozanv\.cursor\skills\snakeconverter-css-standards\SKILL.md`
**Rules:**
- Never modify JS logic inside `<script>` tags.
- Use only existing CSS variables (`--accent`, `--bg-card`, etc.) — never hardcode colors.
- All reusable styles go in `css/app.css`, never in page-level `<style>` blocks.

---

### Logic Agent
**Trigger:** User asks about tool calculations, conversions, new utility features, JS bugs.
**Scope:** `js/tools.js`, `js/units.js`, `js/calc-tools.js`, `js/dev-tools.js`, `js/color-tools.js`, `js/app.js`, `js/utils.js`
**Must read:** `C:\Users\ozanv\.cursor\skills\snakeconverter-architecture\SKILL.md`
**Rules:**
- All functions exposed under the page namespace (e.g. `CalcTools`, `DevTools`).
- Never `alert()` — write results to the DOM result container.
- Validate all inputs before computing.

---

### i18n Agent
**Trigger:** User asks about translations, missing text, language switching, adding new tool names/descriptions.
**Scope:** `js/i18n.js` + `data-i18n` attributes in all `.html` files.
**Must read:** `C:\Users\ozanv\.cursor\skills\snakeconverter-i18n\SKILL.md`
**Rules:**
- Always add EN + TR at the same time — never one without the other.
- Key format: `category.toolid.name` / `category.toolid.desc`
- Update `data-search` attributes with Turkish keywords when adding new tools.

---

### Snake Agent
**Trigger:** User asks about the mascot animation, new states, integrating snake into a new page.
**Scope:** `js/snake-mascot.js`, `js/snake-tools.js` + snake HTML markup in pages.
**Must read:** `C:\Users\ozanv\.cursor\skills\snakeconverter-snake-mascot\SKILL.md`
**Rules:**
- Do not change `snake-mascot.js` for integration tasks — use `snake-tools.js` instead.
- `snackFile()` only for actual file events. `onFileSelect()` for input interactions.
- New page integrations follow the standard HTML + script load order in the skill file.

---

### Deploy Agent
**Trigger:** User asks about committing, pushing, Cloudflare deployment, build.
**Scope:** `build.js`, `.gitignore`, `package.json`, git commands.
**Must read:** `C:\Users\ozanv\.cursor\skills\snakeconverter-git\SKILL.md`
**Rules:**
- Always run pre-commit checklist before committing.
- Commit format: `type(scope): summary`
- Never push secrets or `node_modules/`.

### Post-change PowerShell (mandatory for all agents)
**Trigger:** Any reply where the agent **modified, created, or deleted** files in this repo (code, HTML, CSS, i18n, docs in-tree).
**Action:** End the reply with a **single** fenced `powershell` code block the user can paste to run locally: `Set-Location` to the repo root → `node build.js` → `git status` → `git add -A` → `git commit -m "type(scope): short message"` → `git push origin main`. Adjust branch name if not `main`. Do not skip this block after substantive edits; the user uses it to trigger GitHub → Cloudflare Pages.

---

## Coordination Rules (All Agents)

1. **Verify after every change** — open the relevant page in the browser and confirm the feature works.
2. **Read the relevant skill file** before starting any task in your scope.
3. **One concern per edit** — do not mix CSS refactors with JS feature additions in the same commit.
4. **Adding a new tool** always involves 5 files: HTML section + JS function + `index.html` dir entry + `i18n.js` keys + `build.js` update. See `snakeconverter-new-tool` skill.
