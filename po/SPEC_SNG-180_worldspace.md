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


---

# §7 — CORRECTION (Erik, 2026-07-19): the axes are TENDENCIES, not opposing forces

> *"Body and mind both being at .5 doesn't cancel each other out — these axes are tendencies not
> counteractive forces necessarily. And every location has some number from all of the powers. The
> ones furthest from their poles will be weakest from the geographic location sense, but local pools
> and bastions will affect these numbers."*

**This corrects §2 and demotes `axisVector` from primitive to derived view.**

## 7a. The representation was wrong, and the corpus already holds the right one

A 12-component **signed** vector encodes *net position per axis*. It **cannot** say "body 0.5 AND
mind 0.5" — it says 0.00, which is also what it says for a place indifferent to the axis. I recorded
that as a gap in §2 and treated it as an edge case. **It is the general case stated wrongly.**

**24 pole-magnitudes, not 12 signed axes.** Body and mind are two powers, both present, neither
subtracting from the other. `the_middle_way` is not balanced-to-nothing; it is a place where **both
run strong**, which is the entire content of its name.

**`poleIntensity` is already that representation** — a pole→magnitude map, and the corpus uses all
**24 of 24** poles across 94 locations.

| | |
|---|---|
| **`poleIntensity`** | the **primitive**. Pole→magnitude. Can hold both ends of an axis at full strength. |
| **`axisVector`** | a **lossy derived view** (net = positive pole − negative pole). Useful for ring bearing; must never be the source of truth. |

The 22 vectors I authored this turn are **derived from `poleIntensity`, which is intact** — so no
content was lost, but the derivation is lossy and `axisVector` should be regenerable rather than
authored. **Nothing to re-author; something to re-rank.**

## 7b. The 24-power profile is DENSE, and mostly geographic

> *"Every location has some number from all of the powers. The ones furthest from their poles will be
> weakest from the geographic location sense."*

`poleIntensity` authors 3–5 poles per location (76 of 94 author exactly 3). Those are the **notable**
presences — not the whole truth. **Every one of the 24 powers is present everywhere**, at a strength
set by how far that place sits from that power's Reach.

So the full profile is:

```
power_p(location) = geographic falloff from p's Reach          ← dense, derived, all 24
                  + authored poleIntensity                      ← the notable local deviation
                  + local pools / bastions                      ← modifiers
```

**This is the same architecture as the substrate field**, one power generalised to twenty-four:
regional baseline + authored sources + modifiers, with distance doing the work. One mechanism, two
consumers — and the substrate pool/sink content already shipped is the worked example.

**And it closes the bastion loop.** A bastion is a **local modifier that lifts one power far above
what geography alone would give** — a Seraphic city in ordinary country is *authored high on the
seraphic power*, and the field says so without anyone moving it on a map. Bastions stop being an
exception the model tolerates and become a thing the model expresses natively.

## 7c. Outcomes — replacing §2's `tension` proposal

1. **`poleIntensity` is the source of truth.** `axisVector` is derived, regenerable, and never authored.
2. **A place may author both poles of an axis**, and both stand. No netting at the authoring layer.
3. **The full 24-power profile is derivable** — geographic falloff from each Reach, plus authored
   deviations, plus modifiers. Sparse authoring, dense result.
4. **Bastions are authored as local power modifiers**, not as positions.
5. **§2's `tension` field is withdrawn.** It was a patch on a representation that should not have been
   the primitive. Twenty-four magnitudes need no tension field — *contested* is simply two large
   numbers, and *absent* is two small ones.

## 7d. On the record

I found the contested-axis problem, wrote it up correctly, and then proposed a patch instead of
asking whether the representation was right. Erik answered that in one sentence. **A gap that shows
up three times in twenty-two records is not an edge case — it is the model telling you the shape is
wrong**, and I had the evidence in front of me.
