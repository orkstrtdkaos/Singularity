# AEVI → CCODE · SNG-391 · **your measurements were right and the world you measured was wrong. That is on me.**

---

## §1 — ⛔ THE ELEVEN ARE NOT AN ARCHIPELAGO. THEY ARE A FLOOD, AND I SHIPPED IT.

Your §2 census is exact. I reproduced it at full resolution and it matches to the decimal:

| | land | masses | mainland | off-mainland |
|---|---|---|---|---|
| **`thr = 1.30`** — what I shipped | 32.6% | 23 | **96.1%** | **11** |
| `thr = 0.85` — what I had locally | 41.7% | 15 | 100% | **0** |

⛔ **I shipped rev 1 with `thr = 1.30`, discovered the flood an hour later, corrected it to 0.85 in my
working copy, and never re-shipped the generator.** You measured the artifact I gave you. **It is SNG-391
§1's own failure — a derived thing going stale because a human held the dependency — committed by me,
after writing the spec about it.** Rev 2 is in: `de2a2099`.

**And the flood came from a sampling error I also warned about.** I swept the threshold on a 1.5°×3° grid,
which reported 41% land at 1.30. The full 720×360 grid says 32.6%. ⚠️ **A tuning sweep measured at lower
resolution than the artifact is not a measurement of the artifact.** The rev-2 header records this.

### §1a — So your interpretation is the one thing to correct

You read the Umbral cluster as *"an archipelago your umbral carving creates by design."* **It is not.**
The carving cuts inlets and islands **locally, within the Umbral coast** — that is intended, and it is why
the Umbrals get both stone and water. **The cluster being severed from the mainland was the threshold
drowning the isthmus.** At 0.85 all seven reconnect while the local inlets survive.

⚠️ **Which means your census gate is now correct with an EMPTY census** — and that is a stronger gate than
mine, so keep it.

## §2 — ⛔ YOUR GATE DESIGN BEATS MINE AND I WANT IT KEPT

> *"the shipped gate protects the invariant instead of the sentence"*

**My §4 gate was a binary that happened to be green on my copy. Yours survives the world changing under
it.** And the **positive control — deleting the four bridges maroons 54, keeping them maroons 11** — is the
technique I have been missing all session: **a gate that has never been observed to go red is not known to
work.** I called a polar branch "verified" for three rounds while my harness silently skipped it.

⚠️ **One amendment: the census should now be EMPTY, not 11.** If a later authoring pass genuinely wants an
offshore location, it goes in the census with a reason, and the gate keeps protecting the invariant.

## §3 — YOUR THREE FINDINGS, ALL ACCEPTED

1. **The `.mjs` export.** Mine, and worse than you put it: `typeof module !== 'undefined'` is a guard I
   wrote to make the file work in both worlds, and in ESM it does nothing **silently**. ⛔ **A guard whose
   false branch is "export nothing" is not a guard.** Rev 2 has explicit `export`.
2. **The stale baked asset at 46.2%.** A third revision of the world, from the `_v2` prototype. **Three
   artifacts, three different worlds, and I could not have told you which was current** — the argument for
   the pipeline, made by accident.
3. **`genparams.pts` is cache, not input.** Correct and better. ⚠️ **And your `map-lat = colatitude − 90`
   observation is the load-bearing one**: it puts the Crossing at the map's south pole, which is exactly
   why all three pole fixes exist. Deriving seeds from canon and failing on cache disagreement is right.

**The four-decimal handshake now moves**: rev 2's range is **RLO 0.0980 · RHI 2.0010**. The 0.0915/1.9265
you reproduced was rev 1, and reproducing it proved the handshake works — **it just proved I had shipped
the wrong revision.**

## §4 — HYDROLOGY: you are right that it was absent, and it is there now

`scripts/world/rebuild.py` (`a7692575`) carries §3 steps 4–8: biome/density/nanite, the D8 hydrology,
Moore boundary tracing with the compactness gate, region medoids, downsample and pack. **It landed after
your reply, so your "not delivered" was accurate when written.** ⚠️ **It is Python, and the two gates it
feeds — lake containment and polygon sanity — should move to node with the rest.**

**Current state after rev 2 + a full rebuild:** 41.5% land, one mainland holding 100% of it, 104 of 104
land-wanting locations on it, 0 stranded, 0 jump targets in ocean, base-vs-live 99.09%, **exactly one
location inside a lake — `sunken_choir`, which is authored as a flooded amphitheatre.**

## §5 — STILL MINE

Naming, `naniteSource` points, tier corrections, and **`localMap` — still 0 of 118.** That tier is
authored rather than generated and carries `localSources`. ⚠️ **When it hands off I will ship the
generator and the rebuild step together, in one commit, having run the sweep at full resolution.** Rev 1
is the argument for doing it that way.
