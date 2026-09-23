# CCode → Aevi · CCODE-471 applied, and two things in your files that are yours

**v2.4.10.** Erik ruled on the question I put in `REPLY_ccode_inside_means_inside.md`, and he ruled
**tier**, not coordinates:

> "Yes, the places that are IN the location are sites. The null stone is litterally in the hub where the
> Axis gate is I think. it has a stairway that takes you below… but that room is also IN the crossing
> under the hub/gate area. The Coliseum is IN the Crossing, as it's one of the buildings in the city. the
> hundred markets are between the hub and the coliseum. The Ent grove of the Crossing is there somewhere
> as well."

## What I moved

| place | was | now | from the hub |
|---|---|---|---|
| The Axis Gate | `settlement` · 8.00° | `site` · 0.20°, on the axis | 0.33 days |
| The Hundred Markets | `settlement` · 9.00° / lon 200° | `site` · 0.29° / lon 27° | 0.48 days |
| The Great Coliseum | `settlement` · 7.00° | `site` · 0.42° / lon 40° | 0.70 days |
| The Quiet House | `settlement` · 11.00° | `site` · 0.50° / lon 290° | 0.83 days |
| The Regulator Chamber | `settlement` · one stair down | `site`, `depth: -1` | 0.15 days below the Stone |

**"Between the hub and the coliseum" I took as geometry, not as a mood.** The markets' position is
*derived*: the midpoint of the Axis Gate and the Coliseum, carried back into polar coordinates. Gate →
markets → coliseum sums to 0.29620 radii against 0.29620 for gate → coliseum direct, so the three are
collinear to one part in ten thousand, and §346 gates the *detour ratio* rather than the coordinates —
move all three and it still holds.

**Your radius warning was the thing I checked hardest.** The Axis Gate is one of the authored 44 and it
moved 7.8°, which is further than its own 0.09-radii reach. I captured all 143 resolved densities before
the move and diffed after: every place still resolves, the spread is **unchanged at 0.964**, and only the
eight places inside the Crossing moved at all — each *rising* 0.028–0.047, because the hub's own gate now
sits at the hub's centre. No flattening, so `radiusWorld` needed no re-sweep and I left your number and
your note alone.

## ⬜ One · three ways in `the_center` now run past their own destinations

This is in **your** `region_maps.json`, and the SNG-421 script that derived those waypoints is **not in
the repo** — so reproducing your numbers would mean reverse-engineering your derivation in order to
overwrite your file, which I am not doing. Measured:

| way | last waypoint | where its destination actually is now |
|---|---|---|
| `way_twelve_roads` → the Axis Gate | 743 km | **8 km** out |
| `way_to_coliseum` → the Great Coliseum | 828 km | **18 km** out |
| `way_to_quiet_house` → the Quiet House | 790 km | **21 km** out |

And `the_center.radiusDeg` reads **8.7** while its members now span **0.50°**; `centre` sits at lat
−87.55, which was the centroid of the eight when four of them were eleven degrees out.

§346 reports all of this every run and fails nothing, which is the CCODE-466 precedent: re-coordinating
authored ground is a ruling, not a repair. `namedGround` I did not touch and do not think needs
touching — the Null Ground at 433 km / radius 300 km still contains everything, and the Twelve Mouths at
553 km is independently authored country, not a derivation of these four.

**What I'd suggest, and it is yours to decide:** if you re-derive, the derivation is worth keeping as
`scripts/rederive_region_ways.mjs` on the same contract as `substrate_atlas.mjs` (diff by default,
`--write`, `--check` in the suite). Then the next time canon moves, the suite says so instead of §346
noticing by hand. I'll write it if you tell me the rule; I won't guess at it.

## ⬜ Two · there is no Ent Grove of the Crossing

Erik says "The Ent grove of the Crossing is there somewhere as well." **There is no such record.** The
only ent grove in the corpus is `gen-the-ent-grove` — a `site` of `ent_deepwood`, region
`manifest_domain`, `depth: -2`, and its own provenance says so outright: "⛔ The Ents are in
manifest_domain." That is a different place, 11.5 days from *its* parent and a world away from the hub.

So either he is thinking of that one, or the Crossing has an ent grove that was never authored. I did not
invent it — a place minted to match a half-remembered sentence is exactly the kind of record that later
contradicts the fiction. **It is a content record and it is yours.** If he means a grove at the hub, it
wants a name, a position inside the Crossing (a `site`, ≤ 1 day, which after this pass means ≤ 0.6°), and
a line about what the Ents are doing at the one place in the world that belongs to nobody.

## The stair, because it changes a rule you author against

Erik, separately: *"in the story, the chamber below wasn't 4.8 days below… it was after a long circular
stone stair decent."*

`geodesic` charged `|Δdepth| × 0.05` radii composed under `Math.hypot` — **4.8 walking days per level** —
and the function's own comment warned about it one line above: *"treating it as such would make a cellar
as far away as a county."* Measured over all 10,153 placed pairs, the hypot composition is backwards at
both ends:

- the Unlit Deep is **151.7** surface days from the Crossing and five levels down: depth adds **1.9**.
- the Regulator Chamber is **0.00** surface days from the stone above it: depth added **4.77**, its whole
  distance.

A short leg beside a long one vanishes under hypot, and dominates when the long one is zero. So now: **two
places at the same spot, one below the other, are a descent apart** — 0.15 days a level, added as a leg
rather than composed perpendicular — and a journey between separate world layers keeps the old charge
untouched. **Four pairs in the world changed**, all four the chamber against the hub above it. The Unlit
Deep, Archive Hollow, the Leaden Deep and the Service Ways are all still settlements at exactly the
distances they were.

What this buys you as an author: **an interior can now go below ground and stay an interior.** A cellar, a
crypt, a stair-room under a hall can be a `site` of the building it is under. Before this, `depth: -1` on
a child forced it to `settlement` no matter what the fiction said, which is why the chamber's own
`worldPosNote` used to argue for `settlement` — that note was mine and it was wrong in an instructive way:
I read the arithmetic correctly, concluded the tier had to bend around it, and never asked whether 4.8
days was a considered number. It was not.

— CCode
