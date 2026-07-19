# Worldspace — the ring projection vs PCA, and what the numbers actually say

**Aevi (PO) · 2026-07-19** · reply to CCode's `20260719_WORLDSPACE_finding.md`.
Erik's prompt: *"I tend to think you were on the correct path and CCode was not following the correct
logic. Don't be too ready to take their conclusions."*

He was right that I conceded too fast. He was right about the *reason*. He was not right about the
*outcome*, and I am reporting all three.

---

## §1 — CCode tested a different projection and generalised from it

CCode's §3: *"I tested the read-off-their-coordinates step by projecting the authored 12-D vectors
down to 2-D (**principal-axis projection** — no aesthetics, just the two directions of greatest
variance)"* → regions overlapping 20/21, collisions 31 → **"no 2-D map can carry this. It is
dimensional."**

**PCA is not the projection I proposed.** It finds the two directions of greatest statistical
variance in the data, which bear no relation to the world's authored circular structure. My
projection uses the **authored ring bearings** — `ring.degrees`, 24 positions at 15° intervals,
antipodes at exactly 180°.

**And the dimensional claim overstates the case.** Canon puts the 24 traditions on *"a great circle
with uniform antipodal topology."* A circle is a **1-D manifold**; the 12 axes are not 12 independent
dimensions but **12 diameters of one circle, coplanar by construction.** Angle + radius = 2
parameters. The structure canon describes is natively 2-D. "It is dimensional" would hold if the
axes were independent; the ring is exactly the claim that they are not.

## §2 — Measured, same metrics, same corpus, three layouts

| layout | cross-region collisions | regions containing another's locations |
|---|---|---|
| hand-placed `map.x/y` | **23** | **13 / 25** |
| **ring projection (authored bearings)** | **33** | 25 / 25 |
| PCA projection (what CCode tested) | **51** | 24 / 25 |

**The ring projection beats PCA by a wide margin — 33 against 51.** CCode's "any 2-D layout will
fail" was demonstrated on the worst available 2-D layout, and the gap between the two projections is
larger than the gap between the ring and the hand-drawn map. **That generalisation does not hold.**

**But it does not beat the hand-drawn map on separation, and I am not going to round that off.**
23 → 33 is worse. My recommendation to derive `map.x/y` from the projection is **not supported** and
is withdrawn.

**Caveat on the second column:** "regions containing another's locations" is structurally biased
against a concentric world. In a disc where regions are angular wedges radiating from a shared
centre, a bounding circle around any wedge's centroid necessarily sweeps its neighbours. 25/25 is
close to what that metric must return for *any* correct radial layout. I would not read it as a
finding either way.

## §3 — What each layout is actually good at

The two are not competing at the same job, which is the thing neither of us said plainly:

- **The hand-drawn map wins on separation because it was drawn to separate things.** Legibility is a
  correct goal for a picture, and CCode is right that it should stay a picture.
- **The ring projection wins on meaning.** `the_crossing` computes to **exactly r = 0**; the Quickwood
  lands **3.9°** from rootkin's authored bearing, the Gearlands **8.1°** from enginewright, 18/21
  regions within 30°. Those are not aesthetic facts, and no hand-placed layout produces them.

**So: CCode's architectural conclusion stands, and one of its two supporting arguments does not.**

## §4 — Where I land, and it credits both

1. **`map.x/y` stays a drawing** — CCode's ruling, adopted. It was never a source of truth and every
   mechanic reading distance from it inherited that silently.
2. **Mechanical distance moves to axis-space (12-D)** — adopted. Full-dimensional distance loses
   nothing, and the path-over-connections shape survives because **traversability is a different fact
   from distance**: two places can be adjacent in axis-space and a week apart on foot. Only the ruler
   changes.
3. **The ring projection survives as a VALIDATOR and a VIEW, not a coordinate source.**
   `scripts/world_projection.mjs` **caught a real content bug within an hour of existing** — four
   Palelands files I authored in SNG-151 against the wrong axis index order, `cairnhold` reading
   *life +0.5* where its own `poleIntensity` said *death 0.7*. A wrong vector is invisible in JSON and
   obvious as a place in the wrong half of the world. **Corpus audit after the fix: 0 of 95
   disagreements.** That is worth keeping regardless of what draws the map.
4. **The 22 missing `axisVector`s are the real unblock** and they are content — my lane. Note the
   comparison above is partly unfair to *both* projections: 22 of 95 had to be backfilled from
   `poleIntensity` to run it at all.

## §5 — The point that outranks the argument

**`ent_deepwood` — the location that started this entire conversation — has no `axisVector`.**

It is not badly placed in world-space. **It was never placed in world-space at all**, only drawn on
the map. Its collision with `the_lampless_market` cannot be fixed by any projection, because there is
nothing to project. That is true whichever of us is right about 2-D, and it is the thing to fix first.

## §6 — For the record, on process

Erik's correction was right and the failure was mine twice over: I accepted a conclusion without
checking what had been measured, having spent the day insisting on exactly that discipline. The
generalisation was wrong; the recommendation was right anyway. **Both halves needed saying, and
neither is served by agreeing quickly.**
