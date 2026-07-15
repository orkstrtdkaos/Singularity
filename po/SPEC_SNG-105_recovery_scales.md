# SPEC — SNG-105: Energy recovery scales with the pool
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** maxEnergy grows +5/level but recovery is FIXED (sleep +40, breather +10, meal +10), so the refill feels grindier every level (40% of the bar at L1 → 32% at L6, falling). Erik's ruling: recovery should scale with the pool.

> **Verified at HEAD `v1.8.67`.** `resolution.json.recovery`: sleep {energy:40}, breather {energy:10}, meal 10, heartyMeal 15, drink 5. maxEnergy = 100 + 5/level (`applyLevelUps`). Ability costs discount DOWN with level while recovery stays flat — the diagnosed cause of Erik's "energy depletes faster than I'm used to."

## THE FIX — recovery as a fraction of maxEnergy (with a floor)
Express each recovery value as `max(flatBase, round(fraction × maxEnergy))` so it scales:
- **sleep:** fraction ~0.32 (matches the current L6 feel as the floor, grows above it) — i.e. a full night restores ~a third of the pool at any level, so it never gets grindier as you climb; flatBase 40 (never worse than today).
- **breather:** ~0.08 × max, floor 10.
- **meal:** ~0.08 × max, floor 10; heartyMeal ~0.12, floor 15; drink ~0.04, floor 5.
- **meditation:** already attunement-scaled; leave, or add a small max-fraction term for consistency (flag for Erik).
Tunable in `resolution.json` (`recovery.*.fraction` alongside the flat base). The flat base is the floor so low levels are unchanged; scaling only ever *adds* as the pool grows.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/gm.js` / recovery application | Where `rec.sleep.energy` etc. are applied, compute `max(base, round(fraction × character.maxEnergy))`. The GM's RECOVERY GUIDE prose should show the *computed* value for this character (ties into SNG-103's effective-number principle — show the real number, not the base). |
| `content/packs/core/rules/resolution.json` | Add `fraction` to each recovery entry; keep flat value as floor. |
| `tests/*` | L1 recovery == today (floor binds); L6+ recovery scales up; sleep restores ~constant FRACTION of the pool across levels (the grind is gone). |

## GUARDS
- Flat base is a floor — low levels never get *worse* than today.
- Recovery still requires the fiction (food must exist, rest must happen) — this changes the amount, not the rules for earning it.
- The GM RECOVERY GUIDE shows the computed per-character number (SNG-103 principle), so it never mis-states the restore.

## OPEN QUESTIONS — CCODE ROUND 2
1. Confirm the single site where recovery deltas are applied (GM `characterDeltas` path) so the fraction math lives in one place.
2. Meditation: leave attunement-only, or add a max-fraction term? (Erik's call — flagged.)
