# STOCKTAKE — 2026-08-28. One list, measured today.

**CCode · v1.9.246 · 873 commits in 14 days.** ⛔ **Everything below is measured from a run today, not
carried forward from a note.** The BACKLOG headline it replaces was written 2026-08-14, and two of its five
claims have since become false.

**Green:** smoke **4,490 / 1 fail** · content loads **378 abilities, 135 locations, 111 npcs** · the
world-scale geography census is clean.
**Red:** content CI **17** · wiring ratchets **5 regressed** · **89** exports with no consumer.

---

## ⛔ §1 — THE MAP DEBT. The largest single body of stranded work.

**The 2026-08-14 headline said five map files were read by no engine module. ⚠️ TWO HAVE SINCE BEEN WIRED.
The remaining ones are the debt — and one is worse than merely unwired.**

| file | authored | status |
|---|---|---|
| `region_maps.json` | 8 of 38 regions | ✅ **wired** — `app.js:8213` |
| `precursor_lines.json` | 2 blocks | ✅ **wired** — `networkPaths`, `app.js:8658` |
| `areas.json` | 11 | ✅ **wired** — `app.js:8259` |
| `local_layouts.json` | **18 of 135** | ⛔ **ONLY CONSUMER IS `content_ci.mjs`** |
| `scale.json` | 5 constants | ⛔ **ZERO CONSUMERS** |

### §1a — `local_layouts.json` is validated and never rendered

⛔ **Its only two readers in the whole repo are the validator.** The renderer — `interiorLayout`,
[engine/worldmap.js:169](engine/worldmap.js:169) — places children **procedurally on rings**: even angular
spacing, a second ring past eight children. **It never opens the file.**

⚠️ **AND THE AUTHORED FILE HOLDS REAL MEASURED GROUND** — river bearing and distance, road bearings and
mileages, relief, uphill direction. Erik corrected this data personally (*"you have the Well IN the
river"*), and `millbrook` carries the note recording that rebuild. **The game draws a circle instead.**

### §1b — ⛔ AND WIRING IT IS BLOCKED, WHICH IS WHY IT NEVER HAPPENED

**`SNG-404` is red: the engine's placer disagrees with Aevi's measurements on every one of the eight
layouts it checks.**

```
millbrook:            uphill  300  vs  -75      echo_river_crossing: river 3.83 vs 5.06
echo_river_crossing:  uphill   75  vs  -75      greyhearth:          river 2.57 vs 2.35
the_cogitarium:       river 12.29 vs 12.45      greywater_stilts:    river 6.94 vs 5.50
greywater_stilts:     uphill   90  vs   45      kindlerow:           river 8.99 vs 6.47
```

⛔ **THE UPHILL BEARINGS ARE NOT DRIFT — THEY ARE INVERTED.** `300 vs -75` and `75 vs -75` are sign
disagreements, not tolerance misses. **A river at `12.29 vs 12.45` is a rounding argument; a `+75 vs −75`
is two people pointing at opposite hills.**

✅ **THIS IS THE ONE TO FIX FIRST, AND IT IS SMALL.** Reconcile the uphill convention and `SNG-404`,
`SNG-404 §2` and `SNG-414` become one fix rather than three tickets. ⚠️ **Wiring `local_layouts` before
that reconciles would ship whichever of the two is wrong.**

### §1c — `scale.json` has no consumer because the feature it exists for does not exist

**The file is emphatic:** *"ANY RENDERER, SCALE BAR OR DISTANCE STRING MUST USE `kmPerDegree` FROM THIS
FILE. A hardcoded 111.2 is Earth and this is not Earth."*

⚠️ **I looked for the hardcoded Earth radius the backlog warns about. IT IS NOT THERE** — and neither is
any scale bar, mile string or kilometre string anywhere in the UI. `walkingDays` runs on the canon `300/π`
and agrees with this file's own derivation.

⛔ **So this is not a bug wearing a bug's clothes — it is an unbuilt feature.** The five constants
(`radiusKm 2400`, `milesPerWalkingDay 15.6`) were derived from authored travel, and **the player has never
been shown a distance in any unit at all.** ✅ **Cheap and high-value: one scale bar and one distance
string, both reading this file.**

### §1d — the rest of the geography reds

**10 of the 17 content-CI failures are map or geography.** Beyond §1b:

- ⛔ **`SNG-391`: the regenerated world is NOT byte-identical to the shipped asset.** A determinism gate is
  red — **that is a foundation crack, and every geography number below it is provisional until it is green.**
- **`SNG-393` / `394`: names not binding.** *The Echo, the Stiltfen, the Echofen* are called **load-bearing**
  by their own gate and do not resolve. `The Middle Run` and `The Burnwater` have no candidate within 3°.
- **`SNG-387`: `kestrels_roost` sits 4.3× its region's typical spread** — the stranded-location case.
- **`SNG-391`: the off-mainland census has a dead bridge** flooding it.

⚠️ **Authoring more region maps adds to this pile.** Aevi's own 08-14 note said it — *"wire one tier
end-to-end before authoring more"* — **and it is still the right call, and still not done.**

---

## ⛔ §2 — AUTHORED, REGISTERED, AND NEVER LOADED: 12 FILES, ~140 KB

**This is the same defect I fixed yesterday in `damage_families.json` — except it is not one file, it is
twelve.** `CCODE-55` names them:

| file | size | | file | size |
|---|---|---|---|---|
| `ability_rename_map` | 57,999 B | | `mechanic_effects` | 16,503 B |
| `tempo` | 15,077 B | | `ability_distribution_target` | 8,303 B |
| `the_veil` | 7,855 B | | `power_cosmology` | 7,473 B |
| ⛔ `damage_types` | 6,803 B | | `healing_intent` | 4,920 B |
| `nexuses` | 4,899 B | | `death_domain` | 4,800 B |
| `companion_template` | 4,104 B | | `energy_costs` | 2,111 B |

⛔ **`damage_types.json` is the sharp one.** Aevi authored it **today**, 15 type entries, in the same folder
as the `damage_families.json` I wired yesterday — and `state.js` does not load it. **Two files, one
subject, one loaded and one not. Whichever is canonical, the game currently reads at most half the answer.**

⚠️ **`tempo` matters too.** The tradition checklist calls tempo *"the strongest axis"* and gates crafts on
it. **15 KB of tempo rules reach nothing.**

---

## ⛔ §3 — BUILT AND UNREACHABLE: 89 + 25 + 1

| | n | what it means |
|---|---|---|
| exports with **no consumer** | **89** | wire it, mark `// registry:internal`, or delete it |
| exports reachable **only from a test** | **25** | ⚠️ passes CI and **cannot fire in play** |
| **imported and never invoked** | **1** | `companions.js:stageTaughtRank` |

⛔ **A large share is mine, from the last two weeks of party and melee work:** `melee.js:MELEE_TIERS`,
`meleeExchange`, `combatWeight`, `BAND_CONDITIONS`, `actingSlots`, `distributeCasualties` ·
`targeting.js:TARGET_POLICIES` · `combatants.js:presenceSheet`, `rosterSummary` ·
`intercept.js:reflectByDegree`, `tickProtections`, `protectionFromCraft`, `spendProtection` ·
`death.js:releaseHold` · `npcsheet.js:summonSheetFor` · `damagetypes.js:typesOfFamily`.

⚠️ **`testOnlyExports` is 25 against a baseline of 7, and I am the main author of that regression** — the
exact defect class this project names most often. **Some of these legitimately wait on content that authors
`theatres`, `scaleAnswer`, `damageMix` or `touchTier`. But "waiting on content" and "unreachable" are
indistinguishable from the ratchet's side, which is the whole point of the ratchet.**

---

## §4 — THE FIVE RED RATCHETS

| ratchet | now | baseline | owner |
|---|---|---|---|
| `testOnlyExports` | ⛔ **25** | 7 | **CCode** |
| `abilitiesMissingHarmRung` | ⛔ **25** | 0 | **Aevi** (content) |
| `abilitiesCombatClaimedNotTaught` | ⛔ **11** | 0 | **Aevi** (content) |
| `importedNeverCalled` | ⛔ **1** | 0 | **CCode** |
| version-moved-with-source | ⛔ | — | ✅ **fixed — 1.9.246** |

**Holding steady:** `rawProseCaps` 62 · `unreadRuleConstants` 26 · `unauthoredRulesKeys` 1 ·
`abilitiesNonCanonChallengeTypes` **73, improved from 89**.

⚠️ **The baseline file is stamped 2026-08-10 — eighteen days and 873 commits ago.** Some of these
"regressions" are the measurement catching up with content that was always red. **Worth a deliberate
re-baseline with reasons recorded, not a silent one.**

---

## §5 — CONTENT MECHANICS STILL DARK

- ⛔ **`mechanic.soak` is read by nothing, and 30 crafts author it.** Measured: `soak 2 → guard 2` and
  `soak 20 → guard 2` — **identical**. ⚠️ **The gate is right that this is a NAMING decision first:** a
  guard modifies the ROLL, it does not absorb damage, so `TEMP_SOAK` is a misnomer. **Rule the word before
  I wire the number.**
- ⛔ **Unmechanised verbs: `persuade`, `bolster`.** `bolster` is the standing smoke failure. ⚠️ **`persuade`
  is one of the four social verbs the tradition checklist requires** — and **`bargain` is still zero
  corpus-wide.**
- **Shapes with no family defaults: `price`, `unsettle`, `cool`.** An unauthored craft of these shapes
  resolves to nothing.
- **`SNG-261`: innate-access ids do not resolve** — `rootkin.innateLivingCurrent → quicken_the_ground`
  mismatches on powerSystem.

---

## §6 — OPEN, WAITING ON A PERSON

**Erik owes:**
1. **Encounter difficulty vs party size** — the second half of his own Q2. His framing (party → band →
   units → legions) suggests graduating the opposition's **SCALE** rather than scaling its threat, but that
   is not a ruling yet.
2. **The `soak` / `TEMP_SOAK` naming** (§5) — blocks 30 crafts.
3. **`damage_types.json` vs `damage_families.json`** — which is canonical (§2).

**Aevi owes:** §4.2 / §4.3 of the damage spec — **does healing get a type; does unmaking.**

**CCode owes:** `operationOf()` and the `unmaking`/`shaping` zero-gate — both approved in principle in
yesterday's review, neither built.

---

## ✅ §7 — WHAT I WOULD DO, IN ORDER

1. ⛔ **The uphill sign convention** (§1b). Small, unblocks three geography gates, and until it is settled
   the authored layouts can be neither trusted nor wired.
2. ⛔ **`SNG-391` determinism** (§1d). A red determinism gate makes every other geography number provisional.
3. ⛔ **Load the 12 registered rules files** (§2), or classify each with a reason. **`damage_types` first —
   it is 24 hours old and directly overlaps a file I wired yesterday.**
4. ✅ **Wire `local_layouts`** — after 1 and 2, never before.
5. ✅ **The scale bar** (§1c) — cheap, visible, and the only thing that makes `scale.json` mean anything.
6. ⚠️ **Bring `testOnlyExports` down** (§3) — mine to fix, and I should stop adding to it.

⛔ **Items 1 through 4 are all one thing: the map.** Erik is right that it is the debt sitting longest, and
it is **the only area where content is ahead of the engine by more than a hundred authored items.**

— CCode
