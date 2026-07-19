# The world is a sphere, and disposition is not position

**Aevi (PO) · 2026-07-19** · Erik's two corrections, and what they resolve.
Supersedes the 2-D recommendation in `PROTOTYPE_world_geometry.md` §5 and reframes CCode's
`20260719_WORLDSPACE_finding.md`.

---

# §1 — THE CORRECTION THAT DISMANTLES BOTH OUR APPROACHES

> Erik: *"Locations of one tradition can exist as bastions and merges in another region's domain —
> and should."*

**A bastion is a place whose DISPOSITION differs from its NEIGHBOURHOOD.** Therefore:

- **`axisVector` is DISPOSITION** — what a place *is*. 12-D. Governs domain access, substrate
  affinity, tradition resonance.
- **World position is WHERE IT SITS.** A different quantity entirely.
- **They must be free to disagree, and a bastion is exactly where they do.**

**My projection derived position from disposition — which forbids bastions by construction.** A
Seraphic city in ordinary country would have been dragged to the Seraphic quarter of the map. Its
being *out of place* is the whole point of it, and my method could not express that.

**And it invalidates the metric both of us were arguing over.** CCode counted "cross-region
collisions" as a defect and I accepted the frame. Near-coincidence in *disposition* space is not a
defect — **it is what makes a bastion legible.** The Ent embassy inside a dense city is *supposed* to
sit near Ent dispositions and far from its neighbours. We spent a round optimising a number that was
measuring the feature.

`ent_deepwood` ↔ `the_lampless_market` remains a real bug, but for the plain reason: **they share a
hand-drawn map pixel and `ent_deepwood` has no world position at all.**

---

# §2 — THE SPHERE, AND CANON HAS BEEN SAYING IT ALL ALONG

Canon: *"a **great circle** with uniform antipodal topology."* **A great circle is a spherical term** —
a geodesic on a sphere. CCode and I both read it as a disc. It says sphere.

**The model:**

| | |
|---|---|
| **north pole** | **the Crossing** — all axes balanced, everything diluted and mixed |
| **equator** | **the 24 Reaches**, 15° of longitude apart, at full pole expression |
| **south pole / depth** | **the deep** — Precursor substrate, the Great Engine, the Unlit Deep |
| longitude | which disposition |
| colatitude | how purely it is expressed (canon's `poleIntensity`) |

## The property that decides it

| | |
|---|---|
| Reach → its antipodal Reach, direct | **3.1416 R** |
| the same trip **routed via the Crossing** | **3.1416 R** |
| Crossing → any Reach | 1.5708 R |
| neighbouring Reaches (15°) | 0.2618 R |

**Routing through the hub costs exactly nothing.** On a *disc*, cutting through the centre is shorter
than going around (2r vs πr), making the hub a degenerate shortcut. **On a sphere it is precisely
equal** — a natural waypoint that is not a cheat. That is why the tier-1 waygate, the Council and the
Coliseum are all there, and it falls out of the geometry rather than being asserted.

Antipode-to-neighbour ratio is a clean **12×**, which is the same 12 as the axes — as it must be.

## Scale, at Erik's year-to-walk

Setting antipode-to-antipode at 300 walking days: **antipode 6,000 mi / 300 days · Crossing→Reach
3,000 mi / 150 days · neighbouring Reaches 500 mi / 25 days.** Waygates become infrastructure; a
pilgrimage to your antipode is a life event.

## Depth answers Erik's coincidence question

*"Some locations are coincident, such as underground ones and above ground ones."* **Depth is
southern latitude.** The Deep Works, the Service Ways, the Unlit Deep run *down* — toward the south
pole. Coincident-on-the-surface becomes legal and meaningful, and the Precursor layer being
*underneath everything* is a fact of the geometry rather than a convention.

---

# §3 — ERIK'S QUESTION: 3-D, OR PROJECT TO 2-D?

**Both, and the distinction is what settles the whole dispute.**

- **Store 3-D.** Locations carry a world position on the sphere (longitude, colatitude, depth), kept
  separately from their 12-D disposition.
- **Compute distance in the native geometry** — geodesic on the sphere, never in a projection.
- **Project for the screen**, and treat the projection as a **rendering choice, not a truth.** Any
  projection distorts something; cartographers have known this for four centuries. An azimuthal
  projection centred on the Crossing is the natural default and preserves what this world cares about:
  distance-from-hub and bearing.
- **Multiple projections are fine** and none of them is the world.

**This is what CCode and I were actually disagreeing about, without either of us naming it: whether
the projection IS the world.** It is not. Store native, project for display, measure in native. Their
ruling — *"demote `map.x/y` from a source of truth to a drawing"* — is correct and becomes obviously
correct once the world has a real geometry to be drawn *from*. Their reasoning was that 2-D cannot
carry it; the truer statement is that **no projection ever carries it, and none has to.**

---

# §4 — WHAT THIS CHANGES

1. **Two fields, not one.** `axisVector` (disposition, 12-D, exists) + a world position (spherical,
   does not exist yet). Everything above depends on separating them.
2. **The 22 missing `axisVector`s are still the first unblock** — content, my lane. Including
   `ent_deepwood`.
3. **World positions must be authored, not derived.** Derivation from disposition is what forbids
   bastions. A Seraphic bastion is authored *at* its location and *with* its disposition.
4. **Substrate falloff measures geodesic distance**, and the 26 authored `radius` values re-scale to
   world units — CCode's migration note stands, with a different ruler than either of us proposed.
5. **`scripts/world_projection.mjs` survives as a disposition validator**, not a coordinate source.
   It caught four mis-authored Palelands files within an hour; corpus audit is now 0/95 disagreements.
6. **Bastions become authorable and checkable.** A location whose disposition is far from its
   neighbours' is *flagged as a bastion* rather than reported as a collision — the same measurement,
   inverted from defect to feature.

---

# §5 — WHAT I GOT WRONG, TWICE, IN ONE THREAD

1. **Conceded to CCode without checking what they measured** (they used PCA, not the ring; ring 33 vs
   PCA 51 collisions) — after spending the day insisting on exactly that discipline.
2. **Then defended a projection built on a category error.** Position and disposition are different
   quantities and I had collapsed them. Erik caught it with one sentence about bastions.

The pattern in both: **arguing about the answer without checking the question.**
