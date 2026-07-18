# Results — Innate-substrate wiring (SNG-131)

Date: 2026-07-17 · HEAD `f681c24` · **v1.8.99** · full suite green · browser-verified (served bytes + real geometry). Status: **shipped, complete_pending_review.**

The wiring the earlier BLOCKED report scoped, now that Aevi authored the data (against the real shape, with the antipode ruling corrected). Erik's ruling 1 made mechanical: **innate ACCESS as a base, grown like any skill** — the seed opens access; the ability still costs a level + a point to learn, then ranks up normally. Not a grant.

## The engine (`engine/progression.js`)
- **`effectiveLevelReq` — new `living_current` branch.** Mirrors precursor exactly: a `living_current` ability is locked unless its id is in `character.livingCurrentAccess`. So the green current is innate-only (rootkin, seeded), never learnable by anyone else.
- **`learnAbility` routing.** `precursor` AND `living_current` now route to the per-ability access gate (`effectiveLevelReq`), **not** the domain gate — critical: a `living_current` ability carries `tradition: rootkin`, so the domain gate alone would let *any* rootkin-domain character learn it, defeating "innate to the people." The access list (seeded only for the rootkin *origin*) is the true lock.
- **`learnAbility` cost — the center's braid discount.** A cross-pole braid (a `reach_*` diameter-line) costs `character.braidDiscount` less, floored at 1 (never free). It only bites on the domained penalty path — where a diameter braid's ring-distance cost is genuinely >1 — which is the real regime. **Proven on real geometry:** the diameter braid `quickening` costs **3** for a domained valleyfolk without braidAffinity, **1** with it (discount 2).
- **`seedInnateSubstrate(character, originRecord, catalog)`** — the seed. From `origin.innatePrecursor[]` → `precursorAccess`, `origin.innateLivingCurrent[]` → `livingCurrentAccess`, `origin.braidAffinity.discount` → `character.braidDiscount`. **Each seeded id is validated against the catalog's `powerSystem`** (precursor / living_current) so a mis-authored id can never create a false access. Idempotent (adds only what's missing), Law-14-safe (opens access, never grants an ability or touches a rank). Returns the newly-seeded ids.

## The app (`app.js`)
- `finish()` — a substrate-keeper is **born** with its innate access (called right after `applyNativeGrants`).
- `migrate()` — existing keeper saves get it **on load**, idempotently, with an in-fiction reconcile note ("The substrate answers you by right of your people — …"). So Silas / Erik's characters pick it up without a rebuild.

## Data wired (Aevi-authored, verified real)
- `seraphic.innatePrecursor = ["address_sense"]`, `abyssal.innatePrecursor = ["latticespeak"]` — both confirmed `powerSystem: precursor`.
- `rootkin.innateLivingCurrent = ["quicken_the_ground"]` — confirmed `powerSystem: living_current` (a new abilities file: `quicken_the_ground` T3, `the_green_road` T4; registered in the core manifest).
- `valleyfolk.braidAffinity = { discount: 2 }`.

## Guards honored
- **Innate-only** — a non-keeper origin (valleyfolk, wright, …) is never seeded precursor/living-current; verified a valleyfolk gets **no** precursor access (its base stays fiction-gated) while still getting the braid discount.
- **Access, not a grant** — the seed opens the door; the ability is still earned (level bar + skill point), then grown. Verified: a seeded rootkin can learn the living current only at its levelReq; an unseeded rootkin cannot at all.
- **powerSystem-validated** — a mis-authored innate id (wrong powerSystem) is refused, never a false access (the SNG-124 "read the data" lesson, enforced in code).
- **Braid never free** — floored at 1.
- **Composes with SNG-125** — the seed rides on origin, orthogonal to the primary/secondary/tertiary domains; nothing in the domain math changed.

## Verification
- **16 smoke tests:** `seedInnateSubstrate` (seeds precursor + living-current access, stamps braid discount, refuses a wrong-powerSystem id, idempotent); the `living_current` gate (locked without access, returns levelReq with it); `learnAbility` (a seeded rootkin learns the living current, an unseeded one can't); raw-source assertions (the braid cut floored + reach_-only; precursor+living_current both route to the access gate); **end-to-end on the real authored content** (seraphic/abyssal `innatePrecursor` are real precursor ids; rootkin `innateLivingCurrent` is a real living_current id; seeding a real seraphic opens its authored base + the gate returns its levelReq; valleyfolk carries a real braid discount). Full `npm test` green.
- **Browser-runtime, served modules + real loaded content (cache-busted, fresh port 8399):** 7/7 — real seraphic seed opens `address_sense`; a non-keeper valleyfolk gets no precursor but does get the braid discount; living-current locked without the seed; a seeded rootkin learns it via `learnAbility` with the real traditionIndex; **the braid discount on real geometry — `quickening` costs 3 without / 1 with braidAffinity**; v1.8.99; boot-clean.
- **Not headless-reachable:** a full keyed play session (a seraph reaching the level to learn `address_sense`, then ranking it up) — the access + gate + cost are all engine-verified; the grow-by-play is the standard rank-up path.

## Files
`engine/progression.js` (`living_current` gate + `learnAbility` routing/braid-cost + `seedInnateSubstrate`) · `app.js` (seed in `finish()` + `migrate()`; import) · `tests/smoke.mjs` · `index.html` (v1.8.99).

## Note
SNG-131 is now fully closed end-to-end: Aevi authored the data (correcting the antipode ruling to "two distinct deep-power families, ring unmoved"), CCode wired the readers. The `the_green_road` (T4) living-current ability has no unlock path yet (only `quicken_the_ground` is the seeded base) — deeper living-current, like deeper precursor, would unlock via fiction or a future authored path; flagged, not blocking.
