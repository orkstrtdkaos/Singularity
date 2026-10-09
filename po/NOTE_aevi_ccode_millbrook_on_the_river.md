<!-- status: BUILT (CCODE-664; landed). Was: OPEN for CCode. Two of your pins hold Erik's ruling back; the content is ready on aevi-mbriver. -->
# NOTE: Aevi → CCode · Millbrook is on the river now, and two of your pins are holding the rest (SNG-678)

**Aevi (PO) · 2026-10-06.** Erik:

> *"Millbrook should be ON the river."*

## What I pushed

**Millbrook's world position is on the Echo's channel.** The water `waterauth.json` authors through Archive Hollow,
Millbrook and Echo River Crossing is `terrain.json` → `hydrology.rivers[89]`. The village now stands about 230 m off its
west bank, 2.2 mi from where it was. Mara Wells' Store and the Watershed Road shared Millbrook's exact coordinates, so
they moved with it (§98 and §251 read them as one town).

- I chose the point a few hundred metres up the bank from the nearest one, so that §255's "the Kindly Rest is near
  (1.6 days)" still reads 1.6. It is the same village.
- `_measured` is re-taken through your content_ci path, so the handshake holds: uphill −75 → −90, the Crossing road
  174 → 166, the north road −13 → −15.
- The three ground-placed sites that hang on those bearings follow them: the Long Fields (anti-uphill), the Smithy and
  the store (roads).

SNG-427's "2 mi of floodplain between the well and the bank" is superseded. In August Erik said "the Well IN the
river", and I answered by moving the river two miles away. He meant the well, not the town.

## What waits on you (branch `aevi-mbriver`, ratchet-red only on these)

**1 · §50 pins the old answer.** `tests/how_it_works.mjs:5428`:

```js
/The Echo \(water\) — 2\.0 mi south-west/.test(mb)
```

The rebuilt layout puts the channel 230 m east-north-east of the well, along the village's east edge. The dock and
wheels are at the waterfront, the ford is upstream, and the Long Fields are across the water. `groundForGM` now says
"The Echo (water) — 230 m east-north-east". Please re-point §50 at what Erik ruled: **the well is at the centre and
not in the water, and the Echo is at the village's edge.** For example, the Echo line reads in metres, not miles, and
is not "0 m". That asks the ruling rather than my number, so the next re-layout won't redden it.

**2 · `KNOWN_RIVER_COLLISIONS` is a literal in content_ci (`tests/content_ci.mjs:976`).** The name "The Echo" signs a 5-point, 129.6° fragment near
the antimeridian at latitude −60 (river 80). That is more than 60° of longitude from every town named for it, and it
shares the fragment with the Drowned Reach. Your §394 comment reads that as a reach of the Echo. It was my mistake,
not fiction: the river through Echo River Crossing is river 89, and the "great river round the world" was me reading
a degenerate trace.

The branch re-anchors `the_echo` to river 89, with the signature taken from its own ends and the old one kept in
`_signatureWas_20261006`. Then:

- the resolver binds it there by signature, margin 24.11;
- the asset row follows (`pathIndex` 80 → 89);
- the unresolved list is unchanged.

**The collision census becomes empty, and two checks redden:** the equality, and "the detector FIRES". Please move
the river census into `ratified_name_census.json` the way CCODE-612 moved the fens, so an empty census is a content
fact I can ratify, and let the detector's non-vacuity run on a fixture instead of on the live collision.

When those two land, the branch goes up as it is: the re-anchor, the rebuilt layout and the new
`po/img/local_mock_millbrook.png`.

— Aevi, PO
