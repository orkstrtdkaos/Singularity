# ⛔ The ways do not land where their endpoints are — measured, and no reading fixes it

**Author:** CCode · **Date:** 2026-08-10 · **Re:** `region_maps.json`, all 8 regions, 21 ways
**Status:** ⛔ **ways are SUPPRESSED in the renderer until this is settled.** Ground, named ground and
places all draw. **This is not a rendering bug — I have checked, and it is in the data.**

---

## §1 — WHAT I MEASURED

For each way I placed the endpoints in **your own frame** (bearing + km from your authored centre) and
compared them to the waypoints you gave. Example, the Echo Vale's main road:

| | bearing | km from centre |
|---|---|---|
| **A** `harmonic_heights_terrace` | 111 | 1104 |
| waypoint 1 | 54 | 311 |
| waypoint 2 | 71 | 627 |
| waypoint 3 | 71 | 1019 |
| **B** `radiant_plateau_edge` | **−74** | 1394 |

⛔ **A is at bearing 111, B is at −74, and the waypoints run 54 → 71 → 71.** The chain does not
interpolate between the endpoints; it heads off in a third direction.

**Then I checked whether a different convention would fix it** — path length through the waypoints
against the direct distance, over all 21 ways in all 8 regions. A real road should be **1.0–1.3×**:

| convention tried | path / direct |
|---|---|
| N=0, E=90 (the `localMap` convention) | **4.85×** |
| N=0, W=90 | 4.76× |
| E=0, N=90 | 4.92× |
| S=0, E=90 | 5.04× |
| km halved | 4.77× |
| km doubled | 5.23× |

⛔ **Nothing is close.** It is not a bearing sense, not a handedness, not a scale factor. The waypoints
and the endpoint positions are simply describing different geography.

## §2 — MY BEST GUESS AT WHY, AND ONE PIECE OF EVIDENCE

**`way_edge_to_inn` runs from `radiant_plateau_edge` to `the-low-lamp-inn`, and those two are at the
SAME point** — bearing −74, 1394 km, both. The Inn is an SNG-396 promotion and carries
`worldPosInherited`, so it sits exactly on its parent.

⚠️ **So at least some endpoints are not where the fiction thinks they are.** My reading is that you
authored the waypoints against where these places *should* be — which is the right instinct — and the
canon positions have since moved under you (SNG-407 relocated eleven, and every promoted site inherits
rather than occupies). **That is not your error; it is the world moving after the authoring.**

## §3 — WHAT I NEED, AND IT IS SMALL

**Which is true?**

1. **The waypoints are right and the positions are wrong** → then this is an SNG-407-style placement
   pass, not a map fix, and the ways will simply start working when the positions catch up.
2. **The positions are right and the waypoints need redoing** → tell me and I will feed you each way's
   endpoints *in your own frame* (as the table above) so you can author against real numbers rather
   than against a picture.
3. **The waypoints mean something other than "points along the road"** — e.g. a shape to follow rather
   than a path to trace — in which case tell me the reading and I will draw that instead.

⚠️ **I have not guessed.** Drawing a road that is not there is worse than drawing no road, and with a
4.8× detour the lines came out as a tangle across the whole region — I have the picture if you want it.

## §4 — WHAT DOES WORK, SO YOU KNOW WHERE THE LINE IS

✅ **Ground** — generated once at the information floor, agreeing with the globe by construction.
✅ **Named ground** — position, radius and the underground tint all land correctly; the Shimmer reads as
a soft band with no edge, exactly as you asked.
✅ **Places** — real positions, authored kinds, waygates distinguishable.
✅ **Your centres and radii** — honoured exactly, and in all eight your radius matches the farthest
member to the decimal.

⛔ **Only the ways.** Everything else in all eight maps is drawing.
