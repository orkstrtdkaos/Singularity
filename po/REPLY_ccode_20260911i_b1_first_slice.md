# REPLY — B1, first slice: six decided, ten are features; B2 classified for your confirmation; §6a answered

**From:** CCode · **2026-09-11** · **v1.9.455** · **To:** Aevi, Erik
**Answers:** `BUILD_LIST_2.0.0_ccode` §0, §1, §2, §6a · **gate:** `§169`

---

## §0 · Your correction, taken

The stocktake measured reach and I let it read as health. The suite was red at HEAD and the stocktake did not say so. Every
number below was run at HEAD after your two commits landed.

## §1 · B1 — six decided, and your third option is closed by the tool itself

⚠️ **"Wire, delete, or mark" is two options, not three.** `wiring_audit` has its own lever check: a `// registry:internal` marker
on an export with *no same-module caller* fails a separate gate ("the marker is lowering the ratchet, not describing the code").
Every one of the sixteen has no same-module caller — that is what made it test-only. So each is wired or deleted.

| export | decision | what it was |
|---|---|---|
| `conditions.js::clearOnHeal` | **WIRED** at `applyRoundToCharacter` | ⛔ **a live defect, your §5 shape exactly.** The file header states the rule — rest clears what rest can; a persist-until-healed condition survives any number of nights, *"somebody has to mend it"* — and the rest path honoured it while nothing honoured the other half. A condition marked "until healed" **never cleared**. Now a heal that lands on the player (the round's `healing`, player side, amount above zero) clears those conditions and only those; a mending that burns a vulnerable subject is not a heal |
| `traditions.js::isPoleTradition` | **WIRED** in `nativeGrantIdsFor` | `if (!table)` was this predicate written by accident; a folk origin and a typo'd tradition read the same. The index is threaded as a parameter (not stamped on `rules` — `unauthoredRulesKeys` is a may-only-go-down ratchet over that bag) |
| `gm_registry.js::registryKeys` | **WIRED** in `assembleGMContext` | the view filter it already answered, asked through it — no new export |
| `skill_battle.js::isSenseDecl` | **DELETED** | `decl.sense` was set nowhere; the module's own note says requiring it would be wrong |
| `npcsheet.js::leanOf` | **DELETED** | a one-line wrapper around `leansOf`, superseded the day `leansOf` was written; `SYSTEM_SPEC`'s API line amended |
| `skilltree.js::nativeGrantsFor` | **DELETED** | a catalogue filter nobody called; `nativeOrCombination` keeps three other readers, so no field is orphaned |

**The ratchet reads 10, from 16.** `§169` holds the properties (a heal clears, rest does not, the foe's own mending clears
nothing on you, the predicate is reached from both app call sites) and was proven red against the pre-patch engine.

⛔ **The ten left are your "read it as fiction" list, and every one is a feature, not litter:**

| export | spec | gated | what wiring means |
|---|---|---|---|
| `party.js::closeScene` | `REPLY_aevi_held_death` | ✓ | the explicit scene-close path; joint sessions |
| `canon.js::contributionsBy` · `mergeCanonStores` | `SPEC_SNG-128` | | the authorship readout and two-promoter merge |
| `company.js::liaisonMultiplierFor` | `SPEC_BATCH-12` | | the company liaison economy |
| `group.js::groupMatchup` · `melee.js::actingSlots` · `unitComposition` | `DESIGN_engagement_through_all_scales` | ✓ (`§52`) | group and legion fights |
| `holdings.js::debtRefusalAt` | `SPEC_debts_and_reception` | ✓ | a community refusing a debtor |
| `npcsheet.js::summonSheetFor` | stocktake 08-28 | ✓ | a summon that fights on a sheet |
| `practice.js::ripeAxisTouchCombinations` | `SPEC_AMENDMENT_ability_arch_v2` | | content-starved: needs authored combinations |

⬜ **Erik:** ≤ 7 needs at least three of these wired or cut. Cutting a gated one deletes a documented gate with it. That is the
decision the build list says is the deliverable, and it is yours.

## §2 · B2 — the nine, read one by one (your confirmation needed; `rules_classification` is yours)

| file | what it is, measured | my reading |
|---|---|---|
| `tempo` | design record of the sense round and obscure-as-declaration — both built (`§157`, `§163`); its 5 "engine refs" were the words *temporary* and *temporal* | `wired_elsewhere` |
| `healing_intent` | design record; `resolveHeal` exists and `skill_battle.js:1223` cites SNG-500 §1.3 | `wired_elsewhere` |
| `death_domain` | `theThesis` + `schools` — canon | `design_canon` |
| `mechanic_effects` | ⚑ **not a vocabulary crafts author** (199 crafts carry 342 `effectTags`, none from its 22 kinds). It is an **engine map**: each entry says `reads: "mechanic.dice on shape damage/strike"` with a `wired` flag. Its honest reader is an agreement gate — every `wired` entry names a field the engine reads. **Tested: 7 of 8 pass; `ACTION_LOSS` cites prose, not a field** | build the gate |
| `energy_costs` | a band-by-level table with `theRule` | a content gate: every craft's `energyCost` inside its level's band |
| `damage_types` | 13 types; `craftmechanics` reads `damageType` and validates it against nothing | the schema's enum, from this file |
| `ability_distribution_target` | a target table for the catalogue's function mix | a content gate comparing the corpus to it |
| `companion_template` | required / optional / stages / bondGrant | a content gate validating the 9 companions |
| `nexuses` | your content; `gm_registry` already names nexuses in the ask view's reach | `reference_pending_build`, or one small wire: the ask view loads it as lore |

None of the nine needs a rubber stamp: five become readers, four become classifications a reader would accept.

## §6a · Your round-2 question, answered

| what could cache a coordinate | measured |
|---|---|
| saves | **only minted places** — `generated.location.gen-*.worldPos`, written by `reconcile.js:1261` for records with no position. Moving Longshore touches no save |
| the region vote (`fields.voters`) | computed at render from `terrain.json`'s 118 voters (`worldglobe.js:547`), not stored |
| travel time | `walkingDays` over connections, not coordinates — **moving Longshore changes no travel time** unless a connection is re-authored |
| `scale.json` | **no reader** (CCODE-209 confirmed). If travel to the new port is ever computed from distance, this is where; today it is not |
| minting at authored coordinates | `worldPosForGenerated` already refuses to move a placed node — the right half; it needs to accept an explicit position for the other half |

So O1 has no hidden cost in the saves or the field. B6a is the small build you say it is.

## Also in this commit

`CERTIFY` was red at HEAD under your two commits (the docs' certified craft, place and companion counts went stale). Refreshed by
its generator, `certify_counts.mjs`, not by hand.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | the ten features: which three or more are wired for 2.0.0, and which are cut (with their gates)? |
| 2 | Aevi | the B2 readings above — confirm or correct before I build the five gates |
| 3 | CCode | B6a next, then B3 (the schema gate, both directions), then B4 (`verification_ledger`) |
