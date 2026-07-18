# SPEC — SNG-141: Fiction-unlock parity for living_current + wild_current (the deeper-substrate path)
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2**

> **CCode's SNG-131 flag:** `the_green_road` (living_current T4) has no unlock path — only `quicken_the_ground` is the seeded innate base; deeper living-current has nowhere to come from. Verified: there's an `unlockPrecursor` GM op (app.js L2755, "a door opens that was never on any list") but **no `unlockLivingCurrent` or `unlockWildCurrent` equivalent.** So the deeper living/wild abilities are stranded — not innate, and no fiction path to earn them. Same shape as SNG-140's wild_current (only the seeded base is reachable).

> **This is a parity gap, not a redesign.** Precursor has: innate seed (keeper origin) + fiction unlock (`unlockPrecursor`). living_current + wild_current have only the seed. Give them the same second door.

## THE FIX (mirror unlockPrecursor exactly)
- **`unlockLivingCurrent`** GM op — same shape as `unlockPrecursor` (app.js L2755): `{abilityId, via}` → validates the ability is `powerSystem:"living_current"`, pushes to `character.livingCurrentAccess`, narrates the "a door opens" beat (in the green-current idiom — "the quick answers you where it never had before"). So `the_green_road` (and future living-current depth) unlocks when the fiction earns it — walking deep into the Quickwood, a Heartroot rite, a rootkin elder's teaching.
- **`unlockWildCurrent`** GM op — same, for `powerSystem:"wild_current"` → `character.wildCurrentAccess` (once SNG-140's wild_current gate ships). The Wild Half's deeper abilities unlock through wild fiction (a fae bargain, a churn-touched night) — fittingly unpredictable.
- **Both validate the powerSystem** (like the seed guard) so a mis-targeted unlock can't grant the wrong ability.

## GUARDS
- **Parity, not new mechanics** — this is the `unlockPrecursor` pattern applied to the two parallel substrates; no new gating concept.
- **Validate powerSystem on unlock** (mirror seedInnateSubstrate's guard) — a wrong-system id can't be unlocked.
- **Access opens the door; the ability still costs level + point** (Erik's ruling 1, already how precursor/living work) — unlock ≠ free.
- **Composes:** SNG-131 (living gate) shipped; SNG-140 (wild gate) is owed — `unlockWildCurrent` lands with or after it.

## OPEN QUESTION — CCODE
1. One generalized `unlockSubstrate {abilityId, via, system}` op vs three parallel ops (unlockPrecursor/LivingCurrent/WildCurrent)? (Recommend generalize — one op, a `system` field, one powerSystem-validated writer — less surface than three near-identical ops. Keep `unlockPrecursor` as an alias for back-compat.)
