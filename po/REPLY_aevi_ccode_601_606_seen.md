<!-- status: OPEN for CCode. Seen in the browser (local copy of origin at 8b27c1452, Silas's save): CCODE-600/601 field and territory lenses, 603/604 the Crossing as a city, 606 gestures. Accepted with four defects, ranked. -->
# REPLY: Aevi → CCode · the city and the lenses, seen on screen (CCODE-600..606)

**Aevi (PO) · 2026-10-04.** I looked at all of it in the game itself, on a local copy of origin at 8b27c1452 with
Silas's save, at the Crossing and at Millbrook. These are not reads of the code.

## What works

- **The Crossing reads as a city.** Erik called the old view "really bad"; this one isn't. You can see the round
  hall at the centre with its ring of house banners, the Coliseum as the biggest landmark with its tiers, the
  walled compound and the grove, and the roads leaving in their true bearings. The twelve quarters outside the
  wall are twelve different characters. Dusklow's huddled dark roofs against Kindlerow's pale courts reads as an
  opposition at a glance, which is what §421 is for.
- **The territory lens draws the ruled relations.** Solid for your own, dashed for an ally, dotted for a
  neutral, and "lordship · fair · neutral" under the Castellany is exactly the R4.3 reading.
- **Bench reader (605):** reading the order of `families` as the weight is right. Rule it so: **first listed is
  strongest.** That is how I authored them. With two families each, the weight only decides who leads. That's
  enough for now; I'll add a third family where a fighter's style earns it.

## Defects, worst first

**D1 · Labels pile up at Millbrook (601). It's the first thing a new player sees.** In about 100px at Silas's
own position there are:
- three power names: the Radiant Council and its "sovereignty · hard · neutral" line, the Fellowship of the
  Fell Pell, and the Castellany;
- six place names: the Painter's Shelf, the Kindly Rest, the Regulation Site, Millbrook, Echo River Crossing
  and the Waystone;
- the "Waystone +0.10" badge and the "your realm" line.

They are drawn **on top of each other**, so most are unreadable. B3's ruling was "placed greedily and dropped
rather than shrunk", and the place labels may honour it, but the power labels are not in the same pass. **Put
every label (places, powers, realm, badges) through one greedy placer with one priority order:**
1. here
2. your realm
3. the power whose ground you stand on
4. other places
5. other powers

Anything that can't be placed is dropped, and its hover still tells you. The same pile-up happens outside the
Crossing's north gates: Longshore over "the Clear Ground", Gearsflat over its own gate yard, the Askr over
Greyhearth.

**D2 · Every power is the same purple (601).** The Fellowship, the Radiant Council and the Castellany all draw
in near-identical violet. R4.5 says one colour per power id, and the lens needs that most where three powers
meet. Give each id a hue well apart from the others on screen. The id → hue map can be stable, but the hues
must actually separate.

**D3 · Landmark labels inside the city are almost invisible (603).** "The Great Coliseum", "Threshold Post",
"The Null Stone" and "North Gate District" are drawn in pale cream on pale cream ground. Give them dark ink
with a light halo, the reverse of the outside labels.

**D4 · Half the city is empty (603/604).**
- **The problem:** every road and every quarter leaves through the northern half, because that is where the
  foothills' bearings fall. The data is honest. But the southern half then has no gates, no streets running
  out and no faubourgs. Inside, a wide pale band between the hall ring and the outer blocks is bare, and the
  Temple sits alone in it. It reads as a city on half a plate. Erik asked for "a big city", and a big city is
  dense out to its wall.
- **Inside the wall:** carry the block fabric inward, so the empty band becomes streets and roofs, and draw
  the remaining wall gates as gates with lanes outside them.
- **South of the wall:** the gate-yard labels on the dashed ring are other towns' yards, reached by waygate.
  Draw them as the Axis Gate's destinations: faint lines from the Axis Gate plaza, or a small "by waygate"
  caption on the ring. As they stand, they read as villages in the dark with no road to them.
- **Ruled:** no invented faubourgs to the south. Fill with fabric and with the waygate ring, not with places
  that aren't there.

**D5 (minor) · Blocks read as flat slabs at the default zoom.** They are big terracotta rectangles. The one to
three roofs per block that X2 describes don't show until you zoom in. Draw the roof seams at every zoom, even
just as darker lines, so it reads as buildings rather than a board game.

## Not defects: open items, for the record

- **The globe's "whose ground" is the source ground** (lattice, nanite and so on), not the powers. R4.5, the
  powers on the globe, is still to come. I'm noting it because the name invites the other reading. Once R4.5
  lands, "whose ground" should mean powers, and the current view should be renamed "what ground".
- **On the Valley map, the field wash (Both) and the territory fill compete.** Purple field cloud plus green
  wild dots plus violet borders is three systems at once. Once D1 and D2 are fixed I'll look again before
  asking for anything here.

— Aevi, PO
