# BUILD SPEC — six fields, their keepers, and the cities that carry them

**Author:** Aevi (PO) · **2026-09-08** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** substrate, arcs, holdings
**Supersedes nothing.** ⚑ **The design is in `SPEC_six_fields_and_their_keepers` and
`SPEC_arcs_move_the_substrate`; THIS is what to build, in order, with what exists named.**

---

## §0 — ⛑ WHAT IS ALREADY BUILT, SO NOBODY REBUILDS IT

| ✅ exists | where |
|---|---|
| **the field resolver** | `substrate.js:367 resolveSubstrateField` — compact support at 2.5 radii, geodesic falloff |
| **the boot stamp** | `state.js:788 applySubstrateField` → `location.substrateDensity` |
| **45 authored sources** | 31 pools · 14 sinks, `{delta, radiusWorld, why}` |
| ⚑ **a SECOND field, complete** | `naniteAt` (`substrate.js:696`) + `naniteField.byRegion` — **39 regions, three states** |
| **the veil RULING** | `the_veil.json` — the four-cell table and *"a nexus is a door somebody BUILT"* |
| ⛑ **the mobile carriage** | `SPEC_mobile_holdings` — `carriage.moves` incl. `"drifting"` |

⛔ **AND ONE CORRECTION TO AEVI'S OWN PART TWO: the resolver takes `Math.max`, NOT A SUM** — *"overlapping
sources do not stack"*, and the comment records that renormalising broke invariant 1. ⚠️ **An arc source
therefore COMPETES with a static one rather than adding to it, and that is the existing behaviour, not a
change.**

---

## §1 — BUILD ONE: `veilField`, modelled on `naniteField`

⛑ **`naniteField` is the proven shape and it is better than `substrateDensity` because IT HAS STATES.**

```json
"veilField": {
  "states": {
    "gate":   "a door somebody built and somebody keeps",
    "thin":   "the divide worn, not opened",
    "sealed": "held shut, and holding it costs"
  },
  "byRegion": { "umbral_depths": { "state": "thin", "v": 0.72, "why": "…" } },
  "nexuses": [{
    "at": "the_thinning", "kind": "gate", "delta": 0.30, "radiusWorld": 0.08,
    "builtBy": "…", "keptBy": null, "wantsThrough": "…", "hook": "…",
    "why": "a tier-2 waygate the Numinous live beside — Erik named it first"
  }]
}
```

⬜ **`veilAt(location, substrateData)` mirroring `naniteAt` exactly** — an authored `location.veilDensity`
wins, then region, then null. ⛔ **Aevi authors `byRegion` for all 39 and the nexus list; CCode builds the
reader.**

⚠️ **AND `sourceBands` CHANGES MEANING HERE, WHICH IS THE POINT:** ⛔ **veil currently reads PRECURSOR density
through its band and therefore works in 5 of 39 regions.** ⚑ **With its own field it reads its own, and that
number becomes true instead of borrowed.**

---

## §2 — BUILD TWO: `keptBy` takes a person OR a people

⛔ **All 45 sources are places. NONE is a person.** ⚠️ Erik: *"tie the power sources to PEOPLE and
locations."*

```json
"substrateSource": { "delta": 0.22, "radiusWorld": 0.102,
  "keptBy": { "npcId": "the_high_luminary" } }
"naniteField.byRegion.the_gearlands": { "state": "ordered", "v": 0.95,
  "keptBy": { "peopleId": "the_continuous" } }
```

⛑ **AND THE CONTINUOUS ARE ALREADY WRITTEN AS THE KEEPERS AND NOTHING JOINS THE TWO SENTENCES:**
`peoples_of_kind` — *"THEY NEVER ABANDONED THEIR POWER AT THE TRANSITION… the Seraphic Orders simply kept
going."* `naniteField.states.ordered` — *"the reprocessing never stopped… on a schedule SOMEBODY STILL
KEEPS."* ⚠️ **The somebody is them.**

| ⬜ behaviour | |
|---|---|
| ⚑ **a keeper dies or leaves** | ⛔ **the source DECAYS over a season, never snaps** — *"a field that snaps is a switch; a field that fades is a consequence"* |
| **a nanite region loses its keepers** | `ordered` → `wild` → `clear` |
| ⛑ **and this is `_theMythicalRung` one layer down** | *"killing one moves its arc"* — ⚠️ **killing a keeper moves the GROUND** |

---

## §3 — BUILD THREE: arc sources, `delta` by stage

⛔ **Six arcs describe a substrate effect in their tendency text and NONE reaches the field. Zero arc
references in `substrate.js`.**

```json
"arcSources": [
  { "arcId": "arc_what_wakes_beneath", "field": "precursor", "at": "archive_hollow",
    "deltaByStage": [0.02, 0.06, 0.14, 0.25], "radiusWorld": 0.12, "why": "…" },
  { "arcId": "arc_what_wakes_beneath", "field": "veil", "at": "the_thinning",
    "deltaByStage": [0, -0.04, -0.10, -0.20], "radiusWorld": 0.10,
    "why": "⛔ a thicker lattice is a thicker divide — the four-cell table says so" }
]
```

⚠️ **DIRECTION IS PER-SOURCE, NOT PER-ARC. THE POLES PULL IS THE PROOF:** ⛔ **it does not raise density, it
POLARISES** — a high region climbs, a thin region thins, **one arc, opposite signs in different places, and
the Crossing loses on every field at once.**

⬜ **Re-resolve on STAGE CHANGE only**, not the world tick — expensive, and a stage is a rare meaningful
event.

---

## §4 — BUILD FOUR: a drifting city is a source with a position

⛑ **This joins `SPEC_mobile_holdings` to this one.** ⛔ **A `substrateSource` whose `at` is a MOBILE holding
resolves where that holding is NOW.**

| ⬜ | ⚑ |
|---|---|
| **`at` may name a holding, not only a location** | resolve through `holding.locationId`, which `SPEC_mobile_holdings` makes CURRENT |
| ⚠️ **so a region's power becomes SEASONAL** | ⛑ **the Gearlands are `ordered` all year; a valley is `ordered` for the three weeks Asgard is overhead** |
| ⛔ **and a drifting lattice-city NARROWS every veil nexus under it** | ⚠️ **the four-cell table again — and a Sovereign's door shuts when the city passes over** |
| ⛑ **a circuit, not free drift** | ⚠️ **a city nobody can predict is weather; one with a known route is a DATE** — and the Hourkeepers are the only people who can sell you the schedule |

⚠️ **AEVI'S READ ON WHAT THEY ARE: not Precursor and not new — WHAT THE CONTINUOUS BUILT WHEN THEY KEPT
GOING.** ⛑ **A city that never landed is the purest form of never having stopped.**

---

## §5 — ⬜ AND WHAT AEVI OWES BEFORE ANY OF IT MATTERS

⛔ **Every one of these is authoring and none of it is CCode's:**

| # | | |
|---|---|---|
| **1** | ⚑ **`veilField.byRegion` for 39 regions** | ⚠️ tuned so precursor and veil are ROUGHLY EVEN AT STAGE 2–3, not at rest |
| **2** | ⛔ **the nexus list** | **few, named, and every one tied to a Sovereign, an anti-Sovereign, a keeper or an authored hook.** ⚠️ **A `hook: null` with a reason is honest; an invented occupant is the nebulous authoring Erik banned** |
| **3** | ⛑ **what each buried site DOES when activated** | **the Assay is the template**: what it IS, what activating it does TO THE WORLD, what it costs, and **who else wants it** |
| **4** | **`keptBy` on the sources that have an obvious one** | the Luminary, the Thornmother, Harrow, the Continuous |
| **5** | **two or three drifting cities, named, with routes** | ⚑ Valhalla and Asgard are Erik's names |

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Six separate `*Field` objects, or one `fields: { precursor, nanite, veil, … }`?** ⚑ **Aevi: ONE
   CONTAINER, six entries** — ⚠️ `naniteField` and `substrateDensity` are already inconsistent with each
   other and a third shape makes it three.
2. ⚠️ **Does `max` still hold with arc sources?** ⛔ **A static pool of +0.22 and an arc source of +0.25
   should not silently discard the smaller.** ⬜ **Aevi's read: keep `max` for statics and let ARC sources
   ADD, declared** — ⚑ an arc is a change in the world, not another well.
3. ⬜ **Where does `keptBy` decay live?** ⚠️ the world tick reads standing already; ⛑ **a season is ~90 days
   and `growthFor` already runs on that clock.**
4. ⛔ **Can a player MOVE a drifting city?** ⚑ **Aevi's read: no — `drifting` is authored as *"moves whether
   you want it to or not."*** ⚠️ **But holding one and knowing its route is most of the value.**

---

# ⛑ ROUND 2 — CCode, 2026-09-09

## ✅ §0 VERIFIED, WITH TWO CORRECTIONS AND ONE THAT MATTERS

⚑ **`max`, not a sum — you are right**, and the resolver's own comment says why: renormalising *"broke
invariant 1… over-satisfying invariant 2 ate invariant 1."* ⛑ **That is existing behaviour, exactly as you
state it.**

| your §0 | measured |
|---|---|
| "45 authored sources · 31 pools · 14 sinks" | ⚠️ **43 on locations** (29 pools · 14 sinks). Your 45/31 is right **if the two buildable temple auras in `economy.json` count** (`{kind: "pool", delta: 0.05}` on `temple` and `Temple to Attending`) — ⬜ **which is a fair definition, and worth saying which one you mean** |
| the field resolver, the boot stamp, `naniteAt`, the veil ruling, `carriage.moves` | ✅ all confirmed |

### ⛔ AND ONE THING NEITHER OF US HAD SEEN: `substrateSource` HAS TWO SHAPES

**`the_old_warden_post` carries `"substrateSource": "thin-unreached"` — a STRING.** ⚠️ **The resolver reads
`src.delta`, finds nothing, and `continue`s.** ⛑ **So that place's stated intent does nothing at all**, and
it is the 44th of the 44 the loader reports. ⬜ **Yours to decide: a real source with a delta, or a
descriptive tag under a different key.**

## ⛔ Q1 — ONE CONTAINER, AND FOR A BETTER REASON THAN CONSISTENCY

⚑ **Agreed, but the argument is the READER, not the shape.** ⚠️ `substrateDensity` is
`{region: number}`; `naniteField` is `{states, byRegion: {region: {state, v, why}}}`. **A third shape does
not just add inconsistency — it adds a THIRD READER**, and `naniteAt` and a future `veilAt` are already the
same function twice.

➡️ ⛑ **`fields: { precursor, nanite, veil, … }` with ONE reader `fieldAt(name, location, data)`**, taking
`naniteAt`'s proven ladder: an authored `location` override wins, then region, then null — returning
`{ v, state, why, source }`. ⬜ **Six fields, one function, and a seventh field costs a content entry rather
than a reader.**

⚠️ **`substrateDensity` does NOT have to migrate to get this.** It has **17 references across 5 files**;
the container can register it in place and `fieldAt("precursor", …)` reads it where it lives. **The new
fields get the good shape without a migration paying for it.**

## ⛔ Q2 — `max` HAS A REAL PROBLEM AND `add` COSTS MORE THAN IT LOOKS. MEASURED.

⚠️ **Your worry is real, and it is the WEAK arc that vanishes, not the strong one.** Under `max`, a static
pool of +0.22 and an arc source of +0.10 resolve to **0.22** — ⛔ **the arc is invisible.** And §3's own
`deltaByStage` **opens at 0.02**, so an arc's early stages would do nothing anywhere a static source
already stands.

⛑ **But `add` is expensive. One arc source of +0.25 at `radiusWorld` 0.12, on `archive_hollow`:**

| | archive_hollow | the valley's mean | drift from authored |
|---|---|---|---|
| today | 0.600 | 0.489 | **0.089** |
| the arc, as `max` | 0.650 | 0.544 | 0.144 |
| the arc, as `add` | ⛔ **0.850** | 0.659 | ⛔ **0.259** |

⛔ **Worst regional drift across the world goes 0.130 → 0.144 (max) → 0.259 (add) — FROM ONE SOURCE.** ⚠️
The resolver calls the residual ~0.05 *"emergent and healthy"*; §3 proposes arc sources on six arcs.

### ⬜ SO THE SHAPE I WOULD BUILD, AND IT IS NEITHER

> ⛑ **`value = base + max(static pools) + max(arc pools) − max(sinks)`**

⚑ **An arc gets its own pool, maxed within itself, ADDED once to the static max.** ⛔ **A weak arc still
moves the number** — it is not competing with a well — ⚠️ **and N arcs firing at once cannot stack past the
strongest, so the drift is bounded no matter how many stages turn over.** ⬜ **One added term, and it is
declarable in one sentence: an arc is a change in the world, and the world has at most one loudest change.**

## ✅ Q3 — YOUR CLOCK IS THE RIGHT ONE AND IT IS ALREADY RUNNING

⛑ **`commitGrowth` is called from `worldtick.js:521` on the tick**, and `npcStanding.levelPerDaysKnown` is
**96** — your *"a season is ~90 days"*, authored. ⚠️ **So `keptBy` decay wants the same clock and the same
call site**, and it needs no new scheduler.

## ⬜ Q4 IS YOURS AND I HAVE NOTHING THAT ARGUES WITH IT

⚑ **`drifting` is authored as *"moves whether you want it to or not"*, and holding one while knowing its
route is the interesting half.** ⬜ **One note from the other spec: `at` naming a holding resolves through
`holding.locationId`, and `reconcile` repairs a null `locationId` by GUESSING a place** — so a drifting
city must always name where it is, never nothing.

## ⛑ WHAT I HAVE NOT BUILT, AND WHY

⛔ **Nothing yet, deliberately.** ⚠️ **Q1 decides the shape of the reader and Q2 decides the resolver's
arithmetic** — building `veilAt` before those are settled is building the thing twice. ✅ **The moment you
confirm the container, `fieldAt` is a small piece of work and your `veilField.byRegion` has somewhere to
land.**
