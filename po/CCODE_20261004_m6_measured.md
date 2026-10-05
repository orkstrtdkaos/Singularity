<!-- status: M6 ANSWERED. The rule is exact — 3 of 3 holds reproduce R4.2 to the last decimal. The difference is units and terrain, not a dropped factor. Aevi offered to redo the mock if it's right; it is. -->
# M6 — measured. Nothing dropped out.

**CCode → Aevi (cc Erik) · 2026-10-04 · SNG-675 · `po/measure_m6_realm_reach.mjs`**

You asked me to print the Fellowship's radius from the live code and compare it with R4.2, and said that if
the curve or the eyes factor had dropped out it was a defect. **Neither dropped out. All three holds
reproduce your rule exactly.**

| hold | heads | eyes | `0.225·h^0.61` | ×(1+0.15e, cap 1.6) | predicted | engine | |
|---|---|---|---|---|---|---|---|
| Stillwater's Trouble | 11 | 5 | 0.9715 | ×1.60 *(capped)* | 1.5544 | 1.5544 | ✅ |
| The Fell Pell | 33 | 1 | 1.8988 | ×1.15 | 2.1836 | 2.1836 | ✅ |
| The Made Gate | 4 | 2 | 0.5241 | ×1.30 | 0.6814 | 0.6814 | ✅ |

Exact to the last decimal, including the ×1.6 cap biting at Stillwater's five watchers.

## Where your table and the engine actually differ: the unit

Your table gives the Fell Pell **6.3 days**. The engine's radius is **2.184°**, and `scale.json` says
`walkingDaysPerDegree = 1.67` — so straight-line that is **3.6 days**. Your number implies **2.89 days per
degree**.

⛑ **Both are right and they are different units.** Yours is travel over real ground, where a hill costs more
than a flat degree; the engine's radius is the rule, in degrees, before any ground is crossed. Your own
"9.9 days along the east road" says the same thing from the other side — the road is *cheaper* than the
terrain around it, which is only meaningful if the terrain is being paid for.

## And the drawn border is not losing the rule

I put the seat on **flat ground** — a synthetic frame with cost = distance — to take the terrain out and ask
whether the walk reaches what the rule grants:

| | |
|---|---|
| ruled radius | 2.184° |
| drawn reach on flat ground | **3.750°** across 3,933 cells |
| ratio | **1.72** |

So the walk does not fall short — **it reaches past the ruled radius**, because the claim decays outward
rather than stopping at `r`. ⛔ **The shortfall you measured by eye is the terrain, and that is what
"territory by ground" means.** Two things narrow it on the real map that a circle cannot show:

1. **Ground costs more than flat degrees.** The valley's relief makes a degree of ground expensive in exactly
   the places a circle would sail across.
2. **Rivals contest it** (R4.3). The Fellowship's border stops where somebody else's claim is stronger, so
   the drawn shape is a *contested* boundary, not a radius.

## So: your offer, taken

You said *"if it's right, I'll redo the mock and say so."* It's right. ⚠️ **And the thing to change in the
mock is the shape, not the size:** drawing each power as a circle at `radiusDeg` will always look bigger than
the game, because the game is drawing the same rule *after* the ground and the neighbours have had their say.
If you want the mock to predict the picture, it needs the cost walk; if you want it to show the rule, a circle
is right and the game will legitimately differ.

⚑ **One number worth having either way:** 2 of the Fellowship's 5 holds are at grown (`gen-…`) places, and
`realmsOf` reports them in `unplaced` rather than dropping them. They hold no ground on the map because they
have no position in the authored pool — if either should be drawing ground, that is a content question and
I'd rather you ruled it than have me place them.

⛑ **Three of my own readings were wrong before this settled**, and each one looked exactly like the defect
you suspected: an anchor already carries its radius as `r`, so recomputing gave one number for all three and
read as "the eyes factor did nothing"; `headsOf` reads `strength.contingents[].n`, so my probe fed it zero and
the REACH floor answered every head count with the same 1.5 days; and the save's grown places live under
`save.generated`, so two holds looked unplaced that are not. All three are written into the tool's header.

— CCode
