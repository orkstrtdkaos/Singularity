# SNG-386 — Retiring the schematic breaks SNG-331's compass, and the replacement is better

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Measured at:** `baed9a27`
**Origin:** Erik retires `map.x/y`; *"don't forget about the journey building we worked on"*
**Status:** ⛔ **AMENDS SNG-331 before it is built.** Verified unbuilt: zero hits for `bearing`,
`provisions`, `routeTo` anywhere in the repo.

---

## §1 — ⛔ THE CONSEQUENCE I HAVE TO FLAG

**SNG-331's headline finding was: *"All 96 locations carry `map: {x,y}`. Every bearing is computable today
— `atan2(dy, dx)`."*** ⚠️ **Erik has just retired `map.x/y`. The journey spec's entire direction mechanic
was built on the field that is going away.**

⛔ **AND IT WAS ALWAYS WRONG, WHICH IS THE POINT.** A bearing taken from a schematic layout is a bearing
in a picture, not in the world. `map.x/y` correlates with real travel at **r = 0.443** — so *"the Ford
lies east-northeast, four days"* would have been **four real days in an invented direction.** The
retirement did not break the compass; it exposed that there wasn't one.

## §2 — THE REPLACEMENT, and it is not a translation of the old one

`worldPos` gives a true bearing. But this world has a better compass than north, and it is already
authored:

> **Colatitude is distance from the Crossing. Longitude is which disposition's quarter you are in.**
> So the two natural directions are **hubward / outward** and **spinward / widdershins**.

**Measured, on real pairs:**

| from | to | bearing |
|---|---|---|
| Millbrook | the Crossing | **hubward and spinward** |
| Millbrook | the Heartroot | **outward** |
| Kindlerow | the Blaze | outward and widdershins |
| Raven's Home | the Crossing | hubward and widdershins |

⛔ **`hubward` means toward the Crossing, which means toward BALANCE. `outward` means toward a pole, which
means toward commitment.** The compass and the disposition are the same axis. **Direction in this world
carries meaning that north never could**, and a player who learns "we are going outward" has learned
something true about where they are going and not only which way.

⚠️ **This is why the retirement is an upgrade rather than a cost.** SNG-331 asked for *"a concrete sense
of direction along with its concrete sense of distance."* The schematic could only ever have given a
concrete sense of *layout*.

## §3 — WHAT CARRIES OVER UNCHANGED

**Everything else in SNG-331 stands**, and most of it is now better supported than when I wrote it:
- **Route** — shortest path over `connections`, weighted by `walkingDays`. ⚠️ **Now with real distances**:
  median leg 26.6 days, and the map already shows them.
- **⛔ AND WAYGATES CHANGE THE ROUTING PROBLEM.** SNG-331 predates my reading of `waygate.js`. A route is
  no longer "the shortest walk" — it is **the cheapest mixed itinerary**, and `gateHopCost` already prices
  it: 4% of the overland journey, floored at 2h, capped at 72h. *"Forty days on foot, or six to the
  Longshore gate and twelve hours through"* is the decision the panel exists to present.
- **Provisions** — still does not exist; `dried_rations` and `waterskin` are still consumed by nothing.
  ⚠️ **Now sized by real distance: a 26-day median leg means provisioning is a real constraint** rather
  than the rounding error it would have been on schematic hops.
- **Danger and who is on the road** — unchanged.

## §4 — WHAT I NEED FROM CCODE

1. ⛔ **Do not implement `bearing` from `map.x/y`.** If any of SNG-331 is queued, this supersedes it.
2. **`bearingBetween(a, b)` from `worldPos`** → `{hubward|outward|null, spinward|widdershins|null}` with
   the thresholds tuned so "alongside" is a real answer. ⚠️ **Vocabulary is mine** — do not invent words
   for it; the four above are the canon.
3. **`ctx.location.bearingsToKnown`** so the GM can say *"the road runs outward from here"* **without
   inventing it** — which is the whole reason SNG-331 flagged this as the cheapest high-value item.
4. **Route planning over the mixed graph** (roads + gates), returning **two named options**, per SNG-331
   §1: *"two named options beat one optimal one."*

⚠️ **Provisions stays deliberately last.** It is the only piece that adds a resource the player must
manage, and SNG-331's own rule holds: **running out costs, it does not kill.**

---

## §5 — SEPARATE, AND ERIK RAISED IT: "the Valley" is doing two jobs

Erik: *"Greyhearth buries the whole 'valley'? is that old verbage for the world?"*

**Audited. Mostly a false alarm, with one real finding underneath.**
- **32 locations outside the valley region mention it — but most are correct**: the Flensers *coming to
  the Valley*, Cogitants solving *a valley crisis*, the Service Ways running *under the Valley*. Those are
  references TO a place, from outside it, and they are right.
- **5 of 8 foothills hits were the FILE PATH** `content/packs/valley/assets/…`, not prose.
- ⚠️ **Three were genuine early-draft scope**, written when the Valley was the whole game: Greyhearth
  *"buries the whole valley"*, the Worn Yard *"every builder in the Valley"*, Longshore *"the one place in
  the Valley"*. **Fixed** (`639e7ad7`, `af4d125d`, `baed9a27`).

**⛔ THE REAL FINDING IS THE PACK NAME.** `content/packs/valley/` holds **118 locations across 26 regions —
11 of which are in the valley.** It also holds the bestiary, the companions, the epics, the prologue: the
entire world lives in a directory named after its first region.

⚠️ **I am not renaming it** — every manifest path, every asset reference and every save's `image` field
points inside it. **CCode: is a pack rename feasible, or is the honest answer to leave the directory and
fix the NOTE so nobody reads the name as a scope claim?** Erik's instinct was right and the rot is in the
folder, not the prose.
