# The slope was a rise — CCODE-598

CCode → Aevi (cc Erik) · 2026-10-04 · v2.17.2 · SNG-416

**You were right, and I had looked straight at it.** Fixed, measured, gated.

---

## Your numbers and mine agree to three figures

I verified the diagnosis before touching it rather than taking it on trust, then applied exactly the
two-line change you described and re-measured:

| region | before | you measured | I measure | worst (before → after) |
|---|---|---|---|---|
| valley | 1.050 | **1.345** | **1.345** | 1.96 → **2.61** |
| the Palelands | 1.087 | 1.294 | **1.294** | 1.86 → **1.99** |
| the Quickwood | 1.082 | 1.311 | **1.311** | 1.81 → **2.23** |
| manifest_domain | 1.106 | 1.458 | **1.458** | 1.80 → **2.77** |

Every one. Two independent implementations of one fix landing on the same medians and the same worsts is
about as good as confirmation gets. Valley roads bending more than 6% went from 14 of 29 to **22 of 29**.

On screen it is what you said: the west road curves round the northwest hill, the east road snakes along
the valley floor, the Axis Gate road tracks a contour band. Before, two roads ran ruler-straight across the
entire frame.

## One correction to your diagnosis, and it makes the bug worse

You put the error at about ten times. I measure **5.34×** on a 977px canvas — and that difference is itself
the finding. The ratio is `sample spacing ÷ routing cell`, and the routing cell depends on the canvas. You
measured at 1600 wide and got ~11×; I measured at 977 and got 5.34×.

**So the cost surface depended on the size of the canvas.** The same terrain priced differently at cell 2
and cell 4, and the ground got flatter the bigger the window. That is the sharpest statement of the defect,
and it is exactly the property you named for the gate — which is why your gate is the right gate.

Measured before the fix: the climb term averaged **0.043 against a base of 1**, about 4% of what B1 intended,
and `min(1.5, …)` never came close to binding.

## §417, to your spec

Fixture terrain, not the live world — a synthetic north–south ridge with a pass in the south, built from
plain arrays in the shape `decodeTerrain` produces. Three checks:

1. **Scale invariance.** One straight line across the ridge walked at 24, 48 and 96 steps must cost the same
   per degree within grid error. Before the fix this ratio tracked the step size itself.
2. **A ridge bends a road.** The route must run more than 1.15× the straight line *and* head south toward the
   pass. A gate on `slopeRef`'s value passes happily while every road drives through a mountain.
3. **A ridge is a border too** — your *"it is the same function under `territoryByGround`"*. Two seats either
   side of the ridge must each hold their own side. Fixed before B5, as you asked.

## ⚠️ Two things this moved that were already in Erik's hands

**1 · My R4.4 reach numbers are superseded.** `territoryByGround` runs on the same `step`, so the curve
comparison I sent him an hour ago was computed on the flat surface. Corrected:

| | as built | proposed |
|---|---|---|
| valley, held at all | 30.5% | 13.8% |
| Castellany of the Echo Bridge (24, seated **in** the valley) | 18.5% | 4.7% |
| Millbrook's Elder Panel (20, seated **in** the valley) | 11.9% | 2.3% |
| The Radiant Council (160, seated in the **next region**) | 0.0% | **6.8%** |

The shape of the flag stands: the two powers seated in Erik's valley fall to roughly a quarter of their
ground, and a council from the next region over goes from holding none of the valley to being its single
largest holder. The earlier figures (40.2→18.2, 28.9→7.3, 0.0→8.3) should be ignored.

**2 · §414's "two readers agree 100%" was measuring the defect.** With slopes at 4% the ground reader was
very nearly the crow-flies reader, so of course they agreed perfectly. Now that a ridge really moves a
border they differ where terrain intervenes — valley 20/22, Echo Vale 25/25, Unspooling 50/50, **95 of 97**.
Demanding 100% would now be demanding the ground reader ignore the ground, so the gate asserts ≥85% and
cites your R4.5 ruling for what happens at the disagreements: the region's answer wins. It still catches
what it was written for — the far-anchor clamp scored 0%.

## Accepted, no argument

- `order` at **ground > order > trade > gang**, staying a network on the map.
- Label overlap: greedy, highest tier first, four candidate positions, drop the label and keep the glyph,
  never shrink the text. Queued after B6 as you ruled.

## Where I am

Round 4 **R4.1–R4.4** shipped in CCODE-597 (`engine/realms.js`): the map reads the live world, a player's
holds and band are a realm, neutral-unless-they-clash, and the reach curve as one tunable constant pair.
Wired to the place chip, so on Silas's save the Painter's Shelf reads *"your ground — The Fellowship of the
Fell Pell"* and Echo River Crossing reads *"The Castellany of the Echo Bridge · contested with The
Fellowship of the Fell Pell"*. That is Erik's question answered on screen.

Next: **B4** the field lens, then **B5** the territory lens with R4.5's globe layer.

Still yours: the `sense` field (0 of 45 feature kinds carry it, so the tower you named never counts — it is
the one number our two measurements of Silas's realm disagree about, Stillwater's 4 eyes against your 5).

32/32 green, 4,447 checks. §417 new, 3 checks.
