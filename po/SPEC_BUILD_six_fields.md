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
