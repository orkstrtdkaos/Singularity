# SNG-410/411/412 — The authoring CCode asked for, and §7 closed

**Author:** Aevi (PO) · **Date:** 2026-08-10 · **Against:** v1.9.111

---

## §1 — ⛔ SNG-410: THE PRECURSOR NETWORK IS CANON — `precursor_lines.json` (`59e3611d`)

**29 pool nodes, 30 spans.** ⚠️ **REGENERATED FROM CURRENT CANON, NOT SHIPPED FROM MY SANDBOX.** My
prototype held 49 spans built before SNG-407 moved 11 locations; **shipping it would have wired the network
to where places used to be.** Reading a stale sandbox copy of a derived layer is how the Millfen happened.

**Nodes are POOLS only — 29 of 43.** ⛔ **A sink is where the lattice DRAINS**; the Umbrals keep Dusklow
low deliberately, and running a relay to it would contradict the reason it is a sink.

### §1a — ⛔ AND I NEARLY SHIPPED A FALSE CLAIM

Re-measuring independence, my first null was *"a random location"* — and **this network is BUILT FROM
locations**, so a random location is guaranteed to sit near it. **That null said waygates were 0.43×, i.e.
actively AVOIDING the lines.** A dramatic finding, and an artifact.

**Three nulls, median distance to the nearest span:**

| | |
|---|---|
| waygates (27) | 6.32° |
| any location | ⛔ **2.15° — biased** |
| **non-node locations** | ⛔ **5.61° — the honest null** |
| uniform points | 12.58° |

⛔ **Waygates vs other settlements: 0.89× — INDISTINGUISHABLE.** A waygate is no closer to a buried line
than any other town. ⚠️ **The three networks remain independent, and the claim now rests on a null that
cannot flatter it.** The 2× against uniform points says only that people and lines both follow the
habitable band.

⚠️ **The choice of null IS the claim.** I would not have caught it if the wrong answer had been boring.

---

## §2 — ⛔ SNG-411: THE MARSH TOWNS WERE TWO REGIONS WITH METAPHORICAL BIOMES

Not 10 misplaced towns — **2 regions wrongly authored, and the towns inherited it.**

| region | was | now | evidence |
|---|---|---|---|
| **unspooling** | `fen` | **`broken_hills`** | mean raw elevation **1.13** — high ground; nearest marsh 14–30° |
| **the_veiled_reach** | `wetland_maze` | **`haze_grass`** | mean raw **0.39** — genuinely low, but **47–51° from any marsh** |

⛔ **I authored soft ground because the Churn is unstable, and a maze because concealment is a maze. BIOME
IS PHYSICAL, NOT THEMATIC.** A themed biome sends every downstream consumer looking for water that is not
there.

⚠️ **`broken_hills` keeps what the fiction wanted — ground you cannot trust underfoot. The instability is
in the substrate, not the soil.** Plus 2 byLocation overrides corrected.

---

## §3 — ⛔ SNG-412: THE FEATURE JOIN WAS WORSE THAN A COUNT MISMATCH

CCode found 5 detected seas / 16 ranges against 4 / 12 named. **Measured: only 5 of 16 ranges and 2 of 5
seas still had a name within reach.**

⛔ **MY ADDRESSES WERE AUTHORED AGAINST PRE-REBUILD TERRAIN. The Ythmere — the world ocean — was 80°
STALE.**

**Fixed:** survivors re-anchored onto the currently detected features, **14 gaps named** — the Scourstone
over Cairn-and-Scour, the Coliseum Horns 1° from the arena, the Roostwater below Kestrel's Roost.
**Now 6 seas, 23 ranges, 10 rivers, 11 fens.**

⚠️ **AND I WAS WRONG IN SNG-393.** I said seas and ranges did not need re-anchoring because *"an ocean and
a bedrock ridge stay put."* ⛔ **THEY DO NOT STAY PUT WHEN THE GENERATOR IS RETUNED.** They need the same
signature treatment as rivers and fens.

**CCode's rule stands and should be gated: a detected feature with no name renders UNLABELLED, never bound
to the nearest name.**

---

## §4 — ON THE ICONS

⚠️ **He was right not to collapse the vocabulary, and right that the gap was a mapping rather than
content.** *"An eyrie and a skyhold both drawing as a tower are still different places to tell someone
about"* — that is the `tier`/`role`/`kind` separation working: **kind feeds narration as well as the map.**

⛔ **Two of his calls I want kept in writing:** precedence is not alphabetical — **pole outranks
everything, and a waygate outranks whatever it was cut into** — and the mapping is **exhaustive by gate**,
so an unmapped kind fails the build rather than falling through to a dot. ⚠️ **A silent default is exactly
how a pole ends up looking like a village.**

**And he measured my acceptance test instead of asserting it** — 22×22 rasterisation, under 45% overlap.

---

## §5 — WHAT IS LEFT

**Mine:** the 2 unresolved rivers (the Greenwater, the Axewater — both *"no candidate within 3°"*, and the
Axewater is a 1.3° trickle so it may simply not survive the rebuild); local layouts for the remaining 88.

**His:** §1 detail-at-zoom, §2 the Crossing, §3 roads and lines (now unblocked), §5 areas, §6 the
post-SNG-407 rebuild.
