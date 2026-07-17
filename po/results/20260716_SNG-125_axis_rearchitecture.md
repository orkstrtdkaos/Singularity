# Results — Axis re-architecture (SNG-125)

Date: 2026-07-16 · HEAD `6901693` · **v1.8.84** · `npm test` green · browser-runtime verified. Status: **shipped, complete_pending_review.**

Erik's design correction: the three domains were three free picks with no binding, throwing away the great circle's geometry. New shape — a **concentrated core** (primary + a kin-adjacent secondary) plus **one free wildcard reach** (tertiary anywhere legal). All 4 rulings were locked, so this was a build-confirmation pass.

## ROUND-2 confirmations
1. **Kin helper is a thin wrapper over the existing band (ruling 1).** The access model already had a kin/adjacent band (`domainAccess` "adjacent" = `ringDistance === 1`). `isKinAdjacent(candidate, primary, index)` reuses exactly that (ring-neighbour / step-1), inventing no second distance.
2. **Origin cascade needs no new plumbing (ruling 3).** The origin dropdown handler (L1760) already resets `state.domains` on change; the seed at L1809 re-fills `primary` from the new origin's native tradition; `renderDomainStep` recomputes the kin set from `d.primary` every render — so a secondary re-pick after an origin change measures kin from the newly-seeded primary automatically.
3. **Grandfather is by construction (ruling 2).** The constraint lives only in the builder's `selectable()`; nothing re-validates a loaded save. `domainsLegal(domains, index)` defaults to `{legal:true}` (grandfathered) and only checks kin-adjacency under `{enforce:true}` (a new build). `domainAccess` is untouched, so a legacy non-adjacent secondary (Silas: cogitant) still reads `band:"secondary"` with full tier-III access — verified.

## The change (a selection constraint, not an access rewrite)
- **`engine/traditions.js`** — `isKinAdjacent`, `kinSecondaryOptions(primary)` (the legal secondary set: kin, non-folk, not primary/antipode), `domainsLegal(domains, index, {enforce})` (grandfather-tolerant). `crystallizeDomains` (prologue auto-derive) now **snaps the secondary to a kin of primary** (heaviest-tagged kin, else the first kin option — never an illegal non-adjacent secondary) and **frees the tertiary** (the heaviest remaining legal pole, no longer bound to the secondary's neighbours).
- **`app.js`** — three sites that encoded the old geometry, all updated:
  - The great-circle picker (`renderDomainStep`): **secondary** selection gated to `kinSecondaryOptions(primary)`; **tertiary** freed to any legal pole (was bound to the secondary's neighbours). Centre/hint copy rewritten ("secondary — kin to your primary"; "tertiary — free wildcard reach").
  - The third door (`sanitizeSuggestedDomains`): a non-kin model-proposed secondary is **snapped to the heaviest legal kin** (kept complete, not dropped); tertiary freed.
  - The prologue reveal + "Adjust on the circle" already route through the two functions above.
- **Access math is untouched** — caps 5/3/2, foreclosure, promotion, acquisition all behave exactly as before, so the shipped SNG-101/102 work stays intact. Tertiary's antipode stays OPEN (ruling 4) — it closes only later if the tertiary is promoted via the existing SNG-101 path.

## Verification
- **9 new smoke tests** (against the real `traditions.json` via `buildTraditionIndex`): `isKinAdjacent` (neighbour kin; antipode/far/self not); `kinSecondaryOptions` = exactly the kin neighbours (minus primary/antipode/folk); `domainsLegal` refuses a non-kin secondary under `enforce` (with a reason) and passes a kin one; **a loaded non-kin build is grandfathered legal** (default + `enforce:false`); **access math unchanged** — a grandfathered non-kin secondary still reads `band:"secondary"`; `crystallizeDomains` snaps to a kin secondary even when a far tradition outranks it, and its tertiary is free (the far tradition can land there). `npm test` fully green (smoke + parse + content_ci + balance + skill-battle).
- **Browser-runtime, real served content:** the served `traditions.js` helpers behave identically against the fetched `traditions.json` — kin gate, `kinSecondaryOptions`, `domainsLegal` enforce-vs-grandfather, kin-snapped crystallize, and unchanged access band — 6/6. Boot-clean on a fresh port 8207, `?v=1.8.84`, no console errors.
- The picker's *feel* (kin nodes lit for secondary, the whole ring open for tertiary, the origin-change cascade re-seeding primary) is a template over these verified helpers — eyeball in a keyed creation run.

## Files
`engine/traditions.js` (isKinAdjacent / kinSecondaryOptions / domainsLegal; crystallizeDomains kin-secondary + free-tertiary) · `app.js` (renderDomainStep selectable + copy; sanitizeSuggestedDomains snap-to-kin + free tertiary; import) · `tests/smoke.mjs` · `index.html`.
