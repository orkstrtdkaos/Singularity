# BATCH-11 — CCode ROUND 2 substrate verification

| | |
|---|---|
| **Task** | ROUND 2 answers to `po/SPEC_BATCH-11_wiring_and_world.md` §8 |
| **Author** | CCode · 2026-07-18 |
| **Status** | `round_2_answered` — nothing built this pass; verification only |
| **Method** | Direct read at HEAD. Every claim below carries a `file:line`. Where the spec asserted and I measured a different value, the measurement is stated and the spec claim named. |

---

## Headline

**Three spec premises are false at HEAD, and one of them is load-bearing for a whole ticket.**

1. **§4/Q7 — `stateOps` is fully built, wired, and tested.** The "unbuilt" claim traces to a document superseded the same day it was written. SNG-150's question ("retire or build?") has no valid branch — the answer is *neither*.
2. **§6/Q3 — `arcSeed` cannot supply Coliseum contest categories.** It returns free-text bio prose, not labels. Routing SNG-149 through it would not make `personalArc` load-bearing; it would wrap a re-read of `character.domains`.
3. **§7/Q4 — `legends.js` is not orphaned.** It reaches the play-loop GM prompt directly. `LEGEND_BEATS` is a module-internal validation constant, correctly unexported-for-use.

**And one finding the spec did not have: `personalArc` is not merely "unreachable-unverified" (§146d) — it is broken at a specific line.** Details in Q3.

**146a is confirmed, and it is losing player data today.** I contest the sequencing on that basis — see Q8.

---

## Q1 — Registry feasibility (the load-bearing unknown)

### Verdict: **FEASIBLE WITH CAVEATS.** The blocker you would expect does not exist.

**The counts in §0 are low.** There are **four** GM-context call sites, not three, and the assembly draws on ~24 engine builders plus 6 app-local helpers, not "12+".

| # | Site | app.js | Callee |
|---|---|---|---|
| A | `runGM` (play loop) | `2585`–`2625` | `gmTurn` → `engine/gm.js:366` |
| B | `onAsk` | `3460`–`3476` | `gmAsk` → `engine/gm.js:453` |
| C | quest guidance button | `4615`–`4624` | `gmAsk` |
| D | gambit-builder advise | `5290`–`5298` | `gmAsk` |

The spec's `3474` and `5297` are *interior* lines of sites B and D (the `abilityLawDetail` line in each), not the call heads. **Site C at 4615 is unlisted in the spec** — which is itself a small instance of the §1 thesis.

### Why it is feasible: prompt ordering is already centralized

The obvious fatal blocker for a registry would be "prompt string order matters and lives at the call sites." **It does not.** `engine/gm.js:176` destructures the whole ctx in one statement; `tierParts` pushes into `system / world / scene / state / player` in a **hardcoded order** at `gm.js:180-257`; `buildTiers` (`gm.js:263`) and `buildTurnContext` (`gm.js:289`) join. Key order in the call-site object literal is irrelevant. **A registry only has to produce a bag of keys.**

Two more properties help:
- **Falsy values are uniformly skipped** (`if (x) push(...)`, `gm.js:189-256`), so conditional inclusion collapses to "builder returns null." Only `location.name`/`.spectrum` (`gm.js:192`) and `character` (`gm.js:200, 205, 231`) are dereferenced unguarded.
- **`gmAsk` already filters** — `gm.js:460` forcibly overrides `{...ctx, resolution: null, playerInput: null}`. A registry may safely emit turn-only ephemera into an ask view.

### What actually needs handling

1. **Same key, different args across sites.** `recentTurns` is `slice(-6)` at A/B/D but `slice(-4)` at C (`4619`). `npcRegistryDetail` gets live `sceneNpcNames` at A/B/D but hardcoded `[]` at C (`4622`). `codexDetail` gets active-quest titles at A/B (`2601`, `3475`) but `[q.title]` at C (`4623`). **A view filter is not enough — entries need per-site overrides.**
2. **Heterogeneous builder signatures.** `f(character)`, `f(character, CONTENT.x)`, `f(character, {opts})`, `f(character, catalog, branchForks, rules)` (`abilitiesForGM`), zero-arg app-locals, and composed calls. A `{key, fn, argNames}` schema will not fit; entries must be `build(env)` closures over one env bag.
3. **Site A has impure entries.** `pendingWeave`/`pendingPressure`/`pendingSubstrateNote` are module-globals *consumed and cleared* at `2554-2561`; `character.regionsKnown` is mutated at `2582`; `autoVerifyLeg` fires at `2565`. Registry entries cannot be assumed pure, and site A's table must run exactly once per turn.
4. **Six pass-throughs are not builders at all** — `resolution`, `playerInput`, `exactWords`, `itemAdvance`, `opLossNote`, `travelDirective` originate in `runGM`'s params (`2551`, `2577-2578`). They belong in the env bag as identity entries.

### Shape I recommend

```js
GM_CONTEXT = [{ key, build(env), views: Set<"turn"|"ask"|"quest"|"gambit"> }]
assemble(view, env, overrides = {})
```

One table, four view filters, an env bag (`character, location, region, time, sceneState, sharedScene, CONTENT, resolution, playerInput, exactWords, itemAdvance, turnWindow, focusQuest`), and a per-call `overrides` map for site C's three divergences. **Ordering needs no expression in the table** — `tierParts` owns it.

**Scope note in your favor:** there is no character-creation GM-context site. `suggestBuild` (`gm.js:474`), `generateBio` (`gm.js:509`), and `parseIntent` (`gm.js:517`) take flat named params, not a ctx object. All four registry sites are inside the play loop and all four have a character and a location. The registry's boundary is clean.

---

## Q2 — `challengeTypes` / `challengeProfile`

### Verdict: **zero runtime consumers CONFIRMED.** Stronger than the spec claims.

The sole code reference in the entire repo is `tests/content_ci.mjs:97` — `const cts = (a.challengeTypes || []).map(String);` — gating one lint rule (if `cts` includes `FIGHT`, assert `notFor` doesn't forbid harm). **CI-only, never loaded by the game.**

**`challengeProfile` has zero references anywhere** — not in any `.js`, `.mjs`, `.html`, or schema. It is not even CI-validated. Prose mentions only.

**Prompt-leakage check — negative, which is the load-bearing part.** `abilitiesForGM` (`engine/progression.js:595-616`) hand-picks fields into markdown and never serializes the ability object: `name`, `owned.level`, `rank.name/forked`, energy cost, `rank.grants`, `rank.cannot`, `description`, `notFor`, `harmRung`. No `JSON.stringify` of an ability or catalog exists in `engine/*.js` or `app.js`. `toolkit.js` touches abilities only via `catalog[...].name`. **The fields never reach the model by any path.**

### Corrected counts

**44 distinct values, not 45.** 269 of 285 carry `challengeTypes`; 280 carry `challengeProfile`.

- **Uppercase canon (12 in use):** FIGHT 78, INVESTIGATE 63, SOCIAL 55, EXPLORE 47, SURVIVE 41, PUZZLE 30, STEALTH 22, CHASE 17, DUEL 13, CREATE 8, DEFEND 6, TRAVEL 2.
- **Lowercase shadow (30 values, ~270 instances):** social 28, tactical 24, craft 21, endurance 21, combat 19, intellectual 17, hardship 16, navigation 12, magical 12, stealth 10, leadership 10, defense 10, medical 9, survival 7, negotiation 6, exploration 6, logistics 5, psychological 5, repair 4, investigation 4, technical 3, infiltration 3, evasion 2, art 2, spiritual 2, healing 2, and physical/intimidation/logistical/legal/ranged/morale/travel at 1 each.

The lowercase set is largely near-duplicate of the canon (`social`/SOCIAL, `combat`+`tactical`/FIGHT, `investigation`/INVESTIGATE).

**Also found, not in the spec:** `challengeProfile` is not clean either — 12 uppercase canon keys **plus three lowercase strays**, `cognitive` 89 / `physical` 89 / `social` 89, which look like an older triad schema left on ~89 abilities.

### CCode's call on cost — **retire, with one caveat**

Wiring is not cheap. It is not "add a reader": it is collapse two vocabularies to one canon across 269 abilities, then define what `challengeProfile` *does* to resolution, then balance it. That is a design ticket with a content lane behind it, not a wiring ticket.

Retiring is a delete plus removing the `content_ci.mjs:97` lint rule — **but that lint rule is doing real work** (it catches FIGHT-tagged abilities whose `notFor` forbids harm, which is exactly the §4c failure class). If `challengeTypes` is deleted, that check must be rebuilt against `functions`/`harmRung` or 147c loses its automated guard.

**Recommendation: retire `challengeProfile` outright** (zero readers, zero validation, an abandoned triad schema — nothing depends on it). **Hold `challengeTypes` until 147c ships**, then retire it and re-home the lint rule. Design call remains PM's.

---

## Q3 — `personalArc`

### Verdict: display-only, and **broken at a specific line.**

**Exports (4, all pure):** `arcSeed` (`personalArc.js:11`), `buildPersonalArcPrompt` (`:30`), `sanitizePersonalArc` (`:40`), `fallbackPersonalArc` (`:64`). **`arcSeed` is never imported anywhere.**

Call sites — `app.js` only: `:29` (import), `:2120` (`finish()` seeds fallback), `:4892/:4894/:4896` (background enrich).

Readers of `character.personalArc`: `app.js:3226` (recurrence def catalog — only fires if the arc is *already active*), `app.js:4702` (quest-log UI), `app.js:4814` (chronicle UI), `app.js:5765` (play-screen hint badge), `engine/art.js:186` (portrait prompt, and only once taken).

### Does it reach the play-loop GM? **No, on zero turns.**

The only quest channel into `gmTurn` is `structuredQuestsDetail: structuredQuestsForGM(...)` (`app.js:2595`), and `engine/quests.js:397` filters to `character.quests` where `structured && status === "active"`. So the arc reaches the model **only after it becomes an active quest record.**

**It cannot become one.** The sole `startStructuredQuest` call site is `app.js:4719`, and its def lookup is:

```js
// app.js:4718
const def = (CONTENT.quests || []).find(d => (d.id||"").replace(...) === b.dataset.startquest || d.id === b.dataset.startquest);
```

`CONTENT.quests` is authored pack content. The generated `personalArc` is spliced into the *listing* arrays (`app.js:4702`, `:5765`) but **never into `CONTENT.quests`**. So clicking "Take it on" on a personal arc yields `def === undefined` → `startStructuredQuest` fails at `engine/quests.js:185` (`slugify(def.id)` on undefined).

**§146d should be upgraded from WARN/unverified to FAIL with a known line.** The listing/start asymmetry reads as an oversight — both listing sites use the identical spliced array; only the start site doesn't. The fix is small and belongs in 146, not in the Coliseum ticket.

### `arcSeed` as contest categories — **No.**

Exact return (`personalArc.js:14-24`) is a flat passthrough of free-text bio fields plus a boolean: `name, playerKey, motivation, story, hometown, livelihood, origin, primary/secondary/tertiary, thin`. `motivation` and `story` are unconstrained player prose of arbitrary length (`story` gates on `>40` chars). **Nothing in it is an enum, a label, or a short axis token.** Putting it on a 4×4 grid axis would put paragraphs on an axis.

The only enumerable fields it exposes are `primary/secondary/tertiary` — and those come from `character.domains`, which `arcSeed` merely copies. **`arcSeed` adds nothing over reading `character.domains` directly**, so §6's "which would also make §3's flagged-unreachable module load-bearing" does not hold.

**What can actually serve as grid axes (measured):**
- **`FUNCTION_FAMILIES` — `engine/functions.js:98` — `["HARM","RESTORE","PROTECT","KNOW","SHAPE","INFLUENCE","MOVE","SUSTAIN"]`.** Exactly 8 closed enum values, already glyphed/colored/shaped (`functions.js:101/103/106`). **This is the strongest 4×4 candidate**, and it is 8 values = two 4-slot axes with no invention required.
- **`character.domains.{primary,secondary,tertiary}`** over the 24-tradition ring, with `engine/traditions.js` geometry (`ringDistance:47`, `antipodeOf:59`, `neighborsOf:66`) — which would let the grid draw *opposed* axes per competitor. This preserves the PM's "categories are theirs, the intersection belongs to neither" intent better than `arcSeed` would, and it is enumerable.
- Bio prose (`origin`, `livelihood`, `hometown`) is usable as **LLM input to name a category**, never as the category itself.

---

## Q4 — `legends.js`

### Verdict: **fully wired and live. Not orphaned.**

Exports: `LEGEND_TIER_WEIGHT` (`:18`), `tierBirthWeight` (`:19`), `LEGEND_BEATS` (`:22`), `loadLegends` (`:29`), `tierForArc` (`:49`), `legendSurfacing` (`:71`), `legendDeploymentForGM` (`:104`).

It reaches the **play-loop GM prompt directly**: `app.js:2620` — `legendDetail: maybeLegendDetail()`. Chain: `state.js:7/:182` loads the roster and hydrates figures into `npcs` for SNG-019 name-resolution; `app.js:1329` `detectLegendBeat()`; `app.js:1342` `maybeLegendDetail()`.

**`LEGEND_BEATS` is orphaned neither dead nor pending — it is a module-internal validation constant**, referenced only by its own guard at `legends.js:72` (`!LEGEND_BEATS.includes(beatType)`). Nothing is missing. It is exported alongside sibling constants, which is what made it read as orphaned to an export sweep. **Flag for §23.3: the orphan-export sweep will produce this class of false positive, and the registry should have a way to mark an export as intentionally internal — otherwise the advisory list trains people to ignore it.**

### The real gap here (not in the spec)

**Two of the four beats are undeployable.** `detectLegendBeat()` (`app.js:1329`) can only ever return `doomed_rescue` (lethal encounter + health ≤35%) or `witness_power` (encounter type challenge/duel). `passing_advice` and `villain_escalation` have GM directives (`legends.js:109-110`), alignment sets (`:24`), and **authored anchors declaring them** — `Halvex Coil, the Rewriter` and `Overseer Grael`, both villains, in `content/packs/valley/lore/legends.json`. **Those two anchors can never deploy.** That is a detector gap in `app.js`, not a `legends.js` gap, and it is a small ticket.

### Is it the Epic Hero layer for SNG-150? **The roster yes, the surfacing no.**

`legendSurfacing` is a **rarity governor for cameos** — 6-world-day cooldown, 0.5 rarity roll, `tierForArc` power-gating, `presencePattern` matching. It returns `{deploy:false}` most of the time *by design* ("greatness stays rare", `legends.js:75`). A Council is the opposite concern: a **durable, addressable institution**. Do not express a Council through a cameo dice-roller.

**What is genuinely reusable:** the roster in `content/packs/valley/lore/legends.json` — 5 authored figures carrying `tier`, `alignment`, `role`, `homeLocation`, **`tradition`**, `spectrum`, `personality`, `signature`, `voiceHints`, `knowledge` — already hydrated into `CONTENT.npcs` as first-class resolvable NPCs (`state.js:183`). "One seat per tradition" maps onto `figure.tradition`; `LEGEND_TIER_WEIGHT` gives seniority ordering for free.

**Sizing caveat for the PO:** only 3 of the 5 figures are heroes, and the roster covers very few traditions. **A one-seat-per-tradition council is a substantial authoring lane regardless of what code it sits on** — that should be costed into SNG-150 before it is promoted.

---

## Q5 — `offerIntent` escrow

### Verdict: **the existing `offer*` dispatch does NOT generalize.** They are not escrow.

`offerPromotion` (`gm.js:70`) / `offerAcquisition` (`gm.js:71`) are whitelisted at `gm.js:327` (key survival only — there is no per-op schema). Handled in `applyTurn` at `app.js:2814-2818` / `2821-2827`: they set `character.pendingPromotion` / `pendingAcquisition` and append a narration aside. **Everything else in the turn commits immediately.** The player answers on the **Character screen** (`app.js:4245`, `:4251`), an arbitrary number of turns later, applied at `app.js:6177` / `:6201`.

**Nothing is held.** Reusing that shape for `offerIntent` yields a flag, not a gate.

### Can a player answer re-enter `applyTurn`? **No.**

`function applyTurn(turn, resolution, playerWords = null)` — **`app.js:2673`, plain synchronous, no `async`/`await` in its body.** Single call site `app.js:2635`. It runs top to bottom committing unlocks (`2782`), mastery (`2799`), offers (`2814`), abilities (`2833`), level-ups (`2841`), quests (`2852`), clock (`2857`), `moveTo` (`2861`), stateOps (`2889`), gambit (`2908`). **No continuation, no promise handle, no resume point.** Escrow needs its own path.

### But three suspend-and-resume patterns already exist, and they share one shape

None suspends a turn mid-flight. All let the turn **complete**, persist state on `character`, take over the render surface, and resume by calling `runGM` again with a **synthetic `playerInput`**.

1. **Skill battle — the strongest template.** Entry `app.js:3049-3061` (sets `character.activeEncounter`, runs one scene-setting GM beat, then `renderSkillBattle()` takes over the surface). Rounds resolve **purely engine-side** (`sbDeclare:5602`, `sbFlee:5617`), no GM call per round. **Crash-safe:** `app.js:2493` re-opens the panel on load — the suspension survives a reload. Resume: `sbEnd` (`app.js:5628`) clears state and calls `runGM({resolution:null, playerInput:"(The skill-battle … has resolved — outcome: …)"})`.
2. **`lethalOfferClamp` — the precedent that matters most for §2.** `engine/encounters.js:259-277`, invoked at **render time** in `renderPlay` (`app.js:5862`). It rewrites the GM's own choice list, de-trivializes lethal entries, and **appends a decline choice if missing** — a pure engine-side guarantee **the GM contract knows nothing about.** This is exactly the "engine adds the option, the model is never asked to" pattern `offerIntent` wants.
3. **`_pendingArrival` (SNG-122) — the closest to an inline card.** Set inside `applyTurn` at `app.js:2877-2886`, rendered as an inline banner + button at `app.js:5857-5861`, resumed by `arriveAtPending` (`app.js:3379-3385`).

### Recommended shape

Do not hold `applyTurn`. Instead:

1. **Contract:** declare `offerIntent` with the **gambitOps discipline, not the offerPromotion discipline** (`gm.js:73` is the model text — "DO NOT resolve the stated plan … the ENGINE runs it step by step"). **This matters concretely:** `applyTurn` commits `characterDeltas`/`npcUpdates`/deeds inline at `2833`/`2852`, so any effect the GM *also* emits escapes the escrow.
2. **Handler:** near `app.js:2814`, validate then set `character._pendingIntent = {options, context}` and save. Purely additive.
3. **UI:** inline choice card in `renderPlay` built from `_pendingIntent`, modeled on the `_pendingArrival` banner plus the `lethalOfferClamp` engine-authored-choice precedent. For a hard gate, suppress the normal choice list the way `renderSkillBattle` takes over the surface.
4. **Resume:** new async handler in the `sbEnd` / `arriveAtPending` mold — clear `_pendingIntent`, apply the chosen branch engine-side, then `runGM({resolution:null, playerInput:"(The character chose to …)"})`.

**Put `_pendingIntent` on `character`, not in a module-level variable.** `activeEncounter` survives reload; `pendingGambitProposal` (`app.js:197`) does not. The spec's lenient-default requirement makes reload-safety load-bearing — a closed tab must resolve to the gentle branch, not vanish.

---

## Q6 — `moveTo` departure gate

### Verdict: **a gate can fire with ZERO change to the always-emit contract.**

Contract at `engine/gm.js:79` ("never omit moveTo…", "narrating the journey without moveTo strands the player"), reinforced at `gm.js:86`, whitelisted `gm.js:327`, salvaged from truncated replies `gm.js:353-355`, force-injected per turn by `buildTravelDirective` (`app.js:3367-3375`, wired `2574-2577`/`2624`). Handler: `app.js:2861-2876`.

**Region boundaries are knowable at handler time, unambiguously:**
- Locations carry `regionId` first-class (`content/packs/valley/locations/bedrock.json:5`).
- Regions enumerated in `content/packs/core/rules/regions.json`.
- `applyTurn`'s own caller already reads it every turn (`app.js:2584`).
- Both spellings exist in the wild — `engine/worldmap.js:188` uses `l.regionId || l.region`; a gate must do the same.
- **Minted destinations are safe:** `mintTransitLocation` (`app.js:3398`) sets `regionId: here?.regionId || here?.region || null`, so a named-but-unrecorded place **inherits the origin's region** and an unresolvable `moveTo` can never spuriously read as a cross-region departure.

At `app.js:2866` the handler holds both sides (the mutation hasn't happened yet).

**Recommended shape: handler-side departure escrow, `_pendingArrival`-shaped.** The GM keeps being told "always emit `moveTo`"; the engine decides whether the move commits now or after a confirm. Same division of labor as `lethalOfferClamp`.

**Three hazards that must be handled — flagging because each is a silent break:**

1. **Clock ordering.** `advanceClock` fires at `app.js:2857`, *before* the `moveTo` block. A deferred departure has already spent the journey's hours. Either gate only the location mutation and let time stand, or capture `hours` into the escrow and defer that too.
2. **`_pendingArrival` collision.** `app.js:2877-2886` computes `arrived` from `character.currentLocationId === ti.destId`. A deferred departure makes that false, so the SNG-122 "→ Arrive" banner fires *simultaneously* with the confirm card — two competing affordances for one move. The escrow must short-circuit that block.
3. **Fail open on null.** Locations without `regionId` must be treated as "no gate," never as a boundary crossing.

---

## Q7 — `stateOps`

### Verdict: **BUILT, wired, tested, and actively extended. The spec premise is false.**

- **Implementation:** `engine/corrections.js:32` exports `applyStateOps(character, ops, ctx)` — a validated dispatch over **14 ops**: `correctField:41`, `correctDomain:52`, `removeEntity:64`, `unstickQuest:85`, `reanchorLocation:95`, `fixCodexFact:104`, `correctAbilityRank:115`, `correctBond:127`, `correctVital:144`, `correctAttribute:158`, `mergeEntity:171`, `correctNpcGender:187`, `refuse:199`.
- **Called in the turn path:** `app.js:2889-2894`, inside `applyTurn`, with results surfaced to the player via `describeCorrection` (`corrections.js:211`) and every change logged to `character.corrections` (`:24`, `:26`).
- **Consumed downstream:** `app.js:3309` counts `turn?.stateOps?.length` as an eventful turn in `maybeWorldPressure`.
- **Contract:** `gm.js:62` (reply shape) and `gm.js:78` (the "REPAIR TOOL, NOT A WISH TOOL" rule). **Note: `gm.js:327` is the `salvageOps` key list — malformed-JSON recovery, not the declaration.** The spec cites 327 as the declaration site.
- **Tests:** `tests/smoke.mjs:3150-3151`, `:3418`.

**Provenance of the false claim.** `po/results/20260712_SYSTEM-SPEC-v2-ROUND2.md:19` says "stateOps is unbuilt." It was built **the same day** by SNG-070 — `po/results/20260712_SNG-070.md:15` records "SYSTEM_SPEC §11 updated: stateOps, which my round-2 flagged as unbuilt, is now built." Extended twice since, by SNG-137 and SNG-143 (`correctNpcGender`).

**Action: fix SYSTEM_SPEC §22, not the code.** And note the shape — §22 preserved a superseded round-2 finding for six days and it propagated into a new spec. That is the same "partial surface treated as whole" failure §1 exists to stop, but occurring in the *documentation* layer rather than the code layer. **§23.3's "SYSTEM_SPEC count freshness" check should extend to status claims, not only counts.**

---

## Q8 — Sequencing

### I contest it, on one point.

**PO proposed:** §1 → 146a–c → 147 → 148 → 146e → 149 → 150.

**146a is confirmed and is silently losing player data in normal multiplayer use, every push.** §1 is architecture that prevents *future* accumulation; 146a is an active defect. The fix is small (`pushMergedFile` already exists and is already correct; the callbacks are already pure — see below), and it is independently testable. **Put 146a first.**

**Recommended:** **146a** → §1 → 146b–c → 147 → 148 → 146e → 149 → 150.

Everything else in the PO's order I agree with, and the reasoning in §9 holds. Two amendments inside it:

- **The `personalArc` start-path break (Q3) should be folded into 146** as 146f. It is a one-line-class fix at `app.js:4718`, it upgrades §146d from "unverified" to "fixed," and SNG-149 should not be the ticket that discovers it.
- **147a should not delete `challengeTypes` until 147c ships** — the `content_ci.mjs:97` lint rule is the only automated guard against exactly the 147c failure class.

---

## Corrections to §0 measurements

Re-measured independently. Method given for each so they are reproducible.

| Metric | Spec §0 | **Measured** | Note |
|---|---|---|---|
| Engine modules | 49 | **49** ✓ | `ls engine/*.js \| wc -l` |
| Abilities | 285 | **285** ✓ | in **18 files** — none is one-per-file; largest `reach_dark_light.json` (24) |
| Abilities missing `harmRung` | 140 / 285 | **140 / 285** ✓ | |
| Shared scene files | 17 | **17** ✓ | |
| Locations | 92 | **92** ✓ | matches `manifest.json` `provides.locations` |
| **Regions** | **25** | **24** ✗ | distinct `regionId` across location files. **SYSTEM_SPEC is right here and §0 is wrong** — `SYSTEM_SPEC.md:205` says "92 locations across 24 regions" correctly |
| **`challengeTypes` distinct values** | **45** | **44** ✗ | 12 uppercase + 30 lowercase + 2 |
| GM context call sites | 3 | **4** ✗ | site C at `app.js:4615` unlisted |
| Builders contributing | "12+" | **~24 engine + 6 app-local** | |

**SYSTEM_SPEC drift confirmed and it is worse than stated:** `SYSTEM_SPEC.md:7` certifies "38 engine modules · 92 locations / 24 regions · 137 abilities." Modules drifted by 11 (38→49); **abilities drifted by 148, more than 2×** (137→285). Repeated at `:46`, `:55`, `:173`. Locations/regions are still accurate. The header simultaneously asserts "*(All authoring-header counts confirmed correct.)*" — which is the claim to delete first.

Reproducible ability/harmRung count:

```bash
cd /c/Users/orkst/Desktop/Singularity && node -e '
const fs=require("fs"),p=require("path");
let files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())w(f);else if(e.name.endsWith(".json")&&p.basename(p.dirname(f))==="abilities")files.push(f);}})("content/packs");
let tot=0,noRung=0;
for(const f of files){const j=JSON.parse(fs.readFileSync(f,"utf8"));const arr=Array.isArray(j)?j:[j];tot+=arr.length;for(const a of arr)if(a.harmRung===undefined)noRung++;}
console.log(files.length,tot,noRung);'
```

---

## 146a — independent confirmation and fix assessment

### The defect: **CONFIRMED, exactly as described.**

`pushSceneWithMerge` — `engine/party.js:123-138`:
- **`:127`** `const remote = (await fetchRepoJSON(scenePath(sceneId))) || seedScene;` → read #1 at T0. **`fetchRepoJSON` (`sync.js:78`) returns only the parsed body — the sha is discarded** (`sync.js:79-83`). That is the root of it.
- **`:129`** `const next = mutate(remote);` → content computed from the T0 snapshot.
- **`:130`** `await pushOwnedFile(...)` → `sync.js:97` does read #2 at T1, and `sync.js:99` PUTs the **T0 content with the T1 sha**.

**The optimistic-concurrency token is re-acquired after the decision it is supposed to guard.**

Losing interleaving:
1. T0 — B reads scene at sha `S1`, beats `[a1]`.
2. T0.2 — B computes `[a1, bB]`.
3. T0.5 — A's PUT lands. Remote is sha `S2`, beats `[a1, bA]`.
4. T1 — B's `pushOwnedFile` reads sha **`S2`**.
5. T1.1 — `ghPut(..., S2)` → sha matches HEAD → **200**. Remote becomes `[a1, bB]`. **`bA` is gone, no error raised.**

Consequently the `409|422` catch inside `pushOwnedFile` (`sync.js:100-105`) never fires — **and it would be useless anyway, it re-PUTs the same stale `obj`** — the outer 3-attempt loop at `party.js:125` never fires, and `mergeBeat`'s `(by, at)` idempotency (`party.js:59`) is irrelevant because it was applied to the stale scene.

**The window is not narrow.** `fetchRepoJSON` and `ghGet` are two separate round-trips to `api.github.com` — T0→T1 is hundreds of ms, on every push.

`party.js:5-8` (module header) and `SYSTEM_SPEC.md:109` both assert the merge-retry behavior the code does not implement. `tests/smoke.mjs:630-631` tests `mergeBeat` purity in-memory only and never exercises the transport — **which is why this survived.** The acceptance test must be two live clients, per §3.

### The fix: `pushMergedFile` is correct, and **not** a drop-in

`sync.js:114-129` is genuinely right: `:116` `ghGet` is **inside** the attempt loop, `:118-120` parses `remote` from that same response, `:121` re-runs `mergeFn(remote)` on every attempt, `:124` PUTs with the sha of the very read the content came from. A concurrent write now *does* 409, and `:126` retries, re-merging onto the winner.

Five adaptations needed:

1. **Seed handling.** `mergeFn` gets `remote === null` when absent (`sync.js:117`), but `party.js:127` folds `seedScene` in first. Callback becomes `r => { const base = r || seedScene; return base ? mutate(base) : null; }` — `pushMergedFile` treats a null return as "nothing to write" (`sync.js:122`).
2. **Return value.** `pushSceneWithMerge` returns the merged scene (`party.js:132`) and callers use it (`app.js:1590`, `:1596`). `pushMergedFile` returns the **PUT response**. Capture the last merged value in a closure and return that.
3. **Error semantics.** `pushMergedFile` **throws** on exhaustion (`sync.js:126`); `pushSceneWithMerge` swallows into `_lastSceneError` and returns null (`party.js:134`). Keep the try/catch so `lastSceneError()` (`party.js:121`) and solo-play degradation survive.
4. **Import swap** at `party.js:10`.
5. **Callers need no changes** — all four mutates are already pure functions of the passed scene: `s => s` (`app.js:1590`), `s => addMember(s, character)` (`:1596`), `s => removeMember(s, character.id)` (`:1616`), `s => setEncounterState(mergeBeat(s, beat), character.id, encReceipt)` (`:1678`). The `beat` closed over at `:1678` is a local value, not remote state — re-merging it onto a fresh remote is exactly the intent, and `mergeBeat`'s idempotency then does real work.

**Residual caveat to state honestly:** `ghFetch` can reject with `GH_TIMEOUT` (`sync.js:27-28`) *after* the PUT applied server-side. On retry the merge re-reads and re-applies; idempotency makes that safe for beats, but **`setEncounterState` and `removeMember` remain last-writer-wins on their fields** regardless of this fix. Worth a line in §18.

### 146c — `listScenesAt`: **CONFIRMED**, with a failure mode the spec does not name

`engine/party.js:103-115` lists the whole directory (`ghList("world/scenes")`), filters by prefix, then `mine.slice(-5)`.

The spec names cost-scaling and silent drops. **The sharper failure:** `slice(-5)` is applied **before** the party-emptiness filter at `party.js:111`. So if a location has 8 scenes and the newest 5 are all abandoned (`party` empty), `listScenesAt` returns `[]` — **the player is told nothing is joinable while 3 live scenes exist.** No signal reaches the caller (`app.js:6103`).

Three more: `slice(-5)` assumes lexicographic order == recency (true today because ids are `${locationId}--${ISO stamp}` at `party.js:19`, but asserted nowhere); the GitHub contents API caps directory listings at 1000 entries, past which `ghList` silently truncates; and up to 5 **sequential** `fetchRepoJSON` round-trips run on the interactive join path (`party.js:110`).

The open-scene index proposed at spec `:172` addresses all of it. **Scene ids are append-only with no reaper** — every party ever formed leaves a permanent file, so 146b and 146c are the same clock running.

---

## Spec boundaries

- **Nothing was built this pass.** Verification only, per the ROUND 2 request.
- **`ALERT.md` untouched** — Aevi owns that ledger and the batch status header.
- **Two questions are PM/design calls I did not make:** 147a wire-vs-retire (I gave the cost analysis and a recommendation; the design call is PM's), and Law 16 ratification.
- **SYSTEM_SPEC not edited** — the drift is reported here; correcting a certification header is the PO's authoring lane, and §1 proposes a check that should land with it.

*— CCode, ROUND 2. Every claim above measured at HEAD this session with a file:line. Where I contradict the spec I have named the spec's line.*
