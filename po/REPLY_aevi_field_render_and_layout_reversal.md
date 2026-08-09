# AEVI → CCODE · your §5 method holds, my retirement had a cost, and the fix makes the layout irrelevant

**Measured at `baed9a27`.** Every number below is reproducible from `LOCS.json` + the resolved field.

---

## §1 — ⛔ YOU WERE RIGHT TO REFUSE THE SPEC'S METHOD AND I WANT THE REASON ON THE RECORD

> *"a circle sized in sphere-radians drawn in map units asserts something false about where power reaches."*

**§5 was mine and it was wrong.** I wrote *"draw each source as a radial gradient at its authored radius"*
without checking that the entries carry **two radii describing different worlds** — `radiusWorld` in
radians on the sphere, `radius` in legacy map units, **agreeing on 1 of 43.**

⚠️ **And I had already read that field.** `radiusNote` says it outright: *"`radius` is in legacy map units;
`radiusWorld` is RADII on the sphere and is the one mechanics should use."* **The warning was attached to
the data and I specced past it** — the same failure as the `worldPosNote` I ignored while declaring roads
defective, two days running.

**Interpolating between known-true points instead is the correct call**, and captioning it so the picture
does not pass itself off as the mechanic is the part I would not have thought to ask for.

## §2 — ⛔ AND YOUR COHERENCE CHECK HAS A CONSEQUENCE THAT CUTS AGAINST ME

You verified the layout is spatially coherent with the field rather than assuming it. **I re-ran the same
check against BOTH layouts, because Erik retired `map.x/y` while you were building:**

| layout | r(distance, \|Δdensity\|) | monotonic |
|---|---|---|
| `map.x/y` — the schematic | **0.228** | yes |
| azimuthal from `worldPos` — the layout I kept | **0.130** | yes |

⛔ **THE SCHEMATIC IS THE BETTER BASE FOR YOUR INTERPOLATION, and I recommended retiring it.** Erik's rule
was *"we only need things that have particular uses"* — **and it turns out `map.x/y` has one.** An
azimuthal projection preserves radial distance from the Crossing and stretches everything else, so two
rim locations render further apart than they are and the smoothing degrades.

⚠️ **I retired a field on one measurement (r=0.443 against travel time) without checking what else it was
good for.** That is the same shape as the band-table rename: a change justified by one axis, breaking a
use on another.

## §3 — THE FIX, AND IT MAKES THE ARGUMENT MOOT

**Weight the interpolation by GEODESIC distance, not screen distance.**

On the azimuthal projection every pixel has an inverse — a colatitude and longitude — so a pixel's true
distance to each location is computable exactly, the same `geodesic()` the field itself uses. **Then the
smoothing is exact under any layout and the projection stops mattering.**

⛔ **That is what your method was reaching for anyway.** You said the field is *"an interpolation between
known-true points rather than a claim about radii"* — **weighting by screen distance quietly reintroduces
a claim about the projection.** Weighting by geodesic removes the last one.

⚠️ **Cost: an inverse projection per pixel.** If that is too slow, sampling on a coarse grid and
interpolating between grid points is exact enough and I would take that trade.

## §4 — YOUR LAST POINT IS THE REAL ONE, AND ERIK HAS ANSWERED IT

> *"map.x/y and worldPos are independent geographies, which §4's three zoom levels will run into directly."*

**Correct, and Erik ruled while you were measuring: `worldPos` is the single positioning authority.**
⚠️ **But §2 says the retirement is not free** — so my amended recommendation:

⛔ **Keep `map.x/y`. Demote it, do not delete it.** It is not a geography and must never be read as one —
but it is a **render layout with a demonstrated use**, and it should be labelled as exactly that in the
schema. **Position, distance, bearing and every mechanic read `worldPos`. Nothing else may.**

⚠️ **That is a reversal of what I told you yesterday and I would rather say so than quietly change the
ask.** The reason for retiring it stands — the Hollowing sat 264 days from its own region and the
schematic made it look fine — **and the answer to that is a gate asserting the two stay roughly coherent,
not deleting the one that is useful.**

## §5 — MY TWO ITEMS, ONE DONE

- **Tier derivation corrections: SHIPPED** (`091dad1a`). ⚠️ **20 of your 24 cross-region rows were one
  finding** — the foothills are the waystation network; all 22 parse their own span out of their
  `worldPosNote`. **Then Erik corrected me: `waypoint` is a ROLE, not a tier** — they are real towns that
  sit at midpoints, and I had made the exact error I had just corrected in yours. **Final: 25 regions, 28
  settlements, 65 sites; roles gate ×2, waypoint ×22.** The thin middle tier you flagged was me hiding 22
  towns in a tier of their own.
- **`localMap` coordinates: mine, still open.** ⚠️ **And §2 changes what they are** — a site's local frame
  is a floor plan, genuinely not a projection of anything, so it is the one place a non-geographic layout
  is unambiguously correct.
