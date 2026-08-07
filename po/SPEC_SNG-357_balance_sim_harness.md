# SNG-357 — The balance simulation harness: see the shape before turning the dial

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"we should simulate the growth rates to
see their shapes right now then tweak if we want"* / *"retiring the soft cap into the ladder seems to make
sense. we should sim/test."*
**Status:** spec_ready · **Priority: FIRST.** Everything else queued behind it is a tuning decision, and
Erik's standing instruction is sim before tweak.

---

## §0 — WHY THIS IS FIRST

Three dials are now queued and none should move blind: the bond curve (SNG-354), the ladder's `roll`
column (SNG-356, which changes **every success chance in the game**), and whatever comes out of the
holdings work. ⚠️ **`skillPointPerLevel` moved today on the strength of a hand-derived measurement that I
also got wrong once** — the SNG-350 crossover claim. A harness is the structural fix for that class.

`tests/success_curve.mjs` and `tests/balance_sim.mjs` already exist and already reproduce the resolution
math. **This extends that pattern rather than founding it.**

---

## §1 — WHAT IT MUST SHOW

### §1a — The bond curve (measured shape vs proposed)

Current, verified: `deed 0.5 · assist 0.25 · encounter 1.5`, scale 10, `grantAt 6`. **Grant at 4
encounters, cap at 7.** Observed: three of eight bonded characters pegged at 10, one since level 5; Silas
at 10 for ~760 of 915 actions.

The harness plots bond against **actions**, not events, because actions are the unit the saves record and
the unit Erik feels. Overlay the real saves as points — Usnea (151 actions, 10), Splarf (58, 6.5),
Cellaceron (246, 10), Silas (915, 10), Loki (136, 1.25) — so a proposed curve is checked against people
who actually played, not an idealised player.

⚠️ **Report the number that matters: "% of the campaign spent at max bond."** For Silas today that is 83%.
That single figure is the defect, and it is what a fix has to move.

### §1b — The ladder's `roll` column against the retired soft cap

| rank | today (`softCap 4`) | ladder `rollCumulative` | delta |
|---|---|---|---|
| 4 | 40 | 40 | **0** — early game deliberately unchanged |
| 6 | 50 | 60 | **+10** |
| 10 | 70 | 80 | **+10** |

⛔ **A flat +10 on success chance from mid-game onward is a large change and I do not know that it is
right.** The intent is only to move the bend from rank 4 to rank 6 (SNG-354: rank 4 is the top of early
game, the wrong place for diminishing returns). **If the harness shows the +10 pushes mid-game characters
toward the 95% ceiling, the fix is to lower the per-rank values, not to abandon the bend.** Report success
rate by difficulty band at ranks 4 / 6 / 9 / 12 / 16 / 20, against Silas's real sub spread (4,5,7,7,9,7,9,6).

### §1c — The derived grants, retroactively applied

Erik ruled the ladder retroactive. The harness recomputes every real save and reports the before/after so
the migration is inspected before it runs, not after. **Silas: strength 4 → +32 max health on 170;
reason 7 → +53 max energy on 240.** Flag anything that more than doubles a pool.

### §1d — Points and capacity, kept honest

`skillPointPerLevel` is now 2. Re-assert the SNG-350 rule as a standing test: **points bind iff
skillPointPerLevel < average craft cost (2.511).** ⚠️ **The average moves when I author abilities** — I
added six tier-I abilities today and will add ~80 more, which lowers it. **The harness should recompute
the average from the catalog rather than hardcoding 2.511**, or this test rots the moment content lands.

---

## §2 — SHAPE

Headless, pure, no app. Reads the content pack and the real saves under `characters/`. Reports tables to
stdout the way `success_curve.mjs` does. **Takes proposed overrides as arguments** so a dial can be tried
without editing content — that is the whole point.

⚠️ **It must read the REAL saves, not synthetic characters.** Every wrong conclusion in this sequence came
from reasoning about an idealised player: my crossover error, and my treating Silas as the ceiling when
Erik says he is mid-tier. **The saves are the ground truth and they are already in the repo.**

---

## §3 — OUT OF SCOPE

- Turning any dial. The harness reports; Erik decides.
- The `roll` column going live — gated on this harness by SNG-356's own note.
