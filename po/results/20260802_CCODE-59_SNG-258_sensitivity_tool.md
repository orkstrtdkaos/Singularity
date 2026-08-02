# CCODE-59 — SNG-258 §SENSITIVITY: the tool, and what it already says

Aevi's build order: *"§SENSITIVITY tool first (CCode) — nothing tunes until we can see the curve. Cheap,
unblocks §1-3. This runs BEFORE any constant changes ship."* Built. `npm run sensitivity`, wired into
`npm test`, `--json` for charts. **It changes no constants** — it reads the shipped ones and reports.

It sweeps the REAL `successChance` from `engine/resolve.js` by handing it a mutated copy of the rules
JSON. It does not reimplement the formula. That mattered more here than anywhere: a sensitivity tool
that models its own version of the math would hand Erik confident dials for an engine that does
something else.

## Where the field sits today

Chance / pre-clamp raw. `^` pinned at the ceiling, `v` at the floor.

```
PROFILE       unopposed   riffraff    notable   regional      epic
novice          45/  45    23/  23     7/   7    5/ -10v   5/ -33v
apprentice      75/  75    53/  53    37/  37   20/  20    5/  -3v
competent       95/ 115^   93/  93    77/  77   60/  60   37/  37
expert          95/ 135^   95/ 113^   95/  97^  80/  80   57/  57
master          95/ 145^   95/ 123^   95/ 107^  90/  90   67/  67
```

Erik's finding is confirmed and is worse than stated, because **the floor wastes points exactly the way
the ceiling does.** A novice against a regional threat is at 5% whatever they carry; a master below the
notable band is at 95% whatever they carry. Both ends are dead zones.

**Only 60% of the grid is in the live band** — the range where any term other than attribute changes an
outcome at all.

## §1 — the attribute multiplier

| mult | attr4 base | mean% | live band% | at ceiling% | at floor% | attr share of budget | +1 rank delivers | +1 skill delivers | master−novice |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 32 | 32.1 | 64 | 4 | 32 | 54.3% | 3.2 | 6.7 | 49.8 |
| 10 | 40 | 37.0 | 64 | 4 | 28 | 59.0% | 3.3 | 6.8 | 55.4 |
| **12** | **48** | **41.8** | **68** | **8** | **20** | **62.8%** | **3.6** | **7.0** | **60.6** |
| 14 | 56 | 46.8 | 68 | 12 | 20 | 65.9% | 3.4 | 6.7 | 64.6 |
| 16 | 64 | 51.6 | 64 | 20 | 16 | 68.5% | 3.2 | 6.3 | 67.8 |
| 18 | 72 | 55.9 | 60 | 24 | 16 | 70.8% | 3.1 | 6.2 | 70.2 |
| **20 (shipped)** | 80 | 60.0 | 60 | 28 | 12 | **72.7%** | **2.9** | 5.6 | 71.4 |

**At the shipped 20, a rank of ability delivers 2.9 of its nominal 5 points — 58% of what the constant
says.** Attribute is 72.7% of everything working in a character's favour.

**Multiplier 12 is the best point in this sweep**: a rank delivers 3.6, 68% of the grid is live,
attribute falls to 62.8% of the budget, and the master still beats the novice by 60.6 points. That lands
squarely inside Aevi's stated goal of "attribute ~50-60% of a strong chance, not 100%."

The ladder never collapses anywhere in the sweep — asserted, not eyeballed.

## §3 — a bigger flat tier bonus is not the answer

| rank bonus | nominal at T3 | actually delivered | at ceiling% |
|---|---|---|---|
| 5 (shipped) | 15 | 8.7 | 28 |
| 8 | 24 | 12.6 | 36 |
| 10 | 30 | 15.0 | 36 |
| 12 | 36 | 17.4 | 40 |
| 15 | 45 | 19.5 | 48 |

Tripling the constant buys 10.8 delivered points and pushes another 20% of the grid into the ceiling.
**This is the data behind Aevi's §3 design call**: tier has to buy a wider band — reach, crit, partial —
not more flat points that clamp away.

## §3b — the partial band, and a defect worth naming

Share of rolls landing PARTIAL at the notable band, 10k seeded rolls per cell:

| band | novice | apprentice | competent | expert | master |
|---|---|---|---|---|---|
| 10 | 10.1 | 10.5 | 9.6 | **0.0** | **0.0** |
| 15 (shipped) | 14.7 | 15.3 | 15.1 | **0.0** | **0.0** |
| 30 | 29.9 | 29.5 | 18.3 | **0.0** | **0.0** |

Expert and master sit at chance 95 and crit-failure starts at 96, so **there is no room between their
success line and the crit-fail line. A master's miss is never a partial — it is a critical failure.**
Widening the band does not move them at any width.

So today expertise makes failure **more** binary, which is the exact inverse of §3b's goal. The
consequence for the design: **§3b cannot be solved by the band alone.** As long as mastery pins at the
ceiling there is nowhere for a partial to live, so §3b depends on §1 landing first. That is a real
sequencing constraint, and it agrees with Aevi's build order rather than fighting it.

## Invariants asserted at every setting

- every named component sums to the pre-clamp total (SNG-106 — the §4 popup can only be honest if this
  holds, and it now holds across the whole sweep, not at one setting);
- competence is monotonic — a more capable profile never rolls worse;
- no setting produces a non-finite chance;
- the shipped constants are inside the swept range, so the report always states the status quo;
- no swept multiplier flattens the master into the novice.

## What I recommend next, and what I need

Per Aevi's order, the popup (§4/§4b) is next and is mine. Two things I'd want first:

1. **Erik's §1 call.** The tool says 12. Nothing else in §1-3 can be tuned until the multiplier lands,
   and §3b is blocked behind it.
2. **The §4b alignment finding is confirmed from this side too** — `successChance` reads
   `character.alignment` directly, and nothing anywhere writes to it after creation. Aevi's "alignment
   never drifts" is accurate: it is a creation-time vector, and the popup will have to explain a number
   the player has no way to have influenced.

Not built, deliberately: no constant was changed. The tool exists so that decision is Erik's and is made
on data.
