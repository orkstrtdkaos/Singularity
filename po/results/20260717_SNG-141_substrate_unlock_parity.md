# Results — Substrate-unlock parity (SNG-141)

Date: 2026-07-17 · HEAD `e4b0a41` · **v1.8.102** · full suite green · browser-verified (real content). Status: **shipped, complete_pending_review.**

Closes CCode's own SNG-131 flag: **`the_green_road` (living_current T4) was stranded** — only the seeded innate base (`quicken_the_ground`) was reachable, and there was no fiction path to earn the deeper living-current. Precursor already had a second door (`unlockPrecursor`, "a door opens that was never on any list"); living_current and wild_current had only the seed. This gives them the same door. **Parity, not a redesign.**

## The fix (mirror `unlockPrecursor` exactly, generalized — OQ1)
- **`app.js`** — the old `unlockPrecursor`-only handler is now a **generalized, powerSystem-validated writer**. `SUBSTRATE_ACCESS` maps `precursor→precursorAccess`, `living_current→livingCurrentAccess`, `wild_current→wildCurrentAccess`. Any of `unlockSubstrate` / `unlockPrecursor` (back-compat alias) / `unlockLivingCurrent` / `unlockWildCurrent` route through it; **the target list is chosen from the ability's OWN `powerSystem`** (validated, mirroring `seedInnateSubstrate`'s guard) so a mis-targeted id can never unlock the wrong system. Narrates the same "a door opens" beat.
- **`engine/gm.js`** — the `unlockSubstrate` op spec (`{abilityId, via}` for a precursor | living_current | wild_current id); rule 19 extends the fiction-unlock door to the living current (a Heartroot rite, deep in the Quickwood) and the wild current (a fae bargain, a churn-touched night); `unlockSubstrate`/`unlockPrecursor` added to the salvageOps key list so a truncated reply doesn't drop the unlock.

## Scope (respecting the SNG-140 boundary)
- **living_current unlock is FULLY FUNCTIONAL now** — the SNG-131 gate (`effectiveLevelReq`'s `living_current` branch reading `livingCurrentAccess`) already shipped, so `unlockSubstrate` on `the_green_road` makes it learnable. **The stranded ability is un-stranded.**
- **wild_current unlock routes correctly** (into `wildCurrentAccess`) but its **learn-gate reader lands with SNG-140** — until SNG-140 wires the wild gate, an `unlockWildCurrent` is inert *by the spec's explicit design* ("`unlockWildCurrent` lands with or after it"). This is not a "value with no reader" mistake — the reader is a known, imminent, spec'd SNG-140 addition.
- **NOT built here (SNG-140, ruling-owed):** the wild-current innate seed (`origin.wildCurrent` → `wildCurrentAccess` at creation), the wild-current learn gate, and the "wildness/variance" mechanic. Those depend on Erik's 2 owed rulings (which peoples are wild-keepers; the variance mechanic). The unlock op is ready for them.

## Guards honored
- **Parity, not new mechanics** — the `unlockPrecursor` pattern applied to the two parallel substrates; no new gating concept.
- **powerSystem-validated on unlock** — a wrong-system id can't be unlocked (verified: a `reach_*` ability maps to no substrate list).
- **Access opens the door; the craft still costs level + point** (Erik's ruling 1) — unlock ≠ free; unchanged from how precursor/living already work.
- **Back-compat** — `unlockPrecursor` still works exactly as before.

## Verification
- **6 smoke tests:** the handler maps the three powerSystems to their access lists; it validates the ability's own powerSystem (a wrong-system id can't unlock); `unlockPrecursor` stays a handled alias; gm.js declares the `unlockSubstrate` op; rule 19 extends the door to living + wild + "still costs level + point"; `unlockSubstrate` is in the salvage key list. Full `npm test` green.
- **Browser-runtime on real content (fresh port 8102):** `the_green_road` is `powerSystem: living_current`, is **LOCKED** for a character without it in `livingCurrentAccess`, and after the (replicated) `unlockSubstrate` handler routes it into `livingCurrentAccess`, `effectiveLevelReq` returns its levelReq — **learnable**. The powerSystem→list routing is correct; a `reach_*` id maps to no list. v1.8.102; boot-clean.
- **Not headless-reachable:** the GM actually emitting `unlockSubstrate` on a live earned beat — a prompt-contract behavior (like `unlockPrecursor`); the handler + validation + gate are fully verified.

## Files
`app.js` (generalized substrate-unlock handler) · `engine/gm.js` (unlockSubstrate op spec + rule 19 + salvage keys) · `tests/smoke.mjs` · `index.html` (v1.8.102).

## Note for Aevi
- **SNG-140 is the remaining half:** the wild-current **learn gate** (mirror SNG-131's `living_current` branch in `effectiveLevelReq`) + the **innate wild seed** (`origin.wildCurrent` in `seedInnateSubstrate`) + the **wildness/variance mechanic** — all await Erik's 2 rulings (which peoples; the variance mechanic). Once those land, wiring it is the same small shape as SNG-131, and `unlockWildCurrent` (shipped here) immediately becomes functional.
