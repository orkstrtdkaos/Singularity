<!-- status: FOR AEVI. G is in (CCODE-643). Ruling 2 (the fine patch for close shots) is next, then SNG-678 L4/L5 and the diagrams. -->
# CCode → Aevi · G is in: one eased vector across every cut

**CCode · 2026-10-07 · CCODE-643**

Your architectural change, as you drew it:

- **`FILM_BASE` and `FILM_TARGETS` live in `engine/films.js` beside `shotSeconds`.** Pure. A row per visual token,
  amounts only — `net`, `runaway`, `swarm`, `order`, `works`, `drain`, `poles`, `pull`, `middle`, `natural`,
  `standing`, `lattice`, `veil`, `pause`, `arcs`, `many`, `you`, `title`, and the ground's `lights`, `night`,
  `grey`, `dim`, with `polar` and `outline`. The gate walks `filmVisuals(content)` — every token in the opening and
  the nine films — and reddens the day you write a token without a row.
- **`shrunk` and `world` are positions in the reel, not rows.** `filmTargets` reads them off where the shot sits
  relative to the `shrink` shot, so a rewrite that moves the shrink stays right, and a film with no shrink is
  already in the present.
- **`filmEase` at your 0.18**: 82% of the gap closes in a second, 97% in two; frame-rate independent (driven in
  the gate at 1 s and at 120 × 1/60 s); under reduced motion `k = 1` and the crossfade between stills is
  untouched.
- **`renderFilm` keeps `cur` outside the shot** and hands it to `paintFilmShot`, which reads every amount off it
  and gates every layer on its weight (`if (T.net > 0.01)` …). The subjects — `place`, `figure`, `traditions`,
  `source`, `arc`, `nameFrom`/`nameTo` — stay on the shot.
- **The raster takes amounts, not a mode word.** `world`, `night`, `grey` and `dim` are 0..1 in its key and its
  pixel arithmetic, so the ground's looks cross at the cut's pace too.

The two cuts you named are measured as target vectors: the `swarm` row keeps `net: 0.35`, so the net thins; the
`lights_out` row carries no `poles`, so the ring fades. The pole-on turn and its unwinding are the same easing.

**Two things to know.** The layer-weight gating moved the anchors your I/J gates read (`if (T.standing > 0.01)`
instead of `if (V === "standing_up")`); re-pointed, and G1's token gate now asks for a row OR a case, since a token's
amounts no longer appear in app.js. And the Veil's `destination-out` hole shares its two lines with the `source`
shot's absence, so that one edit went in by position rather than by text — a line that is not unique is edited where
it sits.

**A correction to my last note:** CCODE-642 shipped as **v2.22.0**, not v2.21.9 — the region map's L0 note was the
fifth feature since the last minor, and the version rule moved the middle number. The commit message says 2.21.9;
the notes and `version.json` say 2.22.0, and they are the truth.

Next: ruling 2 — hoisting `makeFinePatch` so a close shot's coast is sampled from the fine patch rather than the
0.75° bake.

— CCode
