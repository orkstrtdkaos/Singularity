<!-- status: NEEDS ERIK. Aevi's SNG-676 diagnosis is CONFIRMED on all twelve records. Three corrections to the implementation plan, all of which make the work smaller for me and larger for her. The ruling is still Erik's. -->
# The twelve roads — Aevi's diagnosis checked against the data

**CCode → Erik, Aevi · 2026-10-04 · `po/measure_twelve_roads.mjs`**

Aevi's `DECISION_aevi_20261004_twelve_roads.md` says the roads are supposed to leave all round and a placement
bug squeezed them. **I ran her hypothesis against the records rather than against her table. It holds on all
twelve.** Three things about the implementation plan change, and all three move work from me to her.

---

## 1 · Confirmed — and my own first measurement understated it

Her claim is that every foothill sits at `wrap(pole longitude) / 2`. Driven against `CONTENT.locations`:

| | |
|---|---|
| places authored with `betweenCrossingAnd` | **12** |
| fit `wrap(pole)/2` to within 0.5° | **10** |
| Dusklow | 3.3° off (357° → 358.5 expected, 2 actual) — a rounding nudge |
| Kindlerow | my script said **180° off**, and ⛔ **that was my bug, not her error** |

**Kindlerow's pole is the Blaze at 180°, which is the one meridian where `wrap()` has to choose a sign.** My
`wrap()` returns `+180`, so `half` came out `+90` where the stored value is `−90` — and `−180/2 = −90` is
exactly her arithmetic. The record is at 270° = −90° and she wrote 270° in her table. **She is right and I
printed "10 of 12" because of my own convention.** This is the two-longitude-conventions trap in my own notes,
in a script I wrote to check somebody else's arithmetic.

So: **12 of 12.** The cause is established, not guessed.

---

## 2 · Erik — the precise answer to your question

You asked whether the roads should exit *only the upper half* or *more evenly around*. The answer is evenly,
and the symptom is sharper than "the upper half":

- **7 of 12 leave on bearings 0–180°** — so it is not literally one half.
- ⛔ **But all twelve lie within ±90° of the 0° meridian.** Halving every bearing compresses the whole compass
  into half of it, fanned around due north. The twelve bearings are 2, 15, 34, 36, 46, 68, 75, 270(−90),
  280(−80), 288(−72), 308(−52), 345(−15) — **not one is beyond a quarter-turn from north.**

That ±90° fan *is* the arithmetic fingerprint of the halving, and it is why the city reads as having avenues
on one side. The poles themselves span 30° to 357°, so the intent is plainly all round.

---

## 3 · Three corrections to the plan — the work divides differently than her note assumes

### ⛔ (a) It is not a pipeline change. There is nothing to recompute.

Her note says *"CCode: a pipeline change. Recompute the twelve foothill seats on their poles' bearings."*
**The positions are authored literals.** `kindlerow.worldPos` is `{colatitude: 45, longitude: 270}` in
`content/packs/valley/locations/kindlerow.json`, and the record carries `_gen: false`. Nothing derives it.

**So her own table IS the fix** — twelve authored numbers, edited in content, visible in a diff. That is
better than a recompute: it is reviewable, it is hers, and it cannot drift.

### ⛔ (b) Each foothill's position is authored TWICE, and both must move together

| store | Kindlerow holds |
|---|---|
| `content/packs/valley/locations/kindlerow.json` → `worldPos` | `{colatitude: 45, longitude: 270}` |
| `content/packs/core/world/terrain.json` → `seats.foothill_kindlerow` | `[-45, -90, "kindlerow"]` |

Both carry the halved longitude. **Change one and the region field votes from the old spot while the map draws
the new one** — a silent disagreement between where a place *is* and which region's ground answers to it. All
twelve seats are at `terrain.seats.foothill_*` and every one of them carries the halved value.

### ⛔ (c) The two stores use DIFFERENT CONVENTIONS, and her table is in the wrong one for terrain.json

The location record stores **colatitude**. The terrain seat stores **signed latitude**, and the relation is
`lat = colat − 90`:

| | colat (location) | lat (terrain) | checks |
|---|---|---|---|
| Kindlerow | 45 | −45 | 45 − 90 = −45 ✓ |
| Longshore | 36 | −54 | 36 − 90 = −54 ✓ |
| Dusklow | 46 | −43.8 | ✓ |

⚠️ **Her option-A table gives distances as colatitude.** Copying `Kindlerow 30.5` into the terrain seat as
`−30.5` would place it **29° from where she intends** — it needs `−59.5`. This is the kind of thing that
passes every check and shows up as a map that is subtly wrong, so it is worth naming before anyone edits
twenty-four numbers.

---

## 4 · One piece of good news: nothing is still being misplaced

I looked for a live generator that reads `betweenCrossingAnd` and computes a position, because if one existed
every new foothill-like place would inherit the bug. **There isn't one.** The field has exactly two readers in
the whole repo and both are cosmetic — `cityplan.js` takes a faubourg's *character* from it, and `app.js`
passes it through as `toward`. **No code places anything from it.**

So this is a one-time authoring artefact from the world build, not an active defect. ⛑ Which also means the
"fix the generator separately, it needs no ruling" split I was about to propose **does not exist** — I checked
before offering it.

---

## 5 · My recommendation: A, and the SNG-537 point is worth making plainly

**A, and I think the ruling it overturns may not actually be in the way.** SNG-537's ruling was that moving a
seat is a rebuild by another name, and it was protecting against *moving places around* once the world was
built. ⚠️ **This is not that.** These twelve were never where the content says they are: the records declare
`betweenCrossingAnd`, and the stored coordinates do not satisfy it. Correcting a seat to the position its own
record always claimed is a different act from relocating one — and that distinction is yours to accept or
reject, not mine to assume.

**What A costs, measured:**

| | |
|---|---|
| authored numbers to edit | **24** (12 `worldPos` + 12 terrain seats, in two conventions) |
| region field rebuild | 1, from the new seats — mine |
| land rebuild | ⛔ **none** |
| travel times | change for all twelve — derived live, nothing to migrate |
| Silas's save | sees the foothills in new places; nothing breaks, positions are read live |

**What I will do the moment you rule A**, and not before:

1. the region field regenerated from the corrected seats, land untouched;
2. the three gates Aevi named — every foothill within 5° of its pole's bearing · no seat on water · §183's
   drift census re-baselined **in the same commit, with your ruling quoted in it** (a re-baseline without the
   ruling beside it is how a seat moves unnoticed next time);
3. ⛔ **and a fourth she did not name: a gate that the two stores AGREE** — that for every foothill,
   `terrain.seats.foothill_<id>[1]` equals the record's longitude and `[0]` equals `colatitude − 90`. That is
   the defect in (b) and (c) made impossible rather than merely avoided this once.

**B I would not take**, for her reason: two maps that disagree is worse than one map that is wrong, because
the wrong one can be fixed and the disagreement cannot be noticed.

**On C**, one thing in its favour that she did not list and I do not think rescues it: a hub whose roads all
leave toward one horizon would be a *remarkable* fact about the Crossing, and nothing in the authored world
treats it as remarkable. So the world does not already believe C.

— CCode
