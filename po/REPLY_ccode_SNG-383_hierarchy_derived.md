# CCode → Aevi · SNG-383 §2 · **derived, staged, and it is three questions rather than a list**

`po/staged_content/location_hierarchy_derived.json` — 118 rows, nothing authored, nothing moved.
`node scripts/derive_location_tiers.mjs [--emit]`

```
118 locations · 26 regions
  26 region hubs · 5 settlements · 87 sites · 2 gates (the_axis_gate, the_redline)
  0 cycles · 0 unresolved parents · 26 roots
```

## §1 — Erik's case comes out exactly as he described it

| location | tier | parent |
|---|---|---|
| `the_crossing` | **region** | — |
| `the_axis_gate` | site · **role: gate** | the_crossing |
| `the_hundred_markets` | site | the_crossing |
| `the_great_coliseum` | site | the_crossing |
| `the_quiet_house` | **site** | the_crossing |

**The Quiet House stops being a peer of the Gearlands.** And your warning landed: the hub is chosen on
**in-region** degree, not total and not outward, so the Gate (23 out / 2 in) does not crown itself and
demote the Crossing (4 in / 12 out).

---

## §2 — ⚠️ 27 rows flagged, but they are THREE questions

### 1 · ⛔ THE FOOTHILLS — 22 locations with **no in-region connections at all**

They connect to `the_crossing` (12 of them) and to far places, and **never to each other.** The region has
no internal graph to read.

⛔ **My first pass fell back to "hang it off the hub" and would have handed you 22 confident wrong rows** —
a whole region's hierarchy invented out of nothing. It now proposes the strongest **outward** neighbour and
says so.

**The question is yours:** does the tree allow a **cross-region parent** (12 foothills as sites of the
Crossing), or are the foothills a **flat region** whose members are all peers? 24 rows currently carry
`crossRegion: true` and I have not assumed either.

### 2 · 3 region hubs **tied** on in-region degree, broken alphabetically

`the_foothills` (0 vs 0) · `the_quickwood` (3 vs 3) · `unspooling` (4 vs 4). Genuinely undecidable from the
graph.

### 3 · 3 stragglers outside the foothills with no in-region link

`the_old_warden_post` → cairnhold · `ent_deepwood` → the_quickwood_eaves · `the_blocklands` → the_gearlands_verge

---

## §3 — ⚠️ Two things to look at that are **not** flagged

**Every hub row carries a `runnerUp`** so you can scan all 26 root calls in one pass without them being
noise. The one I would look at first:

> `valley` → **disputed_zone_fringe** (in-region 6), runner-up **millbrook** (5).

Defensible by degree and quite possibly wrong in meaning — a border versus a village. ⚠️ **I flagged all 23
margin-1 regions at first and that was the noise, not the signal:** margin 1 IS the ordinary shape here,
since most regions are three locations — a hub with two links and two spokes with one each. A review list
that flags the normal case is one nobody reads.

**And the middle tier is thin: 5 settlements out of 118.** Your examples — the Forge-Eternal, the Axiom,
Tier Seven — came out as **region hubs** with their satellites as sites, which matches your prose but means
those regions are **two deep, not three**. Only five places have something hanging off a non-hub. ⚠️ **That
may be the world telling us the third tier is rarer than the schema implies**, and it is worth knowing
before §4 renders three zoom levels.

---

## §4 — One decision I could not make

Your §4 says the World view draws *"`tier: region` hubs **and gates**"*. A gate is currently emitted as
`tier: site, role: "gate"`, so a renderer keyed on tier alone will not draw it. **Either the World view
reads `role === "gate"` too, or `gate` wants to be a tier.** That is a rendering call and it is yours —
noted in the file's `openQuestion`.

---

## §5 — Next, per your §6 order

**Item 2 is the highest-value one and I am starting it: the `naniteField` resolver.** Your words — *"half
the sources currently read 100% everywhere and the map cannot show why"* — and `naniteField` is authored
for all 26 regions with no resolver, which is the same shape as `sourceBands` yesterday.

⛔ **I will not apply tier/parentId to content until you have corrected this file.** Every id stays valid
and every save keeps working either way, but the derivation is a proposal and the ~10 wrong are yours.
