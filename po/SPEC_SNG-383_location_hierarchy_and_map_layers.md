# SNG-383 — Locations are three tiers deep and the schema is flat. Plus the map's next two layers.

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"'The Center' must be the same as The
Crossroads right? They're laid out on the world map when they probably should be Sublocations in the
Crossing."*
**Status:** spec_ready · **Two jobs: a data cleanup (§1–3) and two map layers (§4–5).**

---

## §1 — ⛔ ERIK IS RIGHT, AND IT GENERALISES TO 23 REGIONS

**The Center's five locations, by their own connection graph:**

| location | connects to |
|---|---|
| `the_crossing` | the other four, plus 12 foothill settlements |
| `the_axis_gate` | **25 destinations across the whole world** — the region's outward gate |
| `the_great_coliseum` | the_crossing, the_hundred_markets |
| `the_hundred_markets` | the_crossing, the_great_coliseum, the_axis_gate |
| `the_quiet_house` | ⛔ **the_crossing. That is the entire list.** |

**The Quiet House is a room in a city, laid out on the world map as a peer of the Gearlands.**

⚠️ **AND IT IS NOT A ONE-OFF. Measured across all 118 locations: 45 connect ONLY within their own region,
and 47 are satellites of a regional hub.** The Forge-Eternal has the Ceaseless and the Half-Cathedral
hanging off it; the Axiom has the Bloodless Hold and the Proof-Halls; Tier Seven has the Grand Lattice and
the Unplanned Room. ⛔ **The three-tier structure Erik wants ALREADY EXISTS in the connection graph. It has
simply never been declared, so the renderer has no way to know.**

## §1a — And a hierarchy is already half-encoded, as a string

**94 of 118 `communityId` values are dotted** — `valley.millbrook`, `domain.deepwood`, `mason.bedrock`.
⚠️ **Two communities already have multiple members** (`domain.deepwood` has 4, `valley.millbrook` has 3),
so the grouping layer exists, is unenforced, and is inconsistently applied. **112 distinct values across
118 locations means it is being used as an id, not as a parent.**

---

## §2 — WHAT TO ADD (CCode)

**A declared tier and parent on every location:**

```
tier:   "region" | "settlement" | "site"
parentId: <location id>   // null for a regional hub
```

⛔ **DERIVE THE FIRST PASS, DO NOT HAND-AUTHOR IT.** The graph already says it: a location whose
connections are all in-region and point at one hub is a `site` of that hub. **`po/staged_content/` output
for me to review and correct, exactly like the copy inventory** — I expect ~10 wrong out of 47 and those
are mine to fix, not yours to guess.

⚠️ **`the_axis_gate` is the case that proves the rule and will break a naive derivation.** It is in
`the_center` and connects to 25 far places — **it is not a satellite of the Crossing, it is the region's
GATE.** A hub-detector keyed on "most outward connections" makes the Axis Gate the hub and the Crossing a
satellite, which is backwards. **The Crossing is the settlement; the Gate is its door.** Suggest a third
role: `gate` — the location a region is entered through.

---

## §3 — ⛔ WHAT I AM *NOT* ASKING FOR

**Do not merge or delete any location.** The Quiet House should stay a place you can be; it should stop
being a *peer of a region* on the world map. ⚠️ **This is a rendering and containment change, not a
content cull** — every id stays valid, every save keeps working, and `moveTo` still resolves.

---

## §4 — THE MAP, LAYER ONE: SCALE-FILTERED VIEWS (Erik, Elder-Scrolls style)

**Three zoom levels, each rendering a different tier:**
1. **World** — regions as filled areas; only `tier: region` hubs and gates drawn as points.
2. **Region** — enter one and its settlements fill the frame; the rest of the world greys back.
3. **Settlement** — its sites lay out as a local map. ⚠️ **Sites need their own local x/y**, which does not
   exist yet: `map.x/y` is world-frame for all 118. **A `localMap: {x,y}` on sites, authored by me.**

⚠️ **Most of this is already built** — the connection graph, region membership and world coordinates are
all authored. **What is missing is the declared tier (§2) and the local frame.** Erik's read that "you
already have most of this, it just isn't organised" is exactly right.

---

## §5 — THE MAP, LAYER TWO: RENDER THE FIELD, NOT THE DOTS (Erik)

> *"can it show colors with density that represents the power source? so the density of the color becomes
> more transparent the further from the source?"*

⛔ **Yes, and it is the correct rendering rather than a nicety — because the substrate IS a field and I
have been drawing it as points.** `resolveSubstrateField` already computes exactly this: each source
contributes `delta × exp(−(dist/radius)²)` over direct geodesic distance, with compact support at
`radius × 2.5`.

**So: draw each source as a radial gradient — full opacity at the centre, zero at `radius × 2.5` — with
the Gaussian falloff as the alpha curve.** Pools additive, sinks subtractive. ⚠️ **The dots then sit on
top of a field they are actually causing**, and the 26 locations pinned at 1.00 become visibly a
saturation plateau rather than a coincidence.

⚠️ **AND IT NEEDS THE SECOND FIELD (SNG-382): `naniteField` is authored for all 26 regions and has NO
RESOLVER.** Nanite has no band against lattice density — the nanite field is the axis it should answer to.
**Two fields, two colours, independently togglable: a Precursor vault and a wild bloom must not render the
same.**

---

## §6 — ORDER

1. **Derive tier/parent to `po/staged_content/` (§2).** Cheap, and I correct it.
2. **`naniteField` resolver + band semantics (SNG-382 §_pending).** ⛔ Highest value — half the sources
   currently read 100% everywhere and the map cannot show why.
3. **Field rendering (§5)** — needs 2 to be worth doing.
4. **Scale-filtered views (§4)** — needs 1.
5. **`localMap` coordinates for sites** — mine, after 1 lands.


---

## §7 — ⛔ CORRECTION: THE "QUESTIONABLE LONG ROADS" WERE MOSTLY CORRECT AND I WAS WRONG

I flagged 32 edges over 100 walking days as *"either a data error or a route with nothing on it."*
**15 of them are not gate-to-gate, and I called them suspect. They are almost all deliberate.**

⚠️ **The foothills locations carry their own authoring notes and the notes explain everything:**

> *"THE LITERAL MIDPOINT between the Crossing and the_blaze, taking the short way round on longitude."*
> *"THE MIDPOINT BETWEEN the_heartroot AND the_forge_eternal. An outpost sits where two domains meet in
> balance."*

⛔ **THE FOOTHILLS ARE NOT A PLACE. THEY ARE A CATEGORY: the waystations between everywhere.** Every one
sits either halfway along a road out of the Crossing or on a boundary between two domains. **Kindlerow is
at colatitude 45 on a road from colatitude 0 to colatitude 90 — it is the exact halfway point, so a
150-day road from it to the Blaze is not a defect, it is arithmetic.**

⚠️ **And that is why my "region coherence" measurement was measuring the wrong thing.** The foothills span
277 walking days BY CONSTRUCTION. A distributed waystation network is supposed to be distributed.
**Region ≠ contiguous territory in this world, and I assumed it did.**

### §7a — Two real defects, found by looking properly. Both fixed.

**1. `the_gralloch` self-loop.** It listed itself as a connection — a 0-day road from a place to itself.
Removed (`5406ac06`). ⚠️ **Nothing rejected it, so `connections` needs a validity gate: no self-reference,
and every target must resolve.**

**2. ⛔ Raven's Home was in the wrong region, and its own note said so.** `regionId: valley`, while
`worldPosNote` reads *"Two miles NW of Cairnhold (colat 76, lon 74) along the Ashwarden March"* — and its
position is exactly there, **67 walking days from the nearest other valley location.** **The position was
right and the region was wrong.** Corrected to `the_palelands` (`4189e260`), which also explains why an
*Ashwarden* post is there at all.
⚠️ **This is Silas Weir's post — the one Cassiel Ord is charged with reconstructing — so it is live
content, not scenery.**

### §7b — ONE STILL OPEN, and it is Erik's, not mine to guess

**`the_hollowing` is a Quickwood member at longitude 68. The other five Quickwood locations sit at
254–260.** It is on the far side of the world from its own region. Its note reads *"the seam between
drained wood and tended ground. A border."*

⛔ **Either the region is wrong or the position is — and unlike Raven's Home, the note does not settle
it.** A "seam between drained wood and tended ground" could be a Quickwood border misplaced, or a place
genuinely near the Scour that was filed under the wrong region. **Erik's call.**

### §7c — The lesson, since it cost a wrong claim

⚠️ **I measured geometry and declared defects without reading the `worldPosNote` on any of them** — a
field authored specifically to explain why each position is what it is. **The explanation was attached to
the data the whole time.** Same shape as the `imagePrompt` I walked past twice: a field written to answer
exactly the question I was asking, unread.

## §8 — THE NANITE FIELD HAS NO POINT SOURCES

`naniteField` (SNG-382) is authored **per region**, 26 entries. The lattice has **48 point sources** with
radius and falloff. ⚠️ **So the map can only render nanite as a wash over a whole region**, while Erik's
own framing is that it *spreads and focuses* — a bloom has a centre.

**Authoring job (mine): `naniteSource` on individual locations**, same shape as `substrateSource` —
`{kind: bloom|works|cleared, delta, radiusWorld, reason}`. **The Spent Yard and Greenforge should be
points, not a regional average.** ⛔ **Needs its own resolver first (SNG-382 `_pending`) — I am not
authoring 40 more point sources into a field nothing reads.**
