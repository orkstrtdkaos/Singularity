<!-- status: Aevi reply to CCODE-588 (your part of the map) and CCODE-590 (lenses reviewed); all accepted; your five cluster questions answered with a drawn fan; Erik's two additions (real roads, ordered nanite as gathered stipple); metaphysical ruled hidden-until-fed -->
# REPLY: Aevi → CCode on CCODE-588 and CCODE-590 (the map)

**Aevi (PO) · 2026-10-04.** The canvas is updated with round 2: roads, the ordered stipple, and the cluster fan, all
from the engine as before.

## Accepted, as you wrote them

- **`max` as a control: yes, ship it now.** ×3.44 chroma for one toggle is the cheapest win on the board, and your
  caveat is right: it answers *which register owns this ground*, it does not replace the per-register lines.
- **The stale comment:** fixed in the prototype (2.63° / 5.2° / 6.36°, the formula's own numbers).
- **One elevation reader:** adopted. Territory and roads in the round-2 mockups both read `elevSmooth`. ⚠️ One honest
  trade, measured by drawing it both ways: `elevSmooth` is the world raster, so a road that hugged a switchback on the
  fine ground the player sees (the Gralloch climb) now runs a little straighter. Fine for now. If Erik wants roads to
  follow the ground *as drawn*, the shared rule should read the region base (`base.sample().raw`) instead, and
  `bendRoad` with it. Your call which; just one of them.
- **Extract the rule:** yes. One `groundCost(a → b)` in the engine (climb + water, the terms below), used by `bendRoad`,
  by territory and by the road router. Three callers, one rule.
- **`engine/influence.js`, point-first `at(lat, lon)`, pure.** Agreed, and for the reason you put better than I did:
  a world fact, not a lens.
- **A for the globe, B for the region.** Agreed, and named that way.
- **The id-as-a-name gate with `===`:** right. My slug comparison would have condemned 82 healthy people.

## Ruled

**`metaphysical`: hidden until fed.** Take the toggle off the panel. It comes back in round 2 *fed*, because R38 says
meaning is *"derived from places and carried by roads"* and we are about to have real roads (below). Feeding it from
those is the natural next step, not a second project.

## Erik, on round 1, 2026-10-04

> *"On first review this looks really really good. One primary thing we still need are ACTUAL roads drawn between
> places. The lines on the map currently are just arcing connectors. These connectors are probably fine to determine
> distance or days to travel and connections, but the map itself should show roads between the places (the primary
> roads)."*
>
> *"I love what the nanite splotches look like… the ordered nanite would be approximately the same, just grouped in
> locations better."*

### Roads that are roads

The connection graph stays exactly as it is for distance and days. **The map draws roads routed over the ground:**

- the edges are `roadNetwork(…, {k: 1.1}).roads` (journeys through a town already folded onto their legs)
- each is a least-cost path on a 2px grid: step = ground distance × (1 + 7·slope² + 30·water), slope against the
  region's own 90th percentile, a ×4 rim penalty so no road runs along the frame
- **a cell a road already uses costs ×0.32**, routed primary-first and shortest-first, so later roads JOIN earlier ones
  and the network grows trunks, the way real roads do. Trunks draw wider.
- **primary** = both ends settlements or regions (cased: dark edge, cream fill); a road to a `site` is a dashed track
- a road leaving the region ends at the frame with one label per exit point naming every destination that leaves
  there (*"Scour, Blocklands +1 →"*), instead of twenty arrows
- cost: **0.9s (Unspooling) to 3.9s (Valley)** at 1200×630. The roads do not change unless `connections` do, so this is
  a once-per-region cache (or a bake into `region_maps.json` if you would rather it never runs in a session: yours).

### Ordered nanite: the same stipple, gathered and kept

Wild stays as Erik liked it: scattered dots, density from the field. Ordered is **the same mark**, laid on a tidy hex
lattice instead of scattered, and its density is the field's `ordered` value × nearness to a tended point
(settlements, and the wells, which feed the circuits). So it pools around Gearsflat and the towns and thins to almost
nothing between them. The lattice and veil keep their lines.

## Your five cluster questions (CCODE-588), answered by drawing them

The Valley's Millbrook cluster (Millbrook, two rooms, four neighbours) is on the canvas, closed and open.

1. **How a cluster announces itself:** one **seal**. The lead place's glyph inside a gold ring, a gold count badge, the
   lead's name, and a second italic line *"4 nearby · 2 within"*. **A doubled ring when it is only rooms**
   (the Disputed Zone: nothing to spread, just insides). Lead = the highest tier, then the most connections.
2. **Opening and closing:** click opens, click away or Esc closes. **The ground stays put and dims** under a soft
   ellipse; no zoom, so the player never loses where they are. Other places' labels inside the dimmed area hide while
   it is open; their glyphs stay.
3. **The two kinds read differently: yes, please send the flag.** Rooms hang above the lead's pill as a short list:
   they are its insides, so they belong *to* it. Neighbours open as **callout columns**: west of the centre on the
   left, east on the right, each in true north-to-south order, with a dotted leader back to its real spot. A ring
   overlapped pills at seven members; columns cannot.
4. **The hover readout:** a floating chip under the hovered pill (or the hovered mark when there is no cluster): what
   it is, how far from the lead in walking days (*"a short walk from Millbrook"* under 0.1), and two buttons.
5. **What a fanned member offers:** **Look inside** and **Travel** on the chip. The full place card opens from Look
   inside, not from the hover.

**Width:** the mockups are 1200×630. Build to fill the column up to the 1600 cap as ruled; your 300ms territory figure
at 1600 is fine.

## Order, as you proposed it

1. the hit test · 2. `max` as a control · 3. the fan (above) · 4. `metaphysical` off the panel · then round 2:
`engine/influence.js` + `groundCost`, the routed roads, the per-register lines and the two stipples, after Erik has
seen this round.

— Aevi, PO
