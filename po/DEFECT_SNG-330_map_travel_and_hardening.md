# DEFECT + SPEC — SNG-330: the map. Travel button missing on a connected place, and hardening.
## Found in PLAY by Erik. ⚠️ ENGINE, CCode's — diagnosis traced, not guessed.

## THE BUG ERIK HIT: "I was connected to the place I wanted to go, but no Travel button"
```js
app.js:6568   const connectedToHere = CONTENT.locations[here]?.connections || [];
app.js:6645   const reachable = connectedToHere.includes(l.id);
app.js:6664   ${reachable ? `<button id="map-travel">Travel here…` : `Not directly reachable…`}
```
**Reachability reads ONE array: the current location's own `connections`.** It never checks whether the
*destination* lists *here*. That is fine for authored content — **I verified all 96 authored locations: 0
one-directional connections** — but it breaks for minted ones.
### ⚠️ THE MECHANISM — a reciprocal edge written to a place that is never saved
`mintTransitLocation` does both halves correctly **in memory**:
```js
connections: here ? [here.id] : []                       // new → here   (saved: lives in character.generated.location)
here.connections = [...here.connections, id]             // here → new   (⚠️ NOT saved if `here` is AUTHORED)
```
**Authored locations are shared content, not per-character state — nothing persists a mutation to them.** So:
1. You mint a place from an authored one. Both edges exist. Travel works.
2. **You reload.** `character.generated.location` restores `new → here`. **`here → new` is gone.**
3. Standing at the authored place, the destination is not in `connections`, **so the button does not render** —
   while the place still shows on the map, still shows as known, and the fiction still remembers you went.
**That is exactly the symptom: connected in every way a player can perceive, and not in the one array the
button reads.**
### THE FIX
1. **Make reachability symmetric at the read site** — `connectedToHere.includes(l.id) || (l.connections ||
   []).includes(here)`. **One line, and it makes the whole class of one-directional edge harmless.**
2. **Persist player-made edges**: `character.placeEdges[fromId] = [...ids]`, merged into reachability. The
   generated store already persists the other half; this is its missing twin.
3. **A repair on load** for saves that already lost edges — any `generated.location` whose `connections`
   name a place that does not list it back gets the edge restored.

## ⚠️ SECOND BUG FOUND WHILE LOOKING — `knownPlaces` silently forgets
```js
app.js:6081   character.knownPlaces = [...character.knownPlaces, id].slice(-80);
```
**The cap is 80. There are 96 authored locations.** A well-travelled character **silently drops the oldest
place they know** — and since `isKnown` gates naming, description and map labelling, **a place you visited
early becomes "an unknown place" again.** Either raise the cap above the atlas size, or drop by
least-recently-seen rather than oldest-learned. **Forgetting the first place you ever went is the worst
possible eviction order.**

## THE HARDENING ERIK ASKED FOR — "good bones, needs to be robust"
In the order I would do them, cheapest first:
1. **⚠️ SAY WHY, NOT JUST NO.** The current fallback is *"Not directly reachable from X — travel via a
   connected place."* **It does not say which.** It should name one or two: *"…try the Ford or the Wayhouse."*
   The data is right there in `connections`.
2. **Multi-hop travel.** Right now the player is the pathfinder. A known destination should offer **"Travel
   here (4 days, via the Ford)"** — one click, the route shown before committing. **This is the single biggest
   usability win on the screen.**
3. **Show the edges you can use.** Reachable nodes have a class; **the lines between them are drawn from
   `regionEdges` and do not distinguish traversable from merely-adjacent.** Highlight the ones you can walk.
4. **Distance before commitment.** `walkingDays` is already computed and shown *after* the button — **it
   should be on the node**, so a player compares before clicking rather than after.
5. **A "where can I actually go" filter.** With 96 locations the map answers *"what exists"* well and
   *"what can I do next"* badly. That is the difference between an atlas and a tool.
