# REACHABILITY AUDIT — SNG-165

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Scope** | 553 exports across 53 engine modules, measured at HEAD |
| **Generator** | `scripts/reachability_audit.mjs` (persistent, re-runnable — `--json` for the full table) |
| **Deliverable** | This report. **Nothing was fixed as part of it**, per §5. |

---

## §1 · Headline

**The eight-capability pattern is real, but it is smaller than it looks and it is already closing.**
Two of the spec's own seeds are now stale in the good direction, and the largest remaining finding is
a content-shape bug rather than a wiring gap.

| Finding | Verdict |
|---|---|
| **10 encounter seeds are silently dead** — bare strings where the loader expects `{encounterId, hint}` | **Live defect, PO lane** |
| `skill_battle` — the spec's flagship CONTENT-STARVED example | **Now LIVE** — 15 reachable duels |
| `startEncounter` / `challenge` / `puzzle` | **Now LIVE** — 19 seeds resolve |
| 9 exports genuinely reachable only from a test | **Small, mostly benign** — table in §4 |
| 6 contract keys absent from `salvageOps` | **Real, engine lane** |
| §23 freshness gate covering only modules + abilities | **Already closed** (CCODE-09, this session) |

**A correction to my own first pass, kept because it is the point of the audit.** I initially reported
`locations offering encounterIds: 0` and nearly filed the whole encounter corpus as starved. The field
is `encounterSeeds`, not `encounterIds` — 14 locations carry 29 of them. A reachability audit that
greps the wrong field name produces exactly the false confidence it exists to prevent, so the
generator now reads the field the code actually branches on.

---

## §2 · Content census (the column a dead-code scan misses)

| Content | Count at HEAD |
|---|---|
| encounter definitions | 19 |
| …with an `opponent` (feeds `skill_battle`) | **15** |
| …type `duel` / `challenge` / `puzzle` | 15 / 2 / 2 |
| locations carrying `encounterSeeds` | 14 |
| encounter seeds **resolving to a real def** | **19** |
| encounter seeds resolving to **`undefined`** | **10** ⚠ |
| locations / waygates | 95 / 26 |
| structured quests with `stages[]` | **2** |
| quests with branched `outcomes[]` | 2 |
| authored NPCs / items | 43 / 4 |
| abilities / with `tree[]` | 285 / 285 |

---

## §3 · The live defect: 10 dead encounter seeds

`listAvailableEncounters` (`app.js:1612`) is the *only* thing that tells the GM an encounter exists.
It reads `loc.encounterSeeds` and does `CONTENT.encounters?.[seed.encounterId]`. A seed authored as a
**bare string** yields `seed.encounterId === undefined`, the lookup misses, and `.filter(Boolean)`
drops it — **silently**. No warning, no CI failure; the encounter simply never offers.

| Location | Dead seeds | Shape found |
|---|---|---|
| `old_switchback` | 5 | `"re_rockfall_hazard"` |
| `the_gralloch` | 4 | `"re_raider_duel"` |
| `the_redline` | 1 | `"re_raider_duel"` |

Expected shape: `{ "encounterId": "re_rockfall_hazard", "hint": "…" }`. The `hint` is not decorative —
it is what the GM is given to decide whether the moment fits, so a string-only seed could not carry
one anyway.

**Cost to fix: trivial** (10 records, mechanical). **Lane: PO** — it is content shape. **Worth a CI
check either way**, because this class fails silently by construction; see §6.

---

## §4 · Exports reachable only from a test (9)

Test-only means *passes CI while unreachable in play* — the mechanism behind the original eight.
The honest count is **9**, not the ~85 a naive scan reports: an export used inside its own module by
a reachable caller is LIVE and merely exported so a test can see it. That distinction is most of the
value here.

| Export | Verdict | Note |
|---|---|---|
| `worldmap.js :: regionTierNodes` | **DEFECT — mine** | See §5 |
| `party.js :: closeScene` | `DEFERRED` | CCODE-03 closes scenes via `removeMember`; this is the explicit-close path, unused until 146e joint sessions |
| `canon.js :: contributionsBy` | `DEFERRED` | Per-contributor tally for the authorship readout; the UI reads `authorshipStats` instead |
| `canon.js :: mergeCanonStores` | `DEFERRED` | Concurrency safety net for two simultaneous promoters — correct to have, rare to hit |
| `gm_registry.js :: registryKeys` | `LIVE (audit)` | Consumed by `tests/wiring_audit.mjs`, which is a build gate, not a unit test |
| `skilltree.js :: nativeGrantsFor` | `DEAD?` | `progression.js` has its own `nativeGrantIdsFor`; likely a superseded twin — **PO/CCode call** |
| `skilltree.js :: combinationsAvailableFor` | `CONTENT-STARVED` | Needs authored combination recipes reachable at the character's tier |
| `practice.js :: ripeAxisTouchCombinations` | `CONTENT-STARVED` | Same dependency |
| `company.js :: liaisonMultiplierFor` | `DEFERRED` | Company/faction liaison economy not yet surfaced |

**No runtime caller at all (2):** `canon.js :: canonRecords` (flagged before; still the one true
orphan) and `generate.js :: ESTABLISH_AT` — a threshold constant I exported alongside `NOMINATE_AT`
in CCODE-05 and never used. Both are `DEAD`; both are two-line deletions.

---

## §5 · The finding I did not enjoy

**`worldmap.js :: regionTierNodes` is test-only — and I wrote it ninety minutes ago.**

I built it for the region tier, gave it eight passing tests, then wrote the filter *inline* in
`renderMap` instead of calling it:

```js
const locs = Object.values(CONTENT.locations).filter(l => (l.regionId || l.region) === focusRegion);
```

So the tested function is unreachable and the shipped path is an untested duplicate that silently
drops the region-boundary edge-filtering the real function does. Same shape as the SNG-148 GM-offer
link: I wrote the piece, tested it, and never connected it. **This audit caught its author inside the
same session, which is the strongest argument for making it a standing gate rather than a one-off.**

Not fixed here, per §5 of the spec. It is a one-line call site and should be its own small ticket.

---

## §6 · Answering §6 — and the guard I recommend

> *If a capability is CONTENT-STARVED but the content is expensive to author, say so.*

Only two rows are genuinely content-starved and both need the **same** thing: authored combination
recipes reachable at a character's tier. That is one authoring pass, not two, and it is not
expensive — the schema exists and `SYSTEM_SPEC` already records 44 combinations. The gap is
reachability at tier, not volume.

> *Mark built-ahead-of-dependency as DEFERRED, not DEAD.*

Done — four rows. `closeScene` in particular is correct code waiting on 146e, and deleting it would
be a mistake.

**Recommended gate (converts this audit into a standing check):**

1. **Every `encounterSeeds` entry resolves to a real encounter def.** This is the §3 defect and it is
   pure mechanism — it would have failed the build the moment those ten strings landed. Cheapest,
   highest value.
2. **Every documented top-level contract key appears in `salvageOps`.** Currently **6 real gaps**:
   `factUpdates`, `discovery`, `newEncounter`, `newAbility`, `gambitApt`, `sceneEnded`. (`narration`,
   `choices` and `sceneSummary` also differ but are handled by `salvageNarration`, not the op
   whitelist — not defects.) Also one reverse: `relationshipDeltas` is salvaged but undocumented,
   matching the known legacy-op debt in §22.
3. **A test-only ratchet**, in the shape of the existing `wiring_baseline.json`: the count of
   exports reachable only from tests may only decrease. That is what makes a ninth instance loud
   instead of discovered in play.

I have **not** built these — §5 says the report is the deliverable. All three are small and I would
take them as one ticket.

---

*— CCode. Generator is `scripts/reachability_audit.mjs`; re-run it rather than trusting this snapshot,
and note the field-name correction in §1 before extending it.*
