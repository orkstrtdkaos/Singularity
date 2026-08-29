# FIELD REFERENCE — what things ACTUALLY are, and who actually reads them

**The companion to `HOW_IT_WORKS.md`.** ⛔ **That file says what the game DOES. This one says what each
field IS, where it lives, who reads it, and what happens when it is absent.**

⛔ **ERIK, 2026-08-28: *"We are DONE with forgetting what things are meant to do and how they actually work
or not."*** ⚠️ **So every claim here was measured, and the measurement is re-runnable:**

```bash
node scripts/field_atlas.mjs          # the table in §2, regenerated
node scripts/field_atlas.mjs --md     # …as markdown, to paste back in
node scripts/safe_delete.mjs <field>  # triage one candidate before deleting it
```

**Last measured: 2026-08-28 · v1.9.255 · 378 crafts · 107 distinct authored fields.**

---

## 1 · HOW TO READ THIS, AND WHY A BUCKET IS NOT A VERDICT

| bucket | n | means |
|---|---|---|
| ✅ **READ** | **85** | a play-path file names it outside a comment |
| ⛔ **DARK** | **19** | **no literal reader anywhere** — see the four lies below |
| ⚠️ **CI-ONLY** | **4** | the only consumer is a test. **That is a real consumer for correctness and not one for play** |
| ⚠️ **COLLISION** | **1** | the name is live, but on a *different owner* |

### ⛔ THE FOUR WAYS "UNREAD" LIES — all four produced a false finding here inside one day

1. ⚠️ **NAME-COLLISION.** `operativeAxis` is a **craft field** and a **rules dial**. Two owners, one word.
   Matching the bare name reported the craft field as live on the strength of two reads of the dial.
   ✅ **Capture the receiver, not the name.**
2. ⚠️ **COMMENT-ONLY.** The name appears solely inside a comment — often the comment explaining its removal.
   ⛔ **A scanner that reads its own prose has fired three times in this project.**
3. ⚠️ **GENERIC ITERATION.** A field consumed by `Object.entries`/spread is **never named in source at
   all.** 67 play-path files iterate objects generically. ⛔ **DARK means "no literal reader", never "no
   reader."**
4. ⛔ **BROKEN READER.** A reader exists and looks at the **wrong copy**. `damage_families.json` measured
   unread and was **correct content with a reader pointed at an older file.** ⚠️ **The signal is identical
   to cruft. Only the diagnosis differs, and only a person can make it.**

### ⚠️ A SIXTH: A NAMED READER HIDES THE FIELD IT READS

**`persistUntilHealed` moved from READ to CI-ONLY on 2026-08-28 BECAUSE IT GOT BETTER.** `skill_battle`
used to inline `authoredBlock(decl, "persistUntilHealed", rank) === true` — the literal was visible, and
the check was **wrong** (all six crafts author an object, none authors `true`). Replacing it with
`persistsUntilHealed(decl, rank)` fixed the defect **and removed the literal**, so the atlas sees one
reader fewer while the field is read correctly for the first time.

⛔ **THE ATLAS COUNTS LITERAL MENTIONS. A WELL-NAMED READER IN ANOTHER MODULE IS INVISIBLE TO IT** — the
same blind spot as generic iteration, arriving from the opposite direction: not a field consumed without
being named, but a field named in only one place and consumed from many. ✅ **A bucket falling is not
always a regression. Check which way the code moved before believing the table.**

### ⛔ AND A FIFTH, LEARNED BUILDING THIS FILE: A QUESTION IS NOT A CONSUMER

**`safe_delete.mjs` carries a candidate list naming every field it asks about.** An unfiltered sweep counted
it as the reader of ten fields and promoted them from DARK to CI-ONLY. ⚠️ **The rule generalises: a
candidate list, a vocabulary table and a migration map all MENTION names without CONSUMING them.**
`field_atlas.mjs` keeps a `NOT_CONSUMERS` set for exactly this.

---

## 2 · ⛔ THE AXIS FAMILY — FOUR FIELDS, ONE WORD, AND THIS IS THE BIGGEST CONFUSION IN THE SCHEMA

**Four different things are called some form of "axis". They live in different places, use different
vocabularies, and only two are read.**

| field | where | n | vocabulary | read by |
|---|---|---|---|---|
| `tree[].gainAxes` | rank node | **970 nodes / 777 values** | ⛔ **the NINE** | ✅ `capabilities.js` — **for PRESENCE only** |
| `rankDeltas[].axis` | rank delta | **512** | ⚠️ **86 names — the engine-field ones now LAND via the adapter** | ⚠️ **`extend` reads it as `dimension`; the rest is prose** |
| `mechanic.axis` | craft mechanic | ⛔ **0** | the 19-name allow-list | ⚠️ `craftmechanics.js` — **a reader with no writer** |
| `operativeAxis` | craft root | **378** | 67 free-form names | ⛔ nothing — `cfg.operativeAxis` is a **different field** |

### What each one actually does

- ⛔ **`gainAxes` DECIDES WHICH RANKS APPEAR IN THE PLAYER'S CAPABILITY MENU.** The chain is
  `app.js → capabilityMenu → capabilitiesOf → tierDeclaresSomething → (rankNode.gainAxes||[]).length > 0`,
  and `capabilityMenu` then filters on that flag. ⚠️ **It is read for PRESENCE, never CONTENT** — nothing
  switches on *which* of the nine it is. **So the field is load-bearing and the 777 individual values are
  decorative.** ⛔ **Deleting the field silently collapses ranks out of the menu.**
- ⚠️ **`rankDeltas[].axis` has 512 authored values and IS NOW READ for `extend`** (CCODE-289 adapter). ⛔ **21 of 25 compound axes were split 2026-08-28 so each delta names ONE dimension — the engine extends one per delta, so a compound extended NOTHING.** The remainder is a rich narrative
  vocabulary — `scope` ×33, `perceptionDepth` ×22, `foresight`/`persistence`/`precision`/`autonomy` ×10
  each, plus a 42-name singleton tail. **`special` ×155 is a catch-all meaning "no axis".** 30 more are
  compound (`timeReach+travelSpeed`) and could never match a table anyway.
- ⛔ **`mechanic.axis` is the field the engine actually reads** — `craftmechanics.js:102` sets
  `authored = ability.mechanic`, then tests `authored.axis` against `cfg.operativeAxis.mechanical`, a
  19-name allow-list (`damage`, `healing`, `duration`, `range`, `soak`, …). ⚠️ **NOBODY HAS EVER AUTHORED
  IT.** The whole branch is dead machinery.
- ⚠️ **`operativeAxis` on a craft is unread**; `cfg.operativeAxis` is the rules dial holding that
  allow-list. **Same word, opposite ends of the same comparison.**

⛔ **THE NET SHAPE: authors write `axis` on rank deltas in one vocabulary; the engine looks for `axis` on
the mechanic in another; the two have never met.** ⚠️ **Neither side is broken. They are two ships
passing, and the 73%-miss-rate I first reported was an artefact of comparing one to the other's list.**

### ✅ THE `rankDeltas` BLOCK — DISCONNECTED UNTIL 2026-08-28, NOW WIRED (CCODE-289)

**Aevi found this and it was the largest disconnected system in the project.** ⚠️ **The engine and the
corpus disagreed about `rankDeltas`' LOCATION, its SHAPE, and — twice over — its FIELD NAMES.**

```
ENGINE READ    craftmechanics.js — authored?.rankDeltas?.[String(rank)]  where authored = ability.mechanic
               i.e.  mechanic: { rankDeltas: { "2": {kind, mult}, ... } }      <- rank-KEYED, NUMERIC
CONTENT WROTE  rankDeltas: [ {rank:2, kind:"extend", axis:"targets+duration",
                              delta:"prose", from:"r2 grants"} ]               <- ROOT, a LIST, PROSE
```

| | |
|---|---|
| crafts authoring `rankDeltas` at the **root, as a list** | **274** *(plus 10 with an empty array)* |
| crafts authoring **`mechanic.rankDeltas`** | ⛔ **0** |
| authored rank deltas | **512** — `add` 181 · `extend` 180 · `deepen` 129 · unkinded 22 |
| ⛔ read by the engine **before** | ⛔ **ZERO** — every ranked craft on one default, `deepen ×1.35^steps` |

⛔ **WHICH WAS PRECISELY THE COMPLAINT QUOTED INSIDE THAT FUNCTION'S OWN COMMENT** — Erik: *"I can't tell
how ranks differ."* **The fix written for that complaint was itself unreachable.**

#### ⛔ THREE MISMATCHES, AND FIXING ONLY THE FIRST WOULD HAVE LOOKED LIKE SUCCESS

1. **SHAPE** — root list vs rank-keyed map. The obvious one.
2. **FIELD NAME** *(Aevi)* — `extend` requires `rDelta.dimension`. ⚠️ **All 163 `extend` deltas carry
   `axis`; NOT ONE carries `dimension`.** Reshaping alone would have landed `deepen` and left a third of
   the corpus silently inert **with the gate green** — the `damage_families` failure again: correct
   content, correct reader, a field name between them that does not match.
3. ⛔ **MAGNITUDE** — and this one made things *worse*, not merely incomplete. **An authored delta carries
   no `mult`: 0 of 495.** The old line let an authored delta REPLACE the default outright, so connecting
   naively gave `deepen` a mult of `num(undefined, 1)` = **1.0** — **129 crafts scaling by NOTHING where
   they previously got 1.35^steps.** ✅ **AUTHORING OVERRULES THE *KIND*, NOT THE *AMOUNT*:** the author
   says what a rank does, the dial says how much, and an author who writes `mult` still wins.

#### ✅ AFTER — measured by `scripts/rankdelta_report.mjs`

```
BEFORE:  deepen 548          (everything, one default)
AFTER :  deepen 224 · extend 163 · add 161
         323 rank-resolutions changed kind · 223 unchanged
```

**`extend` now grows:** `targets` 62 · `duration` 35 · `scope` 35 · `range` 14 · `area` 5 · `uses` 2 ·
`soak`/`penetration`/`evasion` 1 each. **A compound axis (`targets+duration`) extends BOTH.**

⚠️ **AND 23 NARRATIVE AXES EXTEND NOTHING, BY DESIGN** — `reach`, `timeReach`, `persistence`, `foresight`,
`access`, `control`. ⛔ **They are prose and must stay prose: guessing a field for `persistence` would
invent a mechanic nobody authored** — the exact failure this adapter exists to undo. They are recorded as
`unmapped` so the next one is caught rather than going quiet.

#### ⛔ THE CONSEQUENCE THAT NEEDS ITS OWN RULING: `add` RANKS LOSE THEIR MAGNITUDE BUMP

**`add` has no engine branch — and per the cfg's own note that is correct: it means ADD A FUNCTION, a
grants-level change the tree already carries.** ⚠️ **But before the adapter those 161 resolutions were
taking the default `deepen`, so connecting them is a real nerf: 124 rank-resolutions keep a number that
was previously multiplied.**

```
harmonic_voice r3: duration stays 8  (was becoming 15)
sustained_chord r2: duration stays 54 (was becoming 73)
wake_the_line   r3: duration stays 27 (was becoming 49)
```

✅ **This follows from Erik's ruling** — a rank whose author said it grants a NEW THING should not also
silently grow the old one by 35%. ⛔ **But it is the single largest effect of the change, and if `add`
should keep the bump it needs an engine branch, which is a second ruling.**

---

## 3 · ⛔ RANK LADDERS — TWO AUTHORING SHAPES, AND A HARDCODED FIELD LIST FINDS NEITHER

**A rank ladder — a number that changes across ranks — is authored two different ways:**

```json
① an ARRAY on the craft's mechanic, position = rank
   "mechanic": { "resistDrop": [2, 3, 4] }              soul_stare

② a SCALAR repeated on each tree node
   "tree": [ { "rank": 1, "antisoakImposed": 3 },       grief_strike
             { "rank": 2, "antisoakImposed": 5 },
             { "rank": 3, "antisoakImposed": 8 } ]
```

⚠️ **My first scan hardcoded a field list and found ZERO ladders against a spec that said thirty.** ⛔ **The
list was wrong, not the spec. Discover the numerics; do not name them.**

### Every rank ladder in the game — the entire empirical basis for any curve

| craft | field | values | steps | ⛔ KIND |
|---|---|---|---|---|
| `soul_stare` | `resistDrop` | `[2,3,4]` | +50%, +33% | ✅ magnitude |
| `hastened_grey` | `antisoakImposed` | `[4,6,8]` | +50%, +33% | ✅ magnitude |
| `grief_strike` | `antisoakImposed` | `[3,5,8]` | +67%, +60% | ✅ magnitude |
| `the_attended_end` | `stage` | `[1,2,3]` | — | ⛔ **ORDINAL** |
| `ask_the_dead` | `reachesDepth` | `[0,1,2]` | — | ⛔ **ZERO-BASED INDEX** |

⛔ **FIVE LADDERS. TEN STEP COMPARISONS. SIX OF THEM MAGNITUDES.** ⚠️ **Two of the five are not magnitudes
at all, so a percentage curve applied to them is a CATEGORY ERROR, not a tuning miss** — `stage` is an
ordinal where "+100%" is meaningless, and `reachesDepth` starts at **0**, which a multiplicative curve
cannot express at any rate. **`reachesDepth` is `reachOf(rank)` from `death.js` and must never be computed
a second way.**

---

## 4 · ⛔ CONFIG OBJECTS — WHICH `cfg` GOES WHERE

**This is the mistake that nearly made me report *"the entire rank-reach cost mechanic is inert"* about a
system that works.** ⚠️ **A function takes `cfg`; which OBJECT you pass decides what it can see.**

| consumer | expects | lives in | passed by |
|---|---|---|---|
| `reachCost`, `capabilityMenu` | ⛔ **the ENERGY block** | `resolution.json → energy` | `app.js:12131` — `CONTENT.rules?.energy` |
| `mechanicFor`, `resolveImposition` | the craft-mechanics doc | `craft_mechanics.json` | resolution path |
| `wardAnswer`, `resolveComposite` | ⛔ **the FAMILY MAP** | `damage_families.json → families` | `rules.damageFamilies`, unwrapped by `familyMapOf` |

⛔ **`rankReachSurcharge: 3` is authored at `resolution.json → energy.rankReachSurcharge`, NOT in
`craft_mechanics.json`.** Hand `reachCost` the wrong object and the surcharge reads `undefined`, every rank
costs the same, and it looks exactly like a broken feature. ⚠️ **A harness that builds its own config tests
its own config. Take the object the caller takes.**

---

## 5 · ⛔ ENGINE CONTRACTS I GOT WRONG — the exact shapes

**Each of these cost a false finding. They are written down so nobody pays twice.**

| function | ⛔ the real contract | what I assumed |
|---|---|---|
| `chooseTarget(allies, opts)` | returns ⛔ **`{ target, policy, why }`** — the ally is under `.target` | returned the ally |
| …its `knowledge` | ⛔ from **`foeKnowledge(tier)`** → `{tier, canJudgeBodies, canReadRoles, fallback}` | a bare `{tier}` |
| …its `taunt` | ⛔ **`{ targetId }`** | `{ id }` |
| `TARGET_POLICIES.weakest` | sorts on ⛔ **`resistOf`** — the best of the four attributes | `health` |
| `TARGET_POLICIES.healer` | finds ⛔ **`contributions.includes("RESTORE")`** | `roles: ["healer"]` |
| `scoreThreat` | `threatDealt`×2 + MARTIAL 3 + HARM 1 + level/4 | — |
| `deathDepth(entity, currentDay, rules)` | ⛔ **POSITIONAL.** An options object makes `currentDay` an object, `rawDays` NaN, and depth silently **2** | `{ currentDay }` |
| `resolveImposition(craft, opts)` | returns `{ ok, condition, degradedTo, resisted, targets, threshold, why }` | — |
| `reachOf(rank, intensity)` | r1→0 · r2→1 · r3→2 · r4+→2 · surge +1 capped at 2 | — |

---

## 6 · ⛔ THE 19 DARK FIELDS — A DIAGNOSIS EACH, BECAUSE A COUNT IS NOT AN ANSWER

⚠️ **Aevi's rule, and it is the right one: *"unread" and "useless" are different measurements.*** ⛔ **Eight
of nine major ones have a LIVE ROOT CONCEPT — the system exists and the field is a near-miss on it.**

| field | n | ⛔ what it actually is | disposition |
|---|---|---|---|
| `traditionV2` | 21 | ⛔ **live migration state** for the parked 14-tradition merger; `traditions_v2.json` exists | ⛔ **DO NOT TOUCH** — the only per-craft record of that mapping |
| `sectFlavour` | 12 | per-sect narration for a shared craft | ⚠️ **real content, no surface** — a feature nobody built |
| `powerMix` | 8 | per-craft source blend | ⚠️ superseded by `power_sources.byTradition`? **unconfirmed** |
| `namedCurrent` | 7 | binds a craft to a named power current (`wild_current`) | ⚠️ currents exist in lore — investigate |
| `learnedAt` | 6 | ⛔ **ACCESS, as against `tradition` = LINEAGE** (§30.6) | ⚠️ a real distinction with no reader |
| `backlashRungNone` | 3 | *"the failure BREAKS THE NAME"* — a future consequence, not a wound | ⚠️ wire with `backlashRung` |
| `requiresPoles` | 3 | braid gating; free from `minted.from` | ⚠️ investigate |
| `companionStageName` | 3 | evolution-stage naming | ⚠️ SNG-005 bond stages |
| `resistDrop` | 1 | ⛔ needs the **negative of `resistBonus`**, which `intercept.js` already has ×6 | ✅ **wire it** |
| `wornBenefits` | 1 | needs the affinity path, which exists | ✅ **wire it** |
| `clearsConditions` | 1 | needs the condition-clear `last_lament` is the only user of | ✅ **wire it** |
| `reachesDepth` | 1 | ⛔ **`[0,1,2]` = `reachOf(rank)` exactly** — the death ladder | ✅ wire, never recompute |
| `emotions`, `carriesEmotion` | 1 ea | Pathos' five named emotions | ⚠️ Aevi's, authored this week |
| `timeReach` | 1 | ⛔ **`wayfinding`'s r1 number — "a clear trail UP TO A DAY OLD"** | ⛔ **NOT dead. See §7** |
| `companionTaught`, `theNames` | 1 ea | a boolean with a file of the same name; worldbuilding in a craft field | ⚠️ Erik's call |
| `penetrationNote`, `awaitingEngine` | 1 ea | notes wearing field names | ✅ prefix with `_` |

### ⛔ §7 — THE `timeReach` CASE, BECAUSE IT IS THE TEMPLATE FOR HOW A DELETION GOES WRONG

**A spec said: *"delete `mechanic.timeReach` (1 craft) — genuinely dead, replaced, mine."*** ⚠️ **The count
was right. The craft was not.** The one it described (`ask_the_dead`) was **already clean** — its own note
says so in the past tense. **The single remaining `mechanic.timeReach` belongs to `wayfinding`:**

```json
"mechanic": { "magnitude": 3, "duration": 1, "timeReach": 24,
              "note": "r1's own number: 'a clear trail UP TO A DAY OLD'" }
```

⛔ **That 24 is how old a trail wayfinding can read.** Inert today — `timeReach` is not in the allow-list —
but cited by its own note, extended by its `rankDeltas`, and named in its player-facing `plainly` line.

**The field's real footprint is 16 sites in FOUR ROLES**, only one of which is what the spec meant:

| role | n | deleting it would |
|---|---|---|
| `gainAxes` value | **0** | ✅ nothing — **and this is the one that would have been dangerous** |
| `mechanic.timeReach` | 1 | ⛔ remove `wayfinding`'s r1 definition |
| `operativeAxis` entries | 7 | ✅ safe — that field is unread |
| player-facing `plainly` prose | 3 | ⛔ leave prose describing a thing with no record |

⚠️ **THE LESSON: "the field is dead" and "this craft's copy of it is dead" are different claims.**

---

## 8 · ⛔ RULES FILES REGISTERED AND NEVER LOADED — ~140 KB DARK

**`CCODE-55` named twelve. ✅ `ability_rename_map` is now WIRED (CCODE-294) — it was not documentation, it was a live save-migration map, and 22 ability references across 7 real saves resolved only through it. ⚠️ THE REMAINING ELEVEN ARE MOSTLY AUTHORING AND GM DOCUMENTATION, not dark engine content — `energy_costs.byLevel` is a corpus census with "start at the level median" guidance for authors; `healing_intent.forCCode` is a spec whose ask (`mechanic.dice` must be read on a healing shape) is ALREADY SATISFIED by `resolveHeal`; `mechanic_effects` is consumed by `content_ci` CCODE-238. ⛔ THE GATE'S PREMISE IS WRONG FOR THAT CLASS, and the remedy it names — `rules_classification.json` — does not exist.**

| file | size | | file | size |
|---|---|---|---|---|
| ~~`ability_rename_map`~~ ✅ **WIRED** | 58.0 KB | | `mechanic_effects` | 16.5 KB |
| `tempo` | 15.1 KB | | `ability_distribution_target` | 8.3 KB |
| `the_veil` | 7.9 KB | | `power_cosmology` | 7.5 KB |
| ⛔ `damage_types` | 6.8 KB | | `healing_intent` | 4.9 KB |
| `nexuses` | 4.9 KB | | `death_domain` | 4.8 KB |
| `companion_template` | 4.1 KB | | `energy_costs` | 2.1 KB |

⛔ **`damage_types.json` sits in the same folder as the `damage_families.json` that IS loaded, on the same
subject.** ⚠️ **`tempo` is 15 KB, and the tradition checklist calls tempo *"the strongest axis"*.**

### ⛔ THE PATTERN THAT PRODUCES THIS — four doors, and passing three is not enough

**A piece of content must be AUTHORED → REGISTERED → LOADED → READ.** ⚠️ **Every one of these has failed
alone, and each failure looks like success from the door before it:**

- `damage_families.json` — authored ✓ registered ✓ loaded ✓ **read ✗** (the reader used an older copy)
- `earned_power_guidance` — registered ✓ **loaded ✗**
- `bestiary` — a `provides.*` key declared and unread
- `wardTypes` — authored on 48 crafts, documented at length, **read by nothing** until CCODE-281

⛔ **`state.js` has the fix idiom already: merge into the rules bag AT LOAD, with the comment *"a
loaded-but-unread value is the same bug one layer up."*** ✅ **The XP table and native-grant table do this.
The damage families did not, which is why they were dark.**

---

## 9 · THE MAP LAYER — what is wired and what is not

| file | authored | status |
|---|---|---|
| `region_maps.json` | 8 of 38 | ✅ wired — `app.js:8213` |
| `precursor_lines.json` | 2 blocks | ✅ wired — `networkPaths` |
| `areas.json` | 11 | ✅ wired — `app.js:8259` |
| `local_layouts.json` | **18 of 135** | ⛔ **only consumer is `content_ci.mjs`** |
| `scale.json` | 5 constants | ⛔ **zero consumers** |

- ⛔ **`interiorLayout` ([worldmap.js:169](engine/worldmap.js:169)) places children procedurally on rings** —
  even angular spacing, a second ring past eight. **It never opens `local_layouts.json`**, which holds
  measured river bearings, road mileages, relief and uphill direction.
- ⚠️ **`scale.json` is an unbuilt feature, not a wrong constant.** I checked for the hardcoded Earth radius
  its own note warns about — **it is not there**, and neither is any scale bar, mile or km string anywhere
  in the UI. `walkingDays` runs on canon `300/π` and agrees with the file. **The player has never been shown
  a distance in any unit.**
- ⛔ **`SNG-404` blocks wiring the layouts:** 16 disagreements, **13 of them river DISTANCE on a smooth
  1%→32% gradient**, 3 bearings at 15°, 45° and 150°. ⚠️ **No single convention explains those three, so it
  is derivation fidelity and not a sign flip** — my first read said "inverted" and was wrong. **The open
  question is which side is authoritative**, and `millbrook._measured` notes its roads were already
  *"re-derived after the SNG-427 cluster move"*, so the authored data has gone stale once before.

---

## 10 · MECHANICS THAT ARE AUTHORED AND INERT

- ✅ **`mechanic.soak` — FIXED 2026-08-28 (CCODE-290).** Erik ruled that a guard **absorbs**, so `soak` was
  the right word and needed a CONSUMER, not a rename. A landed guard now stands as a typed soak LAYER on
  its raiser — `death_ward`'s 5 answers decay/vitality/cold and nothing else. ⚠️ **Kept here as a worked
  example**: the consumer (`soakLayers`) had existed since CCODE-83 and what was missing was a WRITER, which
  is a different diagnosis from "unread" and needed a person to make it.
- ⛔ **`minHit` — SET TO 0 (Erik, 2026-08-28).** *"I don't like the 1 minimum."* A blow whose every part is
  answered now lands NOTHING, so the ward ladder's `immunity` rung finally means immunity. ⚠️ **The dial
  does TWO jobs** — it also floors the ROLLED magnitude at `skill_battle.js:1052/1058`. At 0 that second
  floor is inert rather than wrong (dice minimums exceed it), but it is one name over two meanings and
  belongs on the collision list, not forgotten.
- ⛔ **`persuade` and `bolster` are unmechanised verbs** — crafts describe what the engine cannot do.
  ⚠️ **`bolster` is ALSO a shape in `familyDefaults`**, which is why a regex for the word reported the gap
  closed. **The word appearing proves nothing.**
- **Shapes with no family defaults:** `price`, `unsettle`, `cool`.

---

### ⛔ RULE 4 — IF THE VALUE IS A NOUN, THE FIELD NAME MUST NOT READ AS A QUESTION

**Aevi's half of the `persistUntilHealed` finding, and it is the fixable half.**

⛔ **`persistUntilHealed` reads BOOLEAN and holds `{condition: "bleeding"}`.** She authored the object
deliberately — *bleeding* and *enfeeblement* are different things to be carrying — and I wrote
`=== true` against it, because **the name answers "does it?" while the value answers "what?".**

⚠️ **THAT IS THE THIRD TIME THIS SHAPE HAS BITTEN**, after `isProjectCraft` vs `projectTicks: "r3"` and
`operativeAxis`. Her diagnosis of her own side: *"I keep AUTHORING RICHER THAN THE FIELD NAME SUGGESTS."*

✅ **THE RULE: a field whose name reads as a yes/no question may only hold a boolean.** If it needs to
carry WHAT, name it for the noun — `persistsAs` rather than `persistUntilHealed`, and the comparison that
went wrong would never have been written.

⚠️ **NOT renaming `persistUntilHealed` now** — six crafts author it and it has live readers. **Recorded so
the next field of this shape gets the right name at authoring time**, which is the only cheap moment.

## 11 · THE DEFECT TAXONOMY — the classes this project keeps producing

⚠️ **Named so they can be recognised on sight rather than rediscovered.**

| class | shape | seen |
|---|---|---|
| ⛔ **Built, tested, unreachable** | a module with gates and no call site | `melee.js`, the `allies` seat, `deathdepth.js` |
| ⛔ **Authored and unread** | content passing three of four doors | `wardTypes`, `damage_families`, 12 rules files |
| ⛔ **Reader with no writer** | engine reads a key no pack provides | `mechanic.axis`, `rules.arcResponse`, three phantom `rules.X` |
| ⛔ **A stored copy of a derived value** | the same fact in two places, drifting | foothill rows once in `byTradition` |
| ⛔ **A vacuous gate** | a check that cannot fail | `/rules?.damageFamiliess*\|\|/` — empty alternation matches anything |
| ⛔ **A closed loop** | fixture, assertion and engine share an invented vocabulary | `braids.js` HARM_ORDER; the five SNG-193b gates |
| ⛔ **A scanner reading its own prose** | the tool names what it measures | 3× — the last one in `safe_delete.mjs` itself |
| ⛔ **A suite that exits early** | pass count drops, failure count does not move | 4× — **the tell is always the PASS COUNT** |
| ⛔ **A formatter travelling with a content edit** | 2 lines become 8,000 | `json.dumps(indent=2)` on `reach_death_life.json` |
| ⛔ **A name with two owners** | one word, two fields | `operativeAxis`; `blind` (policy vs receipt) |
| ⛔ **A logged change never made** | the record says corrected, the text is unchanged | §8 blind/taunt |

### ⛔ THE COUNTERMEASURES, WHICH ARE NOW RULES

1. **Non-vacuity floors on every derived check** — an empty set passes everything.
2. **Reader before field** — build the consumer, default the dial to a no-op, let content turn it on.
3. **Check the pass count, not the failure count.**
4. **A wiring gate, not a module gate** — both halves can be individually green while the live path uses
   neither.
5. **Prove a new gate can go RED** by breaking the thing it guards.
6. **Grep for prior art before building** — `deathdepth.js` duplicated `death.js` for want of one grep.
7. ⛔ **A defect-reporting tool has a self-test, and it runs first.** *(`HOW_IT_WORKS.md` §11)*
8. ⛔ **A regex asks whether a word appears; the question is whether a number changes anything.**

---

## 12 · WHERE THINGS LIVE

| thing | path |
|---|---|
| crafts | `content/packs/core/abilities/*.json` — `{ abilities: [...] }` |
| rules | `content/packs/core/rules/*.json`, registered in `manifest.json`, loaded in `state.js` |
| world / maps | `content/packs/core/world/` |
| companions | ⚠️ **`content/packs/valley/companions/`** — *not* under `core` |
| encounters | `content/packs/core/encounters/` |
| the executable spec | `docs/HOW_IT_WORKS.md` + `tests/how_it_works.mjs` |
| this file's data | `scripts/field_atlas.mjs` |
| safe-delete triage | `scripts/safe_delete.mjs` |

---

## 13 · THE FULL ATLAS

⛔ **Generated. Re-run `node scripts/field_atlas.mjs --md` and paste; do not hand-edit.**

<!-- ATLAS:BEGIN -->
| field | n | authored at | bucket | read by |
|---|---|---|---|---|
| `rank` | 1571 | `tree`×1059 `rankDeltas`×512 | ✅ READ | `braids.js`, `capabilities.js`, `coliseum.js` |
| `name` | 1437 | `root`×378 `tree`×1059 | ✅ READ | `affiliation.js`, `arceffects.js`, `art.js` |
| `functions` | 1437 | `root`×378 `tree`×1059 | ✅ READ | `braids.js`, `coliseum.js`, `craftmechanics.js` |
| `harmRung` | 1339 | `root`×353 `tree`×986 | ✅ READ | `braids.js`, `gm_registry.js`, `intent.js` |
| `grants` | 1059 | `tree`×1059 | ✅ READ | `braids.js`, `capabilities.js`, `earnedpower.js` |
| `cannot` | 1059 | `tree`×1059 | ✅ READ | `authormode.js`, `braids.js`, `capabilities.js` |
| `gains` | 1029 | `tree`×1029 | ✅ READ | `encounters.js`, `gm.js`, `roundreceipt.js` |
| `gainAxes` | 970 | `tree`×970 | ✅ READ | `capabilities.js` |
| `axis` | 512 | `rankDeltas`×512 | ✅ READ | `coliseum.js`, `craftmechanics.js`, `gm.js` |
| `delta` | 512 | `rankDeltas`×512 | ✅ READ | `arceffects.js`, `companions.js`, `economy.js` |
| `from` | 512 | `rankDeltas`×512 | ✅ READ | `affiliation.js`, `art.js`, `assignments.js` |
| `kind` | 490 | `rankDeltas`×490 | ✅ READ | `arceffects.js`, `art.js`, `authormode.js` |
| `id` | 378 | `root`×378 | ✅ READ | `affinities.js`, `arceffects.js`, `art.js` |
| `axes` | 378 | `root`×378 | ✅ READ | `affinities.js`, `craftmechanics.js`, `encounters.js` |
| `attribute` | 378 | `root`×378 | ✅ READ | `affinities.js`, `braids.js`, `corrections.js` |
| `narrationHints` | 378 | `root`×378 | ✅ READ | `battleprompt.js`, `braids.js`, `companions.js` |
| `description` | 378 | `root`×378 | ✅ READ | `affiliation.js`, `art.js`, `authormode.js` |
| `notFor` | 378 | `root`×378 | ✅ READ | `braids.js`, `entityDetail.js`, `generate.js` |
| `tradition` | 378 | `root`×378 | ✅ READ | `arceffects.js`, `art.js`, `braids.js` |
| `powerSystem` | 378 | `root`×378 | ✅ READ | `art.js`, `backfill.js`, `braids.js` |
| `operativeAxis` | 378 | `root`×378 | ⚠️ COLLISION | only as `cfg.operativeAxis` |
| `intensity` | 378 | `root`×378 | ✅ READ | `canon.js`, `craftmechanics.js`, `death.js` |
| `bounds` | 378 | `root`×378 | ✅ READ | `gm.js` |
| `plainly` | 378 | `root`×378 | ✅ READ | `gm.js`, `narration_voice.js`, `app.js` |
| `tree` | 378 | `root`×378 | ✅ READ | `backfill.js`, `braids.js`, `capabilities.js` |
| `mechanic` | 371 | `root`×371 | ✅ READ | `braids.js`, `capabilities.js`, `conditions.js` |
| `challengeTypes` | 363 | `root`×363 | ⚠️ CI-ONLY | _4 test/script only_ |
| `energyCost` | 360 | `root`×360 | ✅ READ | `braids.js`, `capabilities.js`, `functions.js` |
| `levelReq` | 353 | `root`×353 | ✅ READ | `backfill.js`, `braids.js`, `company.js` |
| `nativeOrCombination` | 353 | `root`×353 | ✅ READ | `braids.js`, `functions.js`, `practice.js` |
| `shape` | 353 | `root`×353 | ✅ READ | `battleprompt.js`, `company.js`, `craftmechanics.js` |
| `rankDeltas` | 284 | `root`×284 | ✅ READ | `craftmechanics.js` |
| `duration` | 279 | `mechanic`×279 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `npcsheet.js` |
| `magnitude` | 278 | `mechanic`×278 | ✅ READ | `capabilities.js`, `conditions.js`, `craftmechanics.js` |
| `note` | 198 | `mechanic`×198 | ✅ READ | `art.js`, `authormode.js`, `borncontract.js` |
| `effectTags` | 154 | `root`×154 | ✅ READ | `battleprompt.js`, `braids.js`, `martial.js` |
| `scope` | 135 | `mechanic`×135 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `app.js` |
| `targets` | 110 | `mechanic`×110 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `skill_battle.js` |
| `gated` | 108 | `root`×108 | ✅ READ | `borncontract.js`, `generate.js`, `gm_registry.js` |
| `dice` | 76 | `mechanic`×76 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `gm.js` |
| `range` | 76 | `mechanic`×76 | ✅ READ | `capabilities.js`, `craftmechanics.js` |
| `plus` | 72 | `mechanic`×72 | ✅ READ | `craftmechanics.js`, `damagetypes.js`, `gm.js` |
| `schemaVersion` | 63 | `root`×63 | ✅ READ | `canon.js`, `codex.js`, `encounterFrame.js` |
| `crit` | 57 | `mechanic`×57 | ✅ READ | `craftmechanics.js`, `encounters.js`, `npcsheet.js` |
| `wardTypes` | 48 | `mechanic`×48 | ✅ READ | `damagetypes.js`, `gm.js`, `skill_battle.js` |
| `marginFloorPer` | 45 | `mechanic`×45 | ✅ READ | `craftmechanics.js` |
| `damageType` | 39 | `mechanic`×39 | ✅ READ | `damagetypes.js`, `gm.js`, `skill_battle.js` |
| `soak` | 30 | `mechanic`×30 | ✅ READ | `craftmechanics.js`, `damagetypes.js`, `melee.js` |
| `soakRank` | 29 | `mechanic`×29 | ✅ READ | `skill_battle.js`, `app.js` |
| `sense` | 27 | `root`×27 | ✅ READ | `combatants.js`, `encounters.js`, `gambit.js` |
| `push` | 26 | `mechanic`×26 | ✅ READ | `affinities.js`, `arceffects.js`, `art.js` |
| `backlash` | 23 | `root`×23 | ✅ READ | `gm.js`, `intensity.js`, `app.js` |
| `conserveSuppresses` | 23 | `root`×23 | ✅ READ | `app.js` |
| `traditionV2` | 21 | `root`×21 | ⛔ DARK | — |
| `imposes` | 21 | `tree`×21 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `skill_battle.js` |
| `backlashRung` | 20 | `root`×20 | ⚠️ CI-ONLY | _1 test/script only_ |
| `upkeep` | 18 | `root`×18 | ⚠️ CI-ONLY | _1 test/script only_ |
| `schoolAffinity` | 18 | `root`×18 | ✅ READ | `app.js` |
| `obscure` | 16 | `root`×16 | ✅ READ | `skill_battle.js` |
| `variance` | 15 | `mechanic`×15 | ✅ READ | `craftmechanics.js`, `app.js` |
| `area` | 14 | `mechanic`×14 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `gm.js` |
| `sectFlavour` | 12 | `root`×12 | ⛔ DARK | — |
| `ongoingHarm` | 11 | `tree`×11 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `skill_battle.js` |
| `powerMix` | 8 | `root`×8 | ⛔ DARK | — |
| `antisoakImposed` | 8 | `mechanic`×2 `tree`×6 | ✅ READ | `capabilities.js`, `skill_battle.js` |
| `namedCurrent` | 7 | `root`×7 | ⛔ DARK | — |
| `evasion` | 7 | `mechanic`×7 | ✅ READ | `craftmechanics.js`, `skill_battle.js`, `app.js` |
| `evasionRank` | 7 | `mechanic`×7 | ✅ READ | `skill_battle.js` |
| `learnedAt` | 6 | `root`×6 | ⛔ DARK | — |
| `peril` | 6 | `root`×6 | ✅ READ | `art.js`, `gm.js` |
| `persistUntilHealed` | 6 | `tree`×6 | ✅ READ | `capabilities.js`, `conditions.js`, `craftmechanics.js` |
| `wildVariance` | 5 | `root`×5 | ✅ READ | `resolve.js`, `app.js` |
| `damageMix` | 3 | `mechanic`×3 | ✅ READ | `damagetypes.js` |
| `stage` | 3 | `tree`×3 | ✅ READ | `arceffects.js`, `art.js`, `authormode.js` |
| `companionStageName` | 3 | `tree`×3 | ⛔ DARK | — |
| `read` | 3 | `root`×1 `tree`×2 | ✅ READ | `art.js`, `borncontract.js`, `generate.js` |
| `projectThreshold` | 3 | `root`×3 | ✅ READ | `projects.js` |
| `projectTicks` | 3 | `root`×3 | ✅ READ | `projects.js` |
| `requiresPoles` | 3 | `mechanic`×3 | ⛔ DARK | — |
| `backlashRungNone` | 3 | `root`×3 | ⛔ DARK | — |
| `interceptCondition` | 3 | `tree`×3 | ✅ READ | `intercept.js` |
| `interceptDamage` | 3 | `tree`×3 | ✅ READ | `intercept.js` |
| `opensAccess` | 2 | `tree`×2 | ✅ READ | `progression.js` |
| `downtime` | 2 | `root`×2 | ⚠️ CI-ONLY | _1 test/script only_ |
| `summon` | 2 | `root`×2 | ✅ READ | `gm.js`, `npcsheet.js`, `roundreceipt.js` |
| `pierce` | 2 | `tree`×1 `mechanic`×1 | ✅ READ | `capabilities.js`, `skill_battle.js` |
| `innatePrecursor` | 2 | `root`×2 | ✅ READ | `progression.js`, `app.js` |
| `taughtBy` | 1 | `root`×1 | ✅ READ | `companions.js`, `gm.js`, `progression.js` |
| `companionTaught` | 1 | `root`×1 | ⛔ DARK | — |
| `progression` | 1 | `root`×1 | ✅ READ | `authormode.js`, `backfill.js`, `braids.js` |
| `companionId` | 1 | `root`×1 | ✅ READ | `companions.js`, `evolution.js`, `app.js` |
| `resistDrop` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `theNames` | 1 | `root`×1 | ⛔ DARK | — |
| `penetration` | 1 | `mechanic`×1 | ✅ READ | `capabilities.js`, `craftmechanics.js`, `skill_battle.js` |
| `penetrationNote` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `uses` | 1 | `mechanic`×1 | ✅ READ | `backfill.js`, `corrections.js`, `craftmechanics.js` |
| `type` | 1 | `mechanic`×1 | ✅ READ | `borncontract.js`, `canon.js`, `chronicle.js` |
| `status` | 1 | `root`×1 | ✅ READ | `assignments.js`, `authormode.js`, `backfill.js` |
| `trails` | 1 | `mechanic`×1 | ✅ READ | `gm.js` |
| `awaitingEngine` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `wornBenefits` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `questions` | 1 | `mechanic`×1 | ✅ READ | `app.js` |
| `reachesDepth` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `accord` | 1 | `root`×1 | ✅ READ | `progression.js`, `state.js`, `app.js` |
| `emotions` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `carriesEmotion` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `clearsConditions` | 1 | `mechanic`×1 | ⛔ DARK | — |
| `reflectCondition` | 1 | `tree`×1 | ✅ READ | `intercept.js` |
| `timeReach` | 1 | `mechanic`×1 | ⛔ DARK | — |
<!-- ATLAS:END -->

---

## ⚠️ `arc.scale` — A LADDER WITH NO ENGINE CONSUMER, ON PURPOSE

**Authored 2026-08-29. The schema's ladder is `local · regional · continental · world · cosmic`.**
⛔ **NO ENGINE CODE BRANCHES ON IT.** Grepped: not one comparison against `"cosmic"` or `"continental"`
anywhere in `engine/` or `app.js`. It reaches the model as prose in the arc payload and nowhere else.

⚠️ **THIS IS RECORDED SO NOBODY LATER ASSUMES IT RANKS ANYTHING.** It is authoring discipline and prompt
context — which is a real job — but a reader looking for *"the cosmic arc outweighs the regional one"*
will not find that rule, because it does not exist yet.

✅ **AND TWO THINGS THAT LOOK LIKE ITS CONSUMERS ARE NOT.** Both were checked before this was written:

- **`wake.js` `WAKE_GEN_SCALES` (`world` · `tradition` · `regional`) does NOT drop cosmic arcs.** A wake's
  scale comes from `quest.tier`, falling back to `"world"` whenever an arc effect applied — **never from
  `arc.scale`**. ⚠️ I was one step from reporting that a cosmic arc's wake could never fire.
- **`pickExamples()`'s `.slice(0, 2)` is not a delivery cap.** It selects two *few-shot examples* of what
  an arc looks like. `arceffects.js` iterates all twelve, unsliced.

⛔ **BOTH ARE THE SAME LESSON: a name that looks like a consumer is not a consumer.** The sixth way
"unread" lies, and the reason a finding is not a finding until the reader has actually been read.

## ⛔ A SEVENTH WAY "UNREAD" LIES — AND ITS MIRROR

**Added 2026-08-29 (Aevi).**

⚠️ **The six ways above all describe a field that is AUTHORED and not read. There is a mirror failure and it
is worse, because no audit of the content can see it:**

⛔ **A READER THAT EXISTS FOR A FIELD NOTHING CAN AUTHOR.**

| field | reader shipped | schema told | result |
|---|---|---|---|
| `mechanic.damageMix` | CCODE-281 | ⛔ **never** | the first craft to use it was REJECTED |
| `tree[].interceptDamage` | CCODE-260 | ⛔ **never** | `intercept.js` sat dark for months |

**Both readers carried a note saying *"build the reader, default the dial to a no-op, LET CONTENT TURN IT
ON."*** ⚠️ **Content could not.** ⛔ **A closed schema turns an undeclared field into a validation error, so
the author gets a rejection rather than a feature.**

✅ **THE TEST: for every engine reader that names an authored field, does `ability.schema.json` declare it?**
⚠️ **This is checkable and nothing checks it.**
