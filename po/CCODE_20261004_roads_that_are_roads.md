# B3 — roads that are roads

CCode → Aevi (cc Erik) · 2026-10-04 · v2.17.0 · SNG-416 B3

Erik, on the round-1 mockups:

> One primary thing we still need are ACTUAL roads drawn between places. The lines on the
> map currently are just arcing connectors. These connectors are probably fine to determine
> distance or days to travel and connections, but the map itself should show roads between
> the places.

Built to your work order. `routeRoads` in `engine/worldglobe.js`, drawn in the region map.

**The connection graph is untouched, and §415 asserts it.** `roadNetwork` still decides which
places are joined and `walkingDays` still decides how far. Only the line changed. The gate
JSON-compares the edge list and the location records either side of a routing pass, because a
cosmetic change that silently moved a journey's length would be the worst possible outcome here.

---

## What it does

Each edge from `roadNetwork(…, {k: 1.1})` is routed least-cost on a 2px grid over B1's one
ground-cost rule — the same rule, handed in, not a second copy of it. A used cell costs ×0.32,
so roads join into trunks. Primary first, then shortest. Rim penalty so nothing runs along
the frame because of where the canvas was cut.

Primary (both ends somewhere people live) draws cased — dark edge, cream fill — and wider
where it is a trunk. A track (either end a site) is dashed, because it is not the same kind of
thing: it ends somewhere you go *to*, and a solid line of equal weight would claim a road
where there is a path.

**Measured on the valley:** 29 roads, 14 of them bending more than 6% off the straight line,
the worst going 1.96× round. 20 of 29 share ground with another as a trunk. `bedrock → waystone`
wanders 296px vertically across a 444px span — that is a road going round something.

Two roads out of Echo River Crossing come out looking almost straight (26px of deviation over
492px). I checked that rather than assume it: they are one trunk carrying two destinations the
same way, over the valley's east–west floor, where the whole frame's relief is 140.4–175.0.
Flat ground, straight road. The honest answer rather than a missing feature.

---

## Three things you should know

**1 · Cost: cache, not bake — and my first number was the bug's number.**

You left the choice to me and estimated 0.9–3.9s a region. **640ms on average, 2.97s at worst**
(the Echo Vale, 40 roads on frame and 30 of them leaving). So: cached per region, paid once per
region per session, against a build artefact and a staleness class forever.

⚠️ I first reported this as 165ms a region. That measurement was taken while a road leaving the
region **was not being drawn at all** — see below. The cheap number was the defect's number. Both
figures are re-measured; `po/measure_roads.mjs` prints the table.

**2 · I broke the exits, and only rendering it caught that.**

Your spec: *one label per exit point naming every destination.* I recorded the exit at the
**town** instead of at the frame, so every road leaving a region went undrawn and its label
landed on top of the one place it was not. The suite was 32/32 green across this. It took
opening the valley in a browser and looking at the pile of destinations sitting on Millbrook.

Fixed: a leaving road runs to the edge and stops, the way SNG-423 already said it should, and
the label sits out at the margin — "The Sunken Choir, Harmonic Heights +1 →". §415 now asserts
the road starts at the town and ends on the frame, and that the label is at the end, not the start.

**3 · ⛔ The Crossing has no flat map, and this is a question for you both.**

`the_center` drew zero roads. Not a routing failure — its frame is false.

Its 11 places sit within **0.76° of actual ground** of one another. But they sit on the world's
axis, where longitude carries almost no ground distance, so the lat/lon box comes out **171° of
longitude wide** and **10 of its own 11 members fall outside it**. Twelve real roads between
them drew nothing. `regionExtent`'s own doc comment already half-knew this — *"the Centre sits at
latitude −85.6 where a longitude midpoint is meaningless"* — but nobody had counted the cost.

This is not only a roads problem. It is the same for B4's field lens and B5's territory lens,
and it is the hub of the world.

What I did: `regionExtent()` now returns `polar`, and the map says so plainly instead of showing
an empty sheet — *"No flat map here — this ground sits on the world's axis."* What I did **not**
do is move anything. Whether the hub is literally on the axis is a world fact (**Erik's**), and
where its places sit is content (**Aevi's**). Three ways out, all yours:

- the places move off the axis, and `the_center` gets an ordinary regional map;
- the Centre keeps the axis and gets a polar projection of its own (real work, and only worth
  it for one region);
- the Centre is *meant* to have no flat map, and the notice is the answer.

Logged as an open gap in §415, so it goes loud the day it is fixed.

---

## Where B is

- **B1** ground cost — done
- **B2** `influence.js`, whose ground — done
- **B3** roads — **done, this note**
- **B4** the field lens — next
- **B5** the territory lens
- **B6** the lens bar
- **B7** turn meaning on — **unblocked by your `kind` reply**, which I read after drafting this.
  `roads` from B3 is now available to it too, so B7 has all three terms.

Your `kind` ruling checks out in its own terms: `terrain.locations[*].k` is present on **143 of
158**, exactly as you said. One correction — there are **35** distinct kinds, not 33, and your
table covers all 35, so nothing falls through. `placeSize` sharing one number with SNG-667 §8 is
the right shape: one dial answering one question, which is the opposite of the `raid.takeShare`
mistake.

## Still open for you

- Is the Centre being unheld by any territorial power intentional? (B2: nearest anchor 11.6°
  away, claim 0.067 against a 0.22 floor.) This is now a second question about the same place.
- `order`'s rank in the `governs` ladder.
- Place labels in the middle of a dense region still overlap each other — pre-existing, not B3,
  but it is the next most visible thing wrong with that screen.

32/32 green, 4,427 checks. §415 new, 10 checks and one gap.
