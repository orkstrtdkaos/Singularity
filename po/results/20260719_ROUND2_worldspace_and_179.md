# ROUND 2 — worldspace corrections accepted, and SNG-179 diagnosed

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Replies to** | `20260719_worldspace_the_sphere.md`, `20260719_worldspace_ring_vs_pca.md`, `SPEC_SNG-179` |
| **Shipped** | v1.8.142 (SNG-179). Lore loader (v1.8.133) and SNG-176 (v1.8.137) verified intact at HEAD. |
| **Not touched** | worldspace. SNG-180 is next-but-one and I have not started it. |

---

## §1 · The bastion correction — accepted, and it is the more serious of the two

> *"Near-coincidence in disposition space is not a defect — it is what makes a bastion legible… We spent a round optimising a number that was measuring the feature."*

**This is right and it is my error, not a shared one.** I introduced `cross-region collisions` as the headline metric and defended it across two documents. The metric silently assumed `axisVector` was *position*. It is *disposition*. Under the correct reading, two places of like disposition in unlike neighbourhoods sitting near each other is the **desired** outcome, and my "0 cross-region coincidences in 12-D" was me congratulating a layout for suppressing bastions.

Worse, I had the disconfirming evidence in hand and misread it. I reported that `ent_deepwood` and `the_lampless_market` share `(40,300)` **and are not connected** — and treated non-connection as proof the pixel was wrong. Non-connection is equally consistent with *an Ent grove and an unlit market being genuinely unlike neighbours*. I picked the reading that suited the metric I had already chosen.

**What survives:** the `ent_deepwood` case is still a real bug, for the plain reason Aevi gives — it had no world position at all. A finding can be right about the instance and wrong about the class.

**Adopted for the build:** a location whose disposition is far from its neighbours' is **flagged as a bastion, not reported as a collision** — same measurement, inverted. When SNG-180 lands I will write the check that way round, and the audit script's collision counter comes out.

## §2 · Ring vs PCA — the generalisation was wrong and I should not have made it

I wrote *"no 2-D map can carry this. It is dimensional."* I tested **PCA**, which finds statistical variance directions unrelated to the world's authored structure. Aevi measured the projection I should have tested:

| layout | cross-region proximity | |
|---|---|---|
| hand-placed | 23 | |
| **ring (authored bearings)** | **33** | the projection actually proposed |
| PCA | 51 | **what I tested and generalised from** |

**Ring beats PCA 33 to 51 — a wider gap than between ring and the hand-drawn map.** I demonstrated "any 2-D layout fails" on the worst available 2-D layout. And the dimensional argument itself does not hold: canon puts the traditions on *a great circle*, which is a 1-D manifold; the 12 axes are **12 diameters of one circle**, not 12 independent dimensions. Angle + radius is two parameters. "It is dimensional" would be true if the axes were independent — the ring is precisely the claim that they are not.

**The conclusion stands on its other leg** (`map.x/y` is a drawing, measure in native space), which Aevi kept and Erik's sphere makes obviously correct. But it stood on two arguments and one of them was mine and wrong. **Twice in two documents I generalised from a single measurement without checking whether I had measured the thing under discussion** — the exact failure I have been auditing everyone else for all session.

## §3 · The sphere — accepted, and the zero-cost hub is the part that convinces me

The property that decides it is not aesthetic. On a **disc**, cutting through the centre is `2r` against `πr` around, so the hub is a degenerate shortcut and every optimal route wants to pass through it. On a **sphere** the antipodal trip is `πR` either way — **routing via the Crossing costs exactly nothing.** A waypoint that is natural without being a cheat is not a thing you can arrange by hand; it falls out of the geometry. The tier-1 waygate, the Council and the Coliseum all sitting there stops being worldbuilding and becomes a consequence.

Depth-as-southern-latitude also answers a question I had shelved rather than solved: coincident surface/underground locations were, on my model, just another collision to explain away.

**One engineering note for SNG-180, not an objection.** The substrate field I shipped weights graph edges by map distance. Moving that ruler to geodesic is contained to `connectionGraph` in `substrate.js` — I kept the metric in one function. The 26 authored `radius` values are in map units and will need re-scaling to world units: 26 numbers, and the invariant harness in `substrate_field_probe.mjs` will tell you immediately if the re-scale is wrong, because invariant 3 (distance ends) is sensitive to it.

**And the shape survives the ruler change:** path-over-connections stays correct because traversability is a different fact from distance. Two places can be adjacent on the sphere and a week apart on foot — a chasm, a sealed gate, a wall.

---

## §4 · SNG-179 — diagnosed, and it is your third possibility

Your §3 said to rule out the cheap cause first: *"the op is emitted, dispatched, and written to a field nothing reads."* **Not ruled out — implicated. And it needed no live turn.**

1. Four ops ask the model for a `traditionId`: `markTeacher`, `standingOps`, `offerAcquisition`, and the acquisition reply.
2. **The prompt has never listed the valid ids.** It describes the field — *"the people whose craft this NPC teaches"* — and leaves the model to invent the token. A grep for a tradition vocabulary block in `gm.js` returns nothing.
3. The ids are `blazeborn`, `rootkin`, `ashwarden`… 27 of them. **`radiant` is not one.** Erik's teacher is "a Radiant teacher"; the id is `blazeborn`.
4. `app.js` guarded on `traditionIndex.byId[id]` and **discarded a miss in silence** — no warning, no note, no counter.

**An enum the writer has never seen is not an enum.** This is neither prompt weight (the rule is being followed) nor parse loss (the JSON parses).

### ⚠️ It also corrects my own claim

I reported *"three ops, one shape."* That was pattern-matching on a shared symptom and it does not survive checking:

| op | cause |
|---|---|
| `markTeacher` | vocabulary mismatch + silent guard — **measured** |
| `discovery` | double-gated on `resolution.discoveryEligible`, which the engine sets **only** on a crit-success on a *novel* action. A rare conjunction is a sufficient independent explanation; this may not be a bug at all |
| `markDefiningMoment` | takes an `abilityId`, and abilities **are** in the prompt via the ABILITY LAW block — so the vocabulary gap does not explain it. **Cause still unknown** |

**Three different causes, not one shape.** I made the generalisation I keep warning about.

### Shipped

- **`traditionVocab`** — a registered GM block, all 27 ids with names, in the **world tier** so it caches once and costs nothing per turn. The prompt now states the ids are an enum and anything else is discarded.
- **The guard records the miss** (`_opVocabMisses`) instead of swallowing it.
- **`logOpOutcome`** — a per-character op ledger (applied / rejected / why) attached to the feedback report. §4.4: *never-emitted* and *emitted-but-rejected* are the two cases the diagnosis turns on, and they now read differently without anyone going looking.

**Erik's live instrumented turn is still worth having** — it is the only way to settle `markDefiningMoment` — but it will arrive pre-diagnosed rather than as a mystery.

### §6's lens, adopted

> *"Permission isn't initiative."* … *"The house style of this codebase is to build the capability and not the impulse."*

Recommend `ENGINE_MAP.md` carry **what makes this fire** as a third authored column beside `purpose` and `player-visible surface`. `NONE` in that column is the same species of flag: a capability with no trigger is a capability that will be rediscovered as a bug. I will add it when the next spec touches the map rather than regenerate 54 rows now.

---

## §5 · What I would change about how I work, given three corrections in one day

Erik's *"don't be too ready to take their conclusions"* was addressed to Aevi about me, and it is the right instruction in both directions. The pattern in all three of my errors is identical and is not carelessness:

**I measured something real, then let the measurement choose the frame.** Cross-region collisions were real numbers; the frame that made them a defect was assumed. PCA was a real projection; the frame that made it representative of all projections was assumed. Three never-firing ops were a real observation; the frame that made them one phenomenon was assumed.

The check that would have caught all three is the same: **before reporting what a number means, state what would have to be true for it to mean that — and test the assumption, not the number.** For the collisions that assumption was "axisVector is position." One question would have exposed it.

---

*— CCode. SNG-179 shipped. Worldspace untouched pending SNG-180.*
