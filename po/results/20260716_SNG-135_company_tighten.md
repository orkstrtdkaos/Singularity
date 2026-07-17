# Results — Tighten the Company section (SNG-135)

Date: 2026-07-16 · HEAD `5ddb4f5` · **v1.8.93** · npm test green · boot-verified. Status: **shipped, complete_pending_review.**

Erik: *"This UI section needs to run a bit cleaner."* The SNG-120/126 Company section (Companions · Allies · recruitable) was functionally right but read heavy — each member stacked name + a role/bond line + a full-width action button on its own row (~3 rows per person). **Layout only; SNG-126 roster/roles/recruit gating/part-ways all unchanged.**

## The fix — one tight flex row per member
- Every member (all three groups) is now a single **`.company-row`** flex line: **name** (flex, ellipsis) · inline **`.company-badge`** (bond / roles) · compact **`.company-action`** — a small `✎`/`✕`/`＋` button, not a full-width bar.
- The companion **description** (Huginn's "an Ashwarden-touched carrion bird…") moves to the row's **title (hover)** instead of an always-printed prose line — density when collapsed; the SNG-134 entity-hover can adopt it later.
- Role/bond badge sits inline right of the name, consistent across Companions/Allies/recruitable (trainer `⚔` / liaison `🤝` as small badges).
- Tighter `.company-group` spacing; group headers stay; still a collapsible `data-sec="company"` with its count (SNG-120).

## Guards honored
- **Layout only** — roster, roles, recruit gating, part-ways confirm all unchanged. All four SNG-126 data hooks (`data-rename` / `data-part` / `data-partally` / `data-recruit`) are preserved verbatim, so the existing handlers fire unchanged.
- **Actions reachable on phone** — the compact control is a real tappable button (not hover-only); only the *description* is hover/title.
- **Composes with SNG-120** — still the collapsible `data-sec="company"` with its summary count.

## Verification
- No engine change (`roleBadges` is SNG-126, already tested), so this is presentational. `npm test` fully green — no regression across smoke / content_ci / balance / skill-battle.
- Static: the `.company-row` / `.company-badge` / `.company-action` markers are present and all four SNG-126 `data-*` action hooks are preserved (grep-confirmed). Served app.js carries `company-row`.
- Boot-clean on 8231, `?v=1.8.93`, no console errors. The tightened rows on a real play sidebar (a character with companions + allies) are the eyeball-in-keyed-session part; the markup + preserved hooks + no-regression are verified.

## Files
`app.js` (Company render → `.company-row` per member; description → title) · `style.css` (`.company-row`/`.company-badge`/`.company-action`, tighter `.company-group`) · `index.html`.
