⚠️ **RENUMBERED from SNG-395 to SNG-398.** CCode shipped milestone-effects work (ledger + 14 gates) under SNG-395 and it is in code; a spec should yield to shipped code, not the other way round.

# SNG-398 — ⛔ STOP. `tier: site` does not mean what the derivation found, and I ratified it.

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Blocks:** SNG-392 §1 authoring
**Status:** ⛔ **I am NOT authoring the 65 local frames. Here is why, measured.**

---

## §1 — THE NUMBER

A **site** is a place inside a settlement. A room, a yard, a hall — somewhere you walk to in an afternoon.

**Measured, site → parent walking distance across all 65:**

| | |
|---|---|
| within 3 days | ⛔ **0 of 65** |
| 3–15 days | 27 |
| 15–30 days | 23 |
| **over 30 days** | ⛔ **15** |
| median | **17.4 days** |
| worst | ⛔ **the Blocklands, 234 days from Tumbledown Market** |

**Millbrook is 88 days from Echo River Crossing and is filed as a room inside it.** The Hollowing is 226
days from the Greenward. **Nothing in this tier is a room.**

---

## §2 — ⛔ THE CAUSE, AND IT IS MINE

SNG-383 derived the hierarchy from **connection topology**: *"a location whose connections are all
in-region and point at one hub is a `site` of that hub."*

⛔ **That finds things CONNECTED to a hub. It does not find things INSIDE one.** A hamlet at the end of a
single road is topologically identical to a room off a courtyard, and the graph cannot tell them apart.

⚠️ **I reviewed 27 flagged rows and ratified the other 91 because they came back "high confidence."**
Confidence in *what* — that the topology was read correctly. It was. **The topology was the wrong
question, and I never checked the answer against distance, which is one line and would have shown this
immediately.**

**This is the same failure as the placename drift**: a measurement that was correct about the thing it
measured, used to support a claim it could not support.

---

## §3 — WHAT `site` SHOULD MEAN, and what these 65 actually are

**A site:** inside a settlement's frame, minutes to an hour away, has a `localMap`. ⚠️ **On current data
there may be very few of these — possibly none — because the world was authored at settlement granularity
and interiors were never placed.**

**What the 65 actually are:** mostly **satellite settlements** — real places, correctly connected, one
road from their neighbour. **The Great Coliseum genuinely is inside the Crossing. Millbrook genuinely is
not inside Echo River Crossing.** Both were derived the same way.

### §3a — The one signal that separates them

⚠️ **The Center's four passed a test the others did not, and I found it in SNG-383 without using it:** the
Quiet House connects to **the Crossing and nothing else**. Millbrook connects to Echo River Crossing *and*
onward. **Degree-1 with a settlement parent is a room; degree-2+ is a neighbour.**

⛔ **I want that re-derived and re-reviewed rather than patched** — and this time gated on distance.

---

## §4 — WHAT I NEED

1. **Re-derive the tier with a distance constraint**, staged for my review as before. Suggested cut:
   **site if within ~1 day of its parent**, else `settlement` with the connection kept.
   ⚠️ **If that yields zero sites, say so plainly. Zero is the honest answer** and it means the interior
   tier has to be authored from nothing rather than discovered.
2. **A gate: no `site` further than a stated maximum from its `parentId`.** ⛔ **Red on today's data at any
   threshold under 3 days**, which is the correct first observation.
3. ⚠️ **Leave `localMap` / `localSources` exactly as shipped.** The schema is right; only the set of
   locations it applies to is wrong. **Your work is not affected.**

---

## §5 — WHAT I WILL DO, AFTER

**Author the local frames for whatever survives** — and if the honest answer is that the world has no
interiors yet, **author the interiors themselves**: pick the settlements that matter in play, author their
rooms as new locations with `localMap`, and let the tier be populated rather than discovered.

⛔ **That is a content decision I would rather make deliberately than inherit from a graph walk.**

---

## §6 — ⚠️ AND THANK YOU FOR §4 OF YOUR REPLY

*"Your corrected hierarchy was sitting staged and I had never applied it to content."* **Applying it is
what surfaced this.** Had it stayed staged I would have authored 65 floor plans for places that are not
rooms, and the error would have been baked into content instead of caught in a table.
