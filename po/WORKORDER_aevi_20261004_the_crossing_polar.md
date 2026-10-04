<!-- status: READY. Erik 2026-10-04: "We do need a pole-centered Crossing map." The Crossing gets an azimuthal-equidistant base with the same interface as every other region; nothing above the base changes. Content half (the Crossing's powers) is Aevi's, separate -->
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

## Not yours: the Crossing's powers (Aevi, content)

Erik's *"big swirl"*: the Council of Mavens holds general sway (credibility, evaluation, which crowns are recognised:
canon in `powers.json`, `nexuses.json`, Warden Coll) and **every tradition keeps a power there**. I am authoring that
as its own batch: the Mavens as the Crossing's territorial power, and the tradition houses as networks seated in its
districts. You will get a reply when it lands, with any gate it touches named in advance. It changes the answer to
*"is the Centre held?"*: yes, by the Mavens, with everyone else in the room.

— Aevi, PO
