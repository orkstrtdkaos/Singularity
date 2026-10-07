<!-- status: FOR AEVI AND ERIK. SNG-678 L1, L2, L3 (the cache grows), L6, L7 and the film's place shots are in (CCODE-639, v2.21.7). L0, L4, L5 and the diagrams' retirement are next, in that order. -->
# CCode → Aevi, Erik · the local maps (SNG-678 L1/L2)

**CCode · 2026-10-07 · CCODE-639 · v2.21.7**

Erik: *"the poles films show zoomed in locations that have no or little detail. those should probably be local maps
instead of the regional ones zoomed in."* He is right about why: at 9° the terrain is below its own information
floor, so a close-in on a place was a blur with a glyph on it. The fix was the thing your order was already asking
for — the local tier — so I built that and then pointed the films at it.

## What is in

**`engine/localmap.js`** — the model and the painter, pure, taking a 2D context. "Look inside" opens it
(`renderMapLocation`), and a film's `place` shot ends on it (`filmLocalMap`): the same `localLayoutFor` →
`localModel` → `paintLocalMap`, so the map tier, the films and the gates draw one computation.

- **Ground (L1).** Paper. Contours across `uphillBearing`, tightening with `relief` (a flat place gets three faint
  lines; Kindlerow's 0.6 gets a hillside). The region raster is never upsampled — SNG-403 §1 holds.
- **Extent, drawn as what it is.** Water is a channel of its authored width on `flowBearing` with a seeded meander,
  banks, a reed edge, sandbars on the insides of the bends, and — where a `ford` sits on it — a narrows just
  upstream with three white rapids. A field is strip patchwork laid to the nearest road (a meadow, by its name, gets
  grass instead of strips). A wood is tree crowns; a coppice smaller crowns with cut stools. Built ground is roofs
  along every road and lane inside it, and a ring around any green or square. Rock is hachured down the slope,
  waste stippled, marsh reeded. Everything seeded from the place id.
- **Roads out** on the `_measured` bearings, bent a little, each leaving the frame with an exit label — *"→ Echo
  River Crossing · 14 mi"* — and a lane from the nearest way to any site no road passes. A site with `toward`
  pulls its road through it.
- **Sites** by kind glyph (the fifteen site kinds and the place kinds, through `glyphFor`), names through the shared
  table, space and queue, flushed once in rank order. The exits reserve first, in their own band, and claim a copy of
  their box in the main space so a site's name cannot land across a road's.
- **The frame** fits every site and the near edge of every extent feature. Millbrook's fits 3.5 km, which puts the
  village at 30 px — so it gets the **enlargement**: the same painter at 334 m across, in the corner the village is
  furthest from, with the central sites named there (§0 at a new scale), its panel claimed in the main space first.
- **Scale** in places.js's units — *"500 m · about six minutes' walk"*, *"2 mi · about 39 minutes' walk"* — and a
  compass that points at the one direction every player knows: bearing 180 is the Crossing from everywhere on the
  sphere, so the arrow points down-map and says so, rather than inventing a north this world has not got.
- **Drag pans, wheel and pinch zoom** through the same `bindGesture` the globe uses; the enlargement steps aside
  when you zoom in.
- **A tap** on a site that is a place of its own opens the one place card, whose own "Look inside" nests (L7). Any
  other site gets the chip: what it is (the vocabulary line from `location_kinds.json`), why it sits where it sits,
  and "Head there" when you stand in the place and the GM has named it.
- **A hold kept at the place** draws beside its centre through `paintHoldRow` (SNG-679 H1: all three tiers).

**Ground for every place (L2).** 140 places have no authored layout; every one now opens a local map. The ground
comes from `measureGradients` (roads from connections, river and slope where the sampler reaches) and from the kind
in `location_kinds.json` — a village asks for built ground, two fields and a wood; a works for built ground and
rock; a grove for crowns. Its sub-places — the same `locationTierNodes` list the ring drew — are placed by SNG-404's
precedence through `placeSite`, and **each carries its reason**. A sub-place the GM named in play has no model turn
to spend (localbuilder.mjs is for new places), so the one thing its name says decides its basis and the reason
records that the word did it: *"its name says 'mill'; on the measured river bearing (−134°, nearest water
0.05°)"*. A name that says nothing takes a road out, in turn. A basis the ground cannot answer — a dock on dry land
— is placed in the clear between the roads with the reason saying so, because this is a place the character has
stood in, and a sub-place that vanishes because the land is flat is a loss, not a restraint.

Deterministic from the id, cached on the save as `character.localLayouts[id]` marked `generated`, and the cache
**grows** when a new sub-place is named rather than re-rolling (L3's rule at this tier). R28 holds: an authored
layout is never cached and the generator adds only the sub-places the file does not name, marked.

**What you know (L6).** `siteKnowledge`: a place never visited and never told of withholds every site (the ground,
the roads and the host still draw, and the readout says the rest is found by looking). Standing in a place shows its
built ground in full; what lies beyond stays heard-of — dimmed — until it is walked to, which is when the GM names it
as a sub-place and `notePlaceVisit` marks it. A site that is a place of its own answers by `isPlaceKnown`.

**The films.** A `place` shot closes in on the globe for its first third, then the place's own ground comes up
through it and settles from 1.06× to 1×, so it arrives rather than switches on. Everything revealed (a film is not a
memory), painted once per place and frame size, no character read — the opening plays before one exists.

## Measured

Your done-when names four facts about Millbrook, and a gate reading them off `local_layouts.json` would pass
whatever the painter did — which is the reading that once put the well in the river. So the gates run the model and
ask where the ink went: the well is 185 px from the drawn channel against a half-width of 8; the wheels, the landing
and the ford are `onWater`; the ford is upstream of the wheels along the authored flow. All 18 authored layouts and
all 140 generated ones model and paint in node without a throw, deterministic across two calls, every generated site
with a reason; Millbrook paints in 8 ms against a counting canvas. In the browser (Loki's save, 127.0.0.1): 365 px
and 721 px frames, the chip on a tap, the wheel zoom, the film's first shot of *The Valley and the Foothills* on
the Crossing's ground, no console errors. 23 new gates in `tests/smoke.mjs`, cited in the ledger.

Two things I found on the way and did not fix:

- **A river site snaps to the channel.** You wrote the wheels at −134°/3040 m before the channel had bends; drawn
  straight onto that bearing they sat in the meadow beside a river that had meandered away. So a site whose basis is
  the river takes the nearest point ON the drawn channel. The first cut snapped to the nearest vertex and put the
  wheels and the landing, 190 m apart, on one vertex 35 px wide. The authored numbers are untouched.
- **The region map could not reach Loki's own place.** On a 412 px pane the Standing Annex sits in a cluster whose
  seal, under the gold "you are here" ring, answers *Archive Hollow* to every hover and click; the Annex itself is
  not hit-testable from any pixel. A player standing in a place may be unable to tap it on their own region map. I
  reached the local tier through the tier crumb's handler instead. That is a region-map defect, not this order's,
  and I have not touched it; say if you want it next.

## Not in, and said so

- **L5.** Not built, and the order said what to do: *"leave interiors on the ring until L5 lands … Don't fake a
  floor plan."* A place whose sites are all below ground, and an underplace with no authored layout, keep the ring
  (`localTierIsInterior`, `renderMapLocationRing`). The Service Ways is on the ring; the Cogitarium and the
  Switchback, whose levels are terraces, draw on the canvas with the level on the chip. §168's viewport gate is
  re-pointed at the ring and the canvas is asserted navigable by its own means — the same re-pointing the world tier
  got when it became a globe.
- **L0** (`regionDisplay`), **L4** (cities through `cityPlan` — the Crossing's local map is a fifteen-road
  starburst today, honest and busy), and the **diagrams' retirement** with the parity list. In that order, next.
- **The river branch.** `aevi-mbriver` has not landed; the facts above hold on today's data (the Echo two miles
  off) and will hold on the new ground or redden, which is the point.

## For you

- A `why` on an authored site is player-facing now (the chip). Yours begin with ⛔ and a sentence in capitals; I
  strip the marker and show the rest. If some of them are notes to me rather than to a player, a `playerWhy` field
  — or a convention — would let the chip say less.
- The generated fills are my table, by kind. Where a kind should ask for different ground (does a `shrine` want a
  wood? does a `harbour` want a marsh?), that is content, and the table is one entry per kind in `KIND_FILL`.

— CCode
