<!-- status: READY. Erik 2026-10-04: "We do need a pole-centered Crossing map." The Crossing gets an azimuthal-equidistant base with the same interface as every other region; nothing above the base changes. C4: the Crossing's powers landed as content (SNG-668: the Council of Mavens, every tradition seated, houseAt on 37 powers); the reader and the ring are CCode's -->
# WORKORDER: Aevi → CCode · 2026-10-04 · the Crossing, centred on the pole

**Aevi (PO).** Your CCODE-596 question, answered by Erik:

> *"We do need a pole-centered Crossing map. And it's more that every tradition had powers there... the Council of
> Mavens holds sway in general but it is truly a big swirl of powers."*

The axis stays: the Crossing sits on the world's pole (its places are at colatitude 0–0.5, and Threshold Post at
0.9). The map comes to it. The second half of his sentence is content and mine (below, *not yours*).

---

## C1 · A polar base, same interface

`regionExtent` already says `polar: true`. When it does, `regionFrame` builds the base from **`makePolarBase(t, gen,
extent)`** instead of `makeRegionBase`. It returns the same object shape (`sample`, `toScreen`, `toWorld`, `extent`,
`samples`), so the ground painter, the roads, the field, the territory and the clicks keep working without knowing which
base they hold.

- **Projection: azimuthal equidistant on the pole.** ρ = the colatitude measured from the pole the region sits on (90 +
  lat for the south pole, which is where these places are), θ = longitude. Screen: `x = cx + k·ρ·sin θ`,
  `y = cy − k·ρ·cos θ`, with `k = min(w, h) / (2·R)`. `toWorld` is the exact inverse. Distance from the hub is true
  everywhere, which is the property a hub map needs. Longitude 0 points up.
- **Frame radius R = the farthest member × 1.25, floor 0.6°**, *not* the general 3° floor. That floor would make eleven
  places a dot. Measured: the farthest member is Threshold Post at 0.9 → R ≈ 1.1°. The city fills the map.
- **Sampling**: generate on a Cartesian grid in the projected plane (inside the disc), store, bilinear in projected
  coordinates. Same shoreline trick (sign of raw). The 0.25° information floor will make the ground soft at this scale.
  That is acceptable: at city scale the ground is backdrop.
- **Outside the disc** is drawn as the frame's dark margin, and roads leaving the Crossing run out to the rim and label
  there, radially (B3's exits already work through `toScreen`).

## C2 · Find every caller that skips the base

Anything that reads `extent.lo0/lo1`, `conv`, or a per-row longitude scale instead of asking `toScreen`/`toWorld` will
break silently under a polar base. That includes the territory walk's per-row cell size and `inFrame`. **Grep for them
and route them through the base**: a cell's ground size comes from `toWorld` of its corners. This is the same trap as
the two longitude conventions, from the other side.

## C3 · Gate (fixture world with a polar region)

- every member on frame (today 1 of 11);
- every road between two members drawn (today 0 of 12);
- pixel distance from the hub is proportional to colatitude (equidistance holds);
- two places at colatitude 0.3, one at longitude 0 and one at 180, are **0.6° apart on screen**, not 360;
- clicking a mark selects it (A1), and the cluster seal works (the Null Stone and the Regulator Chamber share a point).

Drop the *"No flat map here"* notice when this lands, and close the §415 gap.

---

## C4 · The Crossing's powers: content landed (SNG-668), the reader is yours

Erik's *"big swirl"*, authored in `content/packs/valley/powers.json`:

- **`power_council_of_mavens`** (sovereignty, fair, 72 heads: twelve Mavens and sixty district wardens), seated at
  `the_crossing`, reaching the hub's districts. Leader `warden-coll`, the member who can be reached (`_leaderWhy`).
  `dangerLift: 0`. The two old `"council_of_mavens"` strings (`recognizedBy`, `petitions.to`) now name the power.
  Measured with your `makeInfluence`: the Crossing, the Hundred Markets and the Quiet House are the Mavens' at 1.00 /
  1.00 / 0.98, uncontested. **The Centre is held now.**
- **`houseAt`** on **34 of 37** powers: every power the Mavens would seat keeps a house at the Crossing
  (`the_crossing`; guilds at `the_hundred_markets`). The three outlaws keep none (the Tollmen, the Edge Riders, the
  Gralloch Crown: canon, the Mavens never recognised Harl Maddock's crown). Schema declares the field.
- Gates green before push: content CI, census, certify, how_it_works 4,428/0.

**What the engine needs (yours):**

1. `housesAt(locationId, content)` in `powers.js`, pure. It is **presence, not reach**: it never enters
   `powersReaching`, lifts no danger, anchors no territory. (Putting the Crossing in 34 `reach` lists would have made
   the hub the most dangerous road in the world.)
2. **The GM** gets the houses when the player stands at a Crossing place: who is in the room, by name and kind, one
   line each.
3. **The polar map** (C1): the Mavens are the fill; the houses are **a ring of small marks round their place, fanned the
   way A3 opens a cluster**, each in its power's colour (R4.5), the hover listing them. Thirty-four threads from seats
   across the world would be noise; the ring *is* the swirl.
4. **Gate:** every `houseAt` names a placed location in `the_center`; no outlaw keeps one; adding or removing a
   house changes `powersReaching` and danger nowhere (fixture world).

**Every tradition is now seated** (SNG-668 part 2, Erik: *"valleycraft is Millbrook's council"*). Of the seven
traditions that looked unrepresented, three are ability groups rather than peoples (`valley_craft` → Millbrook's council,
`harmonic` → Harmonic Heights, `radiant_folk` → the Radiant Plateau), and the Syllogists already had the Bloodless Hold
(I had been reading leaders' `domains.primary`, where the NPC's own `tradition` is the truth). Three were real gaps and
are now powers, each led by an NPC who already existed:

| power | tradition | kind | seat | leader | house |
|---|---|---|---|---|---|
| The Calm of the Stillhold | stillhold | sovereignty | the Stillhold | the Keeper of the Unsaid | **the Quiet House** |
| The Ones Called | god_named | order | the Long Span (the crossroads before the Wayhouse) | the One Called Zeus | the Crossing |
| The Table of Kept Terms | bargainers | guild | the Hub Yard (the Crossing) | the One Called Loki | the Hub Yard |

41 powers, **37 houses** at the Crossing. The Stillhold's house is the Quiet House itself: the one roof where no people
may raise a hand, kept by Sain, a Stillhold mediator. All three carry `dangerLift: 0`. Seats stay exclusive (§359): the Wayhouse is the Horizon Compact's, so the God-Named hold court at the crossroads in front of it and the Bargainers keep their table in the Hub Yard (`_seatWhy` on each).

— Aevi, PO
