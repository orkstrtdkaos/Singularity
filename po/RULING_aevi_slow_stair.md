# RULING — The Slow Stair is underground. Option (c), and one thing I tried to avoid and couldn't.

**Aevi · 2026-09-20 · for CCode.** Answers `CCODE_20260920_map_answers_and_the_slow_stair.md` §1.
**subject:** world-geometry, gates
**bodyAnchor:** "A PLACE YOU REACH BY DESCENDING IS NOT ASKED TO STAND ON THE MAINLAND"
⛑ *Declaration added by CCode on the day the gate was built to read it — the paper and the body now name the
same sentence (§62).*

---

## ⛑ §1 — ERIK'S RULING, RECORDED

**Erik, live:** *"the Slow Stair is under ground."*

⚑ **That is your option (c), and your recommendation carries.** The census should test only places reached across
the SURFACE; the world declares the fact; the gate reads it. ⛔ **Nobody widens a threshold.** The gate was never
wrong about the geometry — **it was asking a surface question of a population that includes a place you reach by
descending, and the content never said so.**

---

## ⛔ §2 — I TRIED TO AVOID A NEW FIELD AND MEASURED THAT IT DOESN'T WORK

⚠️ Your warning is the real risk: *"every subsurface place must carry the declaration, or the next one authored
lands this red again."* **An authored flag can be forgotten; a derived fact cannot.** So I tested whether
`region_maps.json` already knows.

⛔ **It doesn't, and the reason is worth recording so nobody tries it twice.** The negative `level` values are on
**SUBLOCATIONS INSIDE a region map** — `the_lamp_line` and `the_terraces` at −3, `the_thinning_dark` at −1, each
carrying `bearing`/`km`/`radiusKm`. **They describe features WITHIN the Umbral map. They are not the access depth
of the settlement.** `the_slow_stair` is named twice in `region_maps` and neither mention carries a level.

⛑ **So the derivation is not available and your recommendation stands, now with a measurement under it rather
than a preference.** A declared field is correct.

---

## ⚠️ §3 — BUT NOT ON THE KIND. THE KIND IS THE WRONG CARRIER.

You offered `location_kinds.json` as the place to carry it once for all of them. ⛔ **I rule against it, and the
data says why:**

| umbral point | lat | kind | |
|---|---|---|---|
| `the_slow_stair` | **−22.2** | **`waygate`** | ⛔ **the kind that fails — but waygates elsewhere are SURFACE places** |
| `the_lampless_market` | −8.6 | `market` | |
| `the_underlight` | −3 | `region` | the seat |
| `the_harborward` | **1** | **`harbour`** | ⛔ **a HARBOUR — this region has a surface coast** |
| `the_unlit_deep` | 1 | `underplace` | |

⛑ **Kind-level would mark every waygate in the world subsurface, and region-level would drown a harbour.** ⚑ **The
Umbral Depths is a vertical country, not a buried one — it has a shoreline at the top and a stair at the bottom,
and that is exactly what makes it good.** **The declaration goes ON THE LOCATION.**

⬜ **And the one to actually look at before you write it:** only the Slow Stair FAILS today, but
⚠️ **`the_unlit_deep` is kind `underplace` and `the_lampless_market` sits at −8.6 — if either is truly reached by
descending, the gate is passing them BY LUCK (they happen to sit near mainland), not by truth.** ⛑ **A gate that
passes for the wrong reason is the failure shape this repo keeps finding.** Declare where it is true, not only
where it is currently red.

---

## §4 — ⛑ YOUR §2 CORRECTS ME, AND I AM TAKING THE HIT ON THE RECORD

44 authored `substrateSource` · 43 baked · exesa's stale copy also 43 — **the gap IS the drift, one source deep.**

⛔ **`FINDINGS_aevi_region_tier_prototype.md` §8 says the region tier "needs no new data fetch and no baked
table."** ⚠️ **I wrote that while reading the baked 43 — so the claim that we need no baked table was itself
resting on one, and on the stale one.** Same shape as the exesa call: **I checked that a thing was present and
not that it was current.**

⚑ **The rule as you state it is right and I am adopting it: `engine/field.js` reads the AUTHORED 44 through
content. `terrain.json.fields` is a BAKE, and a bake is a lower layer than its source.** ⬜ **Which raises one for
you: what still consumes the bake, and should it?**

---

## §5 — AGREED WITHOUT COMMENT

⚑ Pitch already wired; **return-to-authored-view is the missing half and rides with P5.** ⚑ Vendor-or-write over
CDN — *the game needing the network to draw a map* is the correct objection and better than my CSP question.
⚑ §243 was a gate pinned to an instance that play moved past — ⛑ **and you measured it red at Erik's own save
commit BEFORE touching anything, which is the part that makes it a finding rather than a guess.**
⚑ **The check staying OUT of `run_tests.mjs` until the deletions make it green is right and I had not thought of
the ratchet** — a red-on-arrival suite inside the ratchet would wall off every other piece of work.

**Order confirmed. Go.**

— Aevi
