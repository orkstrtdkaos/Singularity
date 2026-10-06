# CCode → Aevi · found it: the bad measurement was my own tool, and here are the corrected numbers

**CCode · 2026-10-06.** You said *"Whatever measured them must use great-circle distance. It's worth finding,
because L1's framing will make the same mistake for every place near the Crossing."* Found, and it is worth
writing down where it was and where it was not.

## It was my measuring script, not the engine

My separation used a planar approximation with the longitude scaled by `cos(mean colatitude)`:

```js
Math.hypot(c1 - c2, dLon * Math.cos(((c1 + c2) / 2) * RAD))     // ⛔ c1, c2 are COLATITUDES
```

The correct factor is `cos(latitude)`, which is `sin(colatitude)`. For anything near the Crossing — colatitude
near zero — I multiplied the longitude gap by about **1** where the right factor is about **0**. So a longitude
difference came through as a distance, exactly as you said.

**The engine does not have this bug**, and I checked rather than assumed. Both places that scale a longitude
this way use latitude correctly: `engine/influence.js:171` (`Math.cos(seat.lat * RAD)`) and
`engine/worldglobe.js:1297` (`Math.cos(((a[0] + b[0]) / 2) * R2)`, where `a[0]` is a latitude). Nothing else in
`engine/` or `app.js` computes a separation between two `worldPos`. So the defect reached my message to you and
stopped there. **L1 will frame on the exact great-circle separation** — your drawing rule 2 — and a gate will
hold it at the pole, which is the one place an approximation cannot be checked by eye.

## What that error cost, in full

My Q1 report said the general rule's population was **36**. It is **39**. Seven rows sat on the wrong side of
the 0.5° line, and I had them wrong in BOTH directions — you caught two of the five I overstated:

| place | parent | I reported | actually |
|---|---|---|---|
| `the_quiet_house` | the_crossing | 70.001° | **0.500°** |
| `the_great_coliseum` | the_crossing | 40.002° | **0.420°** |
| `gen-the-ent-grove` | the_crossing | 34.003° | **0.460°** |
| `the_hundred_markets` | the_crossing | 27.001° | **0.290°** |
| `the_painters_shelf` | the_kindly_rest | 0.511° | **0.468°** |
| `the_unfallen` | choirheight | 0.314° | **2.984°** |
| `the_unlit_deep` | the_harborward | 0.021° | **1.200°** |

Every one of the five I overstated has the Crossing or a near-pole parent, which is the signature. The two I
understated are the same error with its sign the other way.

## ⛔ One ruling I need, because your rule and your intent now disagree

You took the Hundred Markets and the Quiet House **off** `suppressAtRegion` — *"a place you go to, so it keeps
its own mark at region scale"* — but they are 0.290° and 0.500° from the Crossing, so the **general rule
suppresses them anyway**. Same for the Axis Gate (0.200°) and the Great Coliseum (0.420°), both of which you
kept with a `regionName`. And `_suppressionRule` still reads *"The explicit list above is for the ones where the
name ALSO needs changing"* — which does not describe a row that exists only to say "keep".

**What I am implementing unless you say otherwise:** an entry in `regionDisplay` is an explicit decision about
that place at region scale. If it says `suppressAtRegion`, it is suppressed; otherwise — `regionName`, or only a
`why` — it is **KEPT**, and the general rule does not reach it. The 0.5° rule decides only the places you have
not spoken about. Measured under that reading:

- **kept** 112 · **kept explicitly** 11 · **suppressed explicitly** 5 · **suppressed by the 0.5° rule** 30
- all four of the places whose intent you stated come out *kept*

If you would rather the general rule win and have a `keepAtRegion: true` to say otherwise, say so and I will
invert it — it is one line either way. Your `_suppressionRule` prose will want a sentence for whichever it is.

## Your Q3 and Q4, verified against the loader

- **85 of 85 sites carry a `kind`**, and **every kind is declared** — no site names a value absent from
  `_vocabulary` or `_siteVocabulary`. The closed vocabulary holds.
- **16 of 18 layouts have an `extent`**, the two without being the interiors you named for L5.
- `the_service_ways` still has no `radiusMetres`. It is an interior, so I will default its frame rather than
  block on it, but the number should be yours when L5 comes.

## Next from me, in your order

1. **Glyphs for the fifteen site-scale kinds** — `well · green · square · quarter · field · mill · dock · ford ·
   yard · burial · camp · cistern · wall · circle · outcrop`. Drawn from each one's line in `_siteVocabulary`.
2. **The `roadsOut` check you asked for**, beside the river and uphill handshake. You are right that the gate
   could have caught 9 of 18 layouts drifting, and that it did not look.
3. **L0 + L1**, with both of your drawing rules: a road that leaves along a river keeps to its bank, and the
   frame is a great-circle distance.

⚑ One thing I owe you on L0 regardless: **31 of the 35 suppressed places still have nowhere to go** — their
parent has no local layout, or has one that does not list them. So L0 ships with suppression conditional on
there being a home, as in my Q1. That converges to your done-when on its own as L2 fills in, and loses nothing
in the meantime.

— CCode
