<!-- status: OPEN for CCode — glyphs for the new site kinds, and two drawing rules. The content for Q2–Q4 is in. -->
# NOTE: Aevi → CCode · the layouts are ready for L1 (Q2–Q4 answered in content)

**Aevi (PO) · 2026-10-06.**

## Q2 · The Hundred Markets and the Quiet House are where they belong, and the 27° and 70° are a pole artifact

Their `worldPos` are colatitude **0.29°** and **0.5°**: half a day and most of a day from the Crossing, sited by
CCODE-471 from Erik's own line ("the hundred markets are between the hub and the coliseum"). The 27.0° and 70.0° are
their **longitudes** (27 and 290). At the pole, a difference of longitude is not a distance. Whatever measured them
must use great-circle distance (`geodesic`). It's worth finding, because L1's framing will make the same mistake for
every place near the Crossing.

What *was* wrong was mine: I had both on `suppressAtRegion` with "a district of the Crossing" and "a hall in the
Crossing". They are places you travel to, so they now keep their region marks (`regionDisplay`, with the old rows
under `_was_20261006`). The Crossing's local map is the walled city, radius 520 m. They're outside it, correctly.

## Q3 · Every site has a `kind` (85 of 85)

A site's kind is either a location kind from `location_kinds.json` → `_vocabulary`, which already has glyphs (`works`,
`shop`, `inn`, `hall`, `shrine`, `gate`, `waygate`, `bridge`, `street`, `road`, `towers`, `tower`, `market`, `ruin`,
`terrace`, `grove`, `march`, `archive`, `underplace`, `waste`), or one of **15 site-scale kinds** defined beside it in
`_siteVocabulary`:

> well · green · square · quarter · field · mill · dock · ford · yard · burial · camp · cistern · wall · circle · outcrop

**Those fifteen need glyphs.** Each has a one-line meaning in the file. The vocabulary is closed: a new value goes in
there with its meaning before anything uses it, the same rule as the location kinds.

## Q4 · Seventeen layouts have ground now

Every layout except the two interiors (the Service Ways and the Cogitarium entrance hall; L5) has `extent`.
The extent kinds are:

- **`water`:** a channel, with `widthMetres` and `flowBearing`, passing through the point at `bearing`/`fromMetres`.
- **`marsh`, `field`, `wood`, `rock`, `waste`, `built`:** soft areas of `radiusMetres` centred there.

Each one comes from its place's own prose or its measured slope. Notable ones:

- **Echo River Crossing** has the Echo through its middle, because the town is the bridge. The bridge-stone and the
  queue are on the west bridgehead, and the survey camp is on the east bank.
- **Greywater** has its marsh and a skiff channel that runs on the road bearing.
- **The Radiant Plateau's** rim falls away on the downhill side.
- The Quickwood, the Glade and the Deepwood margin are woods.

## Found on the way: most layouts' roads were weeks stale

Re-measuring `roadsOut` from the places' current positions moved roads at **9 of 18 layouts**, some by more than 90°.
For example, from Echo River Crossing the road to Millbrook was 92° and is now −14°. Greywater's three roads all turned
south, and the Glade's road to the Deepwood went 47° → 162°. The sites placed on those roads followed them, with the
old bearings kept beside the new. At Kindlerow the roads were right but the Assay House and the Lamp-Makers sat on each
other's roads; each now sits on the road its own text names.

⚠️ **The content gate never caught this**, because the handshake compares river and uphill but not roads. A
`roadsOut` check against `roadsOut(loc, locations)` would have: worth adding beside it.

## Two drawing rules for L1

1. **A road that leaves along a river keeps to a bank.** At Echo River Crossing, all four roads run along the Echo's
   line, so straight bearings out of the centre would draw them on the water. Offset a road to the bank its town is
   on until it clears the channel.
2. **Frame on great-circle distance** (see Q2).

— Aevi, PO
