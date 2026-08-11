# SNG-417 — Choosing for play, and the threshold finally narrows

**Author:** Aevi (PO) · **Date:** 2026-08-10

---

## §1 — ⛔ FOUR MORE LOCAL LAYOUTS, CHOSEN FROM SAVE DATA

**Ten characters were standing in places with no local map.** The four most-visited without one:

| place | characters | visits |
|---|---|---|
| harmonic_heights_terrace | 1 | **13** |
| the_thinning | 1 | 11 |
| the_crossing | 1 | 10 |
| the_marchward | 1 | 5 |

**Corpus: 12 towns, 57 sites.** ⚠️ **`road` is now 20 of 57 and `prose` 17** — those two carry two-thirds
of all placement.

---

## §2 — ⛔ THE THRESHOLD YOU ASKED ME TO TUNE: **≈ 0.08**

On eight towns I could only say it lay **between 0.053 and 0.541** and refused to narrow it on three
points. **Twelve towns split the classes cleanly** — once prose-driven placements are separated from
gradient-driven ones:

| | relief |
|---|---|
| **prose names a slope** → uphill used regardless | 0.015, 0.017 |
| **prose silent, uphill USED** | ⛔ **0.104, 0.346, 0.541, 0.567** |
| **prose silent, uphill NOT used** | ⛔ **0.001, 0.002, 0.010, 0.018, 0.050, 0.053** |

⛔ **Clean boundary between 0.053 and 0.104. Threshold 0.08.** The bracket narrowed **9.6×** by doubling
the corpus — **which is what a corpus is for, and why I would not narrow it earlier.**

### §2a — And the hardest case proves the ORDER, not just the number

⛔ **`harmonic_heights_terrace` measures relief 0.001 — the flattest reading in the corpus — AND IT IS A
TERRACE ON A HEIGHTS.**

The world layer is measuring the **valley floor the terrace meets**; the terrace itself is below the
generator's information floor. ⚠️ **No measurement at that location can find its slope.** Only the seed
knows: *"the LOWEST TERRACE, where the sonic civilization meets the valley floor."*

⛔ **Prose first is not a tiebreak. It is the primary source, and the gradient is the fallback.**

---

## §3 — TWO THINGS THE NEW TOWNS BROKE

**1 · ⛔ THE CROSSING HAS NO USABLE `roadsOut`.** Every connection it has is one of its own **sites, at
identical coordinates**, so all four computed bearings read **0°**. That is your *"a room's position is a
duplicate, not an observation"* arriving in the road maths.

⚠️ **`roadsOut` is empty on purpose and the twelve roads are placed from fiction** — *"twelve roads leave
the Crossing, one per axis"* — at 30° intervals. **A parent whose only connections are its own children
cannot compute a bearing to anything.**

**2 · ⚠️ THE MARCHWARD'S LAYOUT IS POLITICAL, NOT TOPOGRAPHIC.** Relief 0.346 is real ground, but the
Redline road (3°) and the Stillhold road (−10°) arrive **13° apart** — **the town's whole problem is that
both sides come in the same gate.** That is where its Shared Gate sits, and the fiction and the geometry
agree for once.

---

## §4 — STATE

**Regions: 8 of ~30**, chosen by play. **Local layouts: 12 of ~96**, chosen by play.
**All 57 sites carry `basis`; 22 carry `toward`; 10 carry `level`.**

⚠️ **Next: the places players visit that still have none** — Grovehome, the Stillhold, Radiant Plateau
Edge, and the Cogitarium's entrance hall, which is a site rather than a settlement and will test whether
the local tier nests.
