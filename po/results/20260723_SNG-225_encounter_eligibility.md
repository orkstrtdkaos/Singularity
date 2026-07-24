# SNG-225 — the encounter pool is un-starved (dangers travel now)

**CCode · 2026-07-23 · v1.8.234→238 · suite + wiring-audit green · proven against the real 58-encounter table.**
`status: complete_pending_review`

Your bug: on the HIGHEST setting, *"I have yet to have any sort of encounter."* Aevi's diagnosis was exact —
the roll fires (SNG-127), but the eligible POOL was starved: at Silas's `gen-waygate` only **7 of 58**
encounters qualified, **all peaceful**.

## Root cause
Generated locations mint with `dangerLevel: null`, and `dangerOf` read `null | 0 === 0` — the safest possible
setting, which disqualifies every `minDanger>0` encounter. A null-danger location could *never* roll a
dangerous encounter. On top of that, region-anchoring locked 44 of 58 encounters away from the valley.

## The fix (all three CCode parts shipped)
- **§4b — `dangerOf` floors a missing dangerLevel to 1** (not 0): a place that forgot its danger is no longer
  the safest place in the world by accident. An explicit value (incl. a deliberate 0) still stands.
- **§4a — a real dangerLevel on mint + backfill.** `deriveDangerLevel(location, {baseDanger})` inherits the
  neighbourhood's danger, nudged by tags (wild/ruin/disputed lift; hearth/haven lower), floor 1, clamp 4.
  `mintTransitLocation` stamps it from `here.dangerLevel`; a load backfill in `migrate()` heals existing
  null-danger gen-locations from the **region median** (valley ≈ 2 — so a healed stub un-gates the
  `minDanger:2` perils, not just `minDanger:1`).
- **§4c — the region-lock is DROPPED (your call).** *"The world is full of wonders and dangers; let each
  location have them as they come."* `isEligible` no longer hard-gates on region — an encounter's fitness is
  its **danger threshold** (severity by the place) + its **tag context**, not its geography. The `regions`
  field stays as data, no longer a lock.

## Proven (against the real table)
| location | before | after | perilous |
|---|---|---|---|
| Waygate (danger 2) | 7/58, all peaceful | **37/58** | 0 → **5** |
| hearth/inn (danger 1) | — | 33/58 | 2 (a threat *can* reach it) |
| wild frontier (danger 3) | — | 40/58 | **8** |
| deliberate haven (danger 0) | — | 31/58 | **0** (the danger gate keeps it safe) |

**The dangerLevel is now the meaningful control — severity by place.** A danger-0 haven still gets no perils;
Millbrook (danger 2) can face raiders when the threat is near. The roll and the SNG-127 intimate/intense
suppressors are untouched (no rate re-cranking, per your guard).

## ROUND 2 — answered
- **Q1 (derive from what):** region median + own tags (a road near a danger-2 town ≈ 2; a wild/ruin tag lifts).
- **Q2 (§4c mechanic):** you chose to **drop the region-lock entirely** — cleaner than a pool-widen or a
  pity-timer, and it makes every location a living pool.
- **Q3 (§4b floor):** global floor of 1 for the reader; region-median for the stored value on backfill.
- **Q4 (§5):** see below.

## §5 (Aevi, now OPTIONAL — not a blocker)
The region-drop already gives every location a full-flavor pool, so §5 (re-tag some perilous encounters
valley-wide) is no longer needed to un-starve — it becomes **polish**: if you want certain encounters to
*prefer* certain places, that's now a soft-weight/tag question, not a hard region-lock. The 58-entry table
delivers stakes everywhere as-is.

## Honest bound
Tier-1 (Node suite) + a **direct run of the real eligibility filter against the shipped 58-encounter table**
(the numbers above are the actual filter output, not a mock). The live *felt* experience — encounters
actually firing with variety as Silas travels on the highest setting — is your Tier-2 confirm: Silas's Waygate
heals to danger 2 on next load, and every place now draws from a full pool gated by its own danger.

*— CCode. The roll was never broken; the world was. A null danger made every minted place the safest spot on
the map, and region-locks kept the perils penned in their home regions. Now danger is the dial — a haven stays
gentle, a frontier bites — and the dangers travel to where the fiction is. Silas should stop hearing silence
on relentless.*
