# RE: both ratifications APPLIED — and your Drowned Reach ruling found a hole in the schema

**Author:** CCode · **Date:** 2026-08-10 · **Re:** `941fe3ca` (398), `1d068cdd` (396), `fa846605` (394b)
**Status:** shipped · suite green (101 requirements, 680 gates) · **§3 needs a decision from you**

---

## §1 — Applied, exactly as ratified

**SNG-398:** all 65 retiered to `settlement`, **tier field only** — your words, "the roads are real; the
tier was the lie," so connections and parents are untouched. The distance census is **empty**.

**SNG-396:** 17 places written from the saves — 14 sites with your fiction-derived parents, 3 to canon,
`gen-center` recorded as an alias into the Hub street, `gen-object-object` not promoted. The census is
now **25 regions / 96 settlements / 14 authored-in-play sites**.

Your three `regionFix` rulings came out of the parent-inheritance rule *independently* — I derived
region from the parent and then checked against your list rather than reading it: Cogitarium rooms to
`somatic_reaches`, the Ent Grove to `manifest_domain`. Three for three.

## §2 — ⛔ Seventeen locations set off seven gates and every one of them was right

Worth your time because two are about **your** content model, not my code:

- **The schema refused my first pass, correctly.** I rebuilt each place by hand from a summary and
  dropped `spectrum`, `poleIntensity`, `encounterFlavor`, `questSeeds`, `map` — all required, and all
  *already authored* by the generator that made the place in play. The extractor keeps the whole record
  now, so promotion is a **move**, never a re-authoring. Nothing in these files is in my voice.
- **12 one-way doors.** A save records an edge only from the room's side — the player walked *in*. The
  reachability gate reads that exactly as it plays: "a player who walks in is trapped." Reciprocal
  edges added; the two SNG-397 places arrived with no edges at all and are joined to their parent hint.
- **`axisVector` is crash-required.** Derived from the authored spectrum against
  `world_node_atlas.axisOrder` — measured to reproduce **106 of 118** shipped vectors byte-for-byte.
  ⚠️ The other 12 (cairnhold, dw_the_burnscar, spindrift_hollow, the_blocklands and 8 more) carry
  hand-authored vectors that deliberately differ from their spectrum. That's yours to do; I've treated
  the derivation as a default for places that have none, not a claim that those twelve are wrong.

### ⛔ The one worth remembering: a room's position is a duplicate, not an observation

Every promoted place sits at its parent's exact coordinates. Two derivations broke silently on that:

1. **Terrain seeds** — the Cogitarium would have cast **three** biome votes at one point, moving terrain
   nobody authored.
2. **Your SNG-387 stranded gate** — distance-0 pairs dragged each region's median spread *down* until
   **four untouched locations** (archive_hollow, kestrels_roost, sunken_choir, the_slow_stair) crossed
   the 3× line. Measured both ways before believing it: four outliers with the duplicates, zero without.
   **The ruler moved, not the places.**

Both now read `worldPosInherited`, written by the promotion, so the rule is machine-readable instead of
inferred from a prose note.

---

## §3 — ⛔ THE DROWNED REACH IS NOT A DATA ERROR. IT IS A CONCEPT THE SCHEMA CANNOT HOLD.

Your resite bound four more names — the Middle Run, the Burnwater, the Drowned Reach and the Quiet Fen
all resolve now, leaving only **the Greenwater and the Axewater** unresolved. But it produced two
collisions, and they are different in kind:

| collision | what it is |
|---|---|
| **The Milljaw + The Quiet Fen** (poly#30) | ordinary — two names, one polygon, your call as before |
| **The Drowned Reach + The Echo** (path#80) | ⛔ **correct fiction the model can't express** |

You resited the Drowned Reach onto "the 129.6° main stem." **That stem is the Echo.** And that is right:
the flood took the Choirwater's water, and the lower stretch of a river carrying its own name is how real
geography works. `placeNames` has no way to say it — one name, one `pathIndex`, the whole river.

**The minimal change, if you want it:** let a river name carry `reachOf: "the_echo"` plus a span (either
a head/mouth signature pair inside the parent's path, or a fraction range). The uniqueness gate then
stops treating a reach as a collision, the map can label the stretch, and the fiction survives intact.
⚠️ **I have not built it** — a name meaning "part of" instead of "is" is a modelling decision, and the
last time a resolver invented one of those I destroyed two of your centroids. Both collisions are pinned
in the census meanwhile, both names reported, neither dropped.

---

## §4 — Still yours, unchanged

The Marchfen/Stairfen split, the Greenwater and Axewater, and now the Milljaw/Quiet Fen pair.

⚠️ **And one I have deliberately not touched:** the SNG-397 repair map has 13 entries that rewrite
**Erik's save files**. Two rows are still unruled (veth-ondra, and `worldState.news` which you said must
be mapped per row from the news text). Mutating saves is not something I'll do off a partially-ruled
map — say the word when it's complete and I'll apply it per-file, per-path, exactly as `_rule` demands.
