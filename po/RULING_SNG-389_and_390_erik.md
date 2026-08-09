# ERIK'S RULINGS — SNG-389 balance, SNG-390 travel · **both go ahead**

**Ruled:** 2026-08-09 · **Author of record:** Aevi (PO), on Erik's call

---

## §1 — ⛔ BALANCE: BOTH. `crowdSlope` AND narrow `wild`.

Erik ruled **both**, not either.

1. **`crowdSlope` 0.75 → 1.6.** Wild's worst crowded factor **0.74 → 0.46**. Touches no band.
2. **`wild` band `0.32 ± 0.34` → `0.32 ± 0.20`.** Makes wild a **middle-ground** source rather than a
   universal one — full strength across 0.12–0.52 instead of 0–0.66.

⚠️ **`crowdFloor` stays at 0.6. My proposal to lower it is withdrawn** — you measured that `wild` never
gets within 0.14 of it, so it was aimed at the wrong constant.

### §1a — What this is for, stated so the reason survives the number

Before: **`wild` full-strength across 68% of the axis and never starving anywhere**; metaphysical and veil
never starving either; **precursor the only source with a real geography.** ⛔ **Four of six sources worked
everywhere, which made the substrate map decorative for them.**

⚠️ **And your finding stands: this cannot touch precursor or nanite at all** — their bands sit at
`hi = 1.10`, above the top of the axis, so they have no crowded side by construction. **That is correct and
should stay: you cannot have too much of the thing your craft is made of.** The asymmetry is the design.

### §1b — Ship it with the red observed

⛔ **Assert wild's worst crowded factor before and after** — 0.74 → 0.46 — so the gate has seen the number
move. Same for the band width. **A balance gate that has only ever seen the new value is not known to
work.**

⚠️ **Re-run the SNG-389 §1 census after.** I expect wild's "starved 0% / off 0%" to become non-zero for
the first time; if it does not, the change did not do what it was for.

---

## §2 — ⛔ TRAVEL: `roadFactor` on the OUTLIERS ONLY. Do not rewrite `walkingDays`.

Erik agreed with the measurement.

- **Median road / straight-line: 1.05×.** ⛔ **Noise. Do not touch the other ~78 edges.**
- **~6 edges exceed 1.3×**, worst **2.37×** — 26.7° straight becoming 63.2° by road.

**Add an optional `roadFactor` to those ~6 connection edges only, authored from the routing.** Everything
else keeps the geodesic.

⚠️ **Author the factor as DATA on the edge, not as a live route computation.** The routing that produced it
runs over a terrain that regenerates; a stored factor is stable and reviewable, and it can be re-derived by
the pipeline when terrain changes rather than recomputed per journey.

---

## §3 — Two more of Erik's calls, for the record

**Place names — SHIPPED** (`content/packs/core/world/placenames.json`, `d5a4d535`). Erik ruled the register
**older**, not plain: 4 waters, 12 heights. ⚠️ **Fens and rivers are deliberately unnamed** — fens shift
between rebuilds and rivers are derived from flow, so naming them would name water that moves.

**The Hollowing — RESOLVED** (`002a3740`). My ambiguity, my fix. The old seed read *"where the Quickwood
stops and the grey begins"*, making it a border between two regions — ⛔ **but longitude encodes disposition
and those two are EXACT ANTIPODES, so they have no shared border.** It stands on the grey side and looks
across; the 226-day road to the Greenward is the relationship, not a defect.
