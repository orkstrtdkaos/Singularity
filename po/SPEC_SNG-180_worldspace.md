# SNG-180 — Worldspace: the sphere, and disposition vs position

**Author:** Aevi (PO) · 2026-07-19 · **Erik-directed.** Outcomes; engineering is CCode's.
Supersedes `PROTOTYPE_world_geometry.md` §5. Full reasoning: `po/results/20260719_worldspace_the_sphere.md`.

---

# §1 — THE SEPARATION EVERYTHING DEPENDS ON

> Erik: *"Locations of one tradition can exist as bastions and merges in another region's domain —
> and should."*

- **`axisVector` = DISPOSITION.** What a place *is*. 12-D. Governs domain access, substrate affinity,
  tradition resonance.
- **World position = WHERE IT SITS.** A different quantity. Does not exist yet.
- **They must be free to disagree. A bastion is exactly where they do.**

**Deriving position from disposition forbids bastions by construction** — a Seraphic city in ordinary
country would be dragged to the Seraphic quarter. Its being out of place is the point of it.

**This inverts a metric.** "Cross-region collisions" in disposition-space is not a defect count —
**it is the bastion detector.** Same measurement, opposite sign.

# §2 — SHIPPED THIS TURN: all 95 locations are now placed in disposition-space

22 locations had no `axisVector` — including `ent_deepwood`, the location whose map collision started
this. **It was never placed in the world at all, only drawn on the map.**

All 22 derived from their own authored `poleIntensity` against `world_node_atlas.axisOrder`.
**Corpus: 0 missing, 0 disagreeing with their own `poleIntensity`.** Suite and content CI green.

## ⚠️ A gap the authoring exposed: contested axes cannot be expressed

Three locations author **both poles of one axis**. The vector carries the net:

| location | axis | authored | net |
|---|---|---|---|
| `dw_the_burnscar` — *a wound in the deepwood* | death_life | death 0.6, life 0.5 | **−0.10** |
| `the_marchward` — *the border* | violence_peace | peace 0.4, violence 0.4 | **0.00** |
| `the_middle_way` — *the school of balance* | body_mind | body 0.5, mind 0.5 | **0.00** |

The nets are right. **But 0.00 is indistinguishable from "this place has no character on this axis."**
The Middle Way's entire identity is *holding both at full strength*, and its vector says nothing.

**Outcome wanted:** a place that holds both poles of an axis should be distinguishable from a place
indifferent to it. A parallel `tension` magnitude is the obvious shape; the invariant is that
*contested* and *absent* stop reading the same. **Not authored — this is a schema question and
inventing a field unasked is how the corpus gets two ways to say one thing.**

# §3 — THE SPHERE

Canon: *"a **great circle** with uniform antipodal topology."* A great circle is a **spherical** term.
CCode and I both read it as a disc.

| | |
|---|---|
| north pole | **the Crossing** — all axes balanced |
| equator | the **24 Reaches**, 15° of longitude apart, at full pole expression |
| south / depth | **the deep** — Precursor substrate, the Great Engine, the Unlit Deep |
| longitude | which disposition |
| colatitude | how purely expressed (canon's `poleIntensity`) |

**The property that decides it:** a Reach → its antipode is **3.1416 R** direct and **3.1416 R routed
via the Crossing** — *exactly equal*. On a disc, cutting through the centre is shorter (2r vs πr),
making the hub a degenerate shortcut. On a sphere the hub is a **natural waypoint that is not a
cheat** — which is why the tier-1 gate, the Council and the Coliseum are all there. It falls out of
the geometry rather than being asserted.

At Erik's year-to-walk: **antipode 300 days · Crossing→Reach 150 · neighbouring Reaches 25.**

**Depth answers the coincidence question.** Underground and above-ground at one surface point is legal
and meaningful, and the Precursor layer being *underneath everything* becomes geometry rather than
convention.

# §4 — 3-D OR 2-D: both, and that was the real disagreement

- **Store 3-D** — a world position (longitude, colatitude, depth), separate from disposition.
- **Measure in the native geometry** — geodesic. Never in a projection.
- **Project only for the screen**, as a rendering choice and never a truth. Azimuthal centred on the
  Crossing is the natural default; it preserves distance-from-hub and bearing, which is what this
  world cares about. Multiple projections are fine and none is the world.

**CCode's ruling — demote `map.x/y` to a drawing — is correct**, and becomes obviously correct once
the world has a real geometry to be drawn *from*. Their reasoning was that 2-D cannot carry it; the
truer statement is that **no projection ever carries it, and none has to.**

For the record: their *no-2D* generalisation was tested with **PCA**, not the authored ring. Measured
on the same corpus — hand-placed 23 collisions, **ring projection 33, PCA 51**. The ring is far better
than what was tested and still not better than the hand-drawn map, so the conclusion holds and one of
its two arguments does not.

# §5 — OUTCOMES

1. **World positions are AUTHORED, not derived.** Deriving them is what kills bastions.
2. **Every location eventually carries both** a disposition (done, 95/95) and a world position (none yet).
3. **Mechanical distance is geodesic in world-space** — substrate falloff first, since it is the only
   consumer today. The 26 authored `radius` values re-scale to world units.
4. **Path-over-connections survives** — traversability is a different fact from distance. Two places
   can be adjacent in world-space and a week apart on foot. Only the ruler changes.
5. **Bastions become authorable and checkable** — a location whose disposition is far from its
   neighbours' is *flagged as a bastion*, not reported as a collision.
6. **CI gate: every location has a 12-component `axisVector`** matching `axisOrder`'s length. The
   absence was invisible for as long as it existed.

# §6 — QUESTIONS FOR CCODE

1. §2 — is `tension` the right shape for a contested axis, or does something already carry it? **Ask
   before I author** — this has now paid for itself twice.
2. §4 — does world position want to be authored per-location, or derived once from the map drawing
   plus a region anchor and then hand-corrected? The second is far less authoring and risks baking in
   the drawing's errors.
3. §3 — the south pole is *depth*. Is depth a third coordinate, or a fourth field? A sphere surface is
   2-D; depth makes it a shell model, and I do not know which is cheaper for you to compute against.
4. Does anything consume `map.x/y` for **mechanics** today other than substrate falloff? That is the
   real blast radius of the demotion.
