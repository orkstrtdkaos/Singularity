# SYSTEM AUDIT — full-engine pass (Erik-requested)

**CCode · 2026-07-25 · v1.8.268 (`71f4e0a1`).** *Erik: "look at all of the engines, schemas, objects… read the system spec… make sure everything built is actually working and wired as intended… identify modules that are easier to understand + cascading-impact needs."*

## Method

All 6 individual gates run green (`smoke`, `wiring_audit`, `content_ci`, `skill_battle_sim`, `balance_sim`, `parse_probe`) — the machine-verified wiring contract (§23) is intact. Then **7 parallel judgment agents** read all 67 engine modules by subsystem, hunting the class of defect the gates miss (unread writes, producer/consumer seams, silent drops, dead paths). Every finding below was re-verified in code before landing here.

## Verdict

**Fundamentally healthy.** No data-loss or crash defects in live play. The findings are: **2 HIGH** (both now fixed), a **stale legibility layer** that had turned the full `npm test` red (fixed), and a **punch-list of MED/LOW** — mostly *write-never-read* stores and *paper-pass/live-fail* seams that don't crash but silently do nothing. Two items are tuning calls that are yours.

## FIXED this pass

- **HIGH — native grants ate the breadth cap** (`skilltree.js breadthUsed`). By-right anchors (`native:true`) counted as chosen breadth (the flag was written, read nowhere), so a ≥3-anchor tradition (harmonic/radiant_folk 5, churnfolk/mason 3) sat `atCapacity` at level 1 (cap 2) and **could learn no new craft until level 5**. → CCODE-22, excluded `native`.
- **HIGH — started bound/personal arcs lost their legend directive** (`quests.js structuredQuestRecord`). The whitelist record dropped `boundToCharacter/boundToPlayer/legendNpc`, so `structuredQuestsForGM`'s SNG-132/133 "a distant force turning toward you" framing was dead for every started legend-bearing arc. → CCODE-22, carry the fields.
- **Legibility (npm test was RED)** — `engine_map --check` failed: ENGINE_MAP.md stale (64 vs 67 modules; `wake.js` "unstated"), and `death.js`/`encounterFrame.js`/`feed.js` undocumented. → authored the 3, regenerated (67/67), added 3 SYSTEM_SPEC rows. `npm test` now exits 0.
- Marked `newEncounter stashes but never activates` **resolved** in §22 (it was CCODE-19 this session).

## PUNCH-LIST — MED (verified real; recommend fixing; my read on each)

1. **NPC-identity slug seam** (`quests.js:327,403` vs `npcs.js:96`) — quest-effect NPC stubs key the registry by raw underscore id (`keeper_ilma`, deliberately "content ids, never slugify"); meets key by `slugify`→hyphen (`keeper-ilma`); `findExistingNpc` can't bridge `_`↔`-`. **Verified live in Silas's save** (a stranded `keeper_ilma` beside a hyphenated roster). Same person forks into two entries; the ally/questState marker strands on the orphan and can double-render. Also `reconcileGeneratedNpcWithMeet` looks up by raw `u.npcId` while the store used `slugify(u.npcId)`. *Fix:* one normalization at all three write sites, or teach `findExistingNpc` to treat `_`≡`-`. (My CCODE-20 area — recommend I take it.)
2. **`reconcile()` advances `reconcileVersion` past a THROWING step** (`reconcile.js:744,757`) — a caught+`continue`d step still bumps the version, so an owed migration never retries and its grant is lost permanently + silently (the warning is console-only). Blast radius: the whole save-migration spine. *Fix:* stamp only the highest *successfully-applied* version.
3. **`character.locationState` is write-only** (`corrections.js:319` + `quests.js` `location_state` effect) — a GM/Repair-panel location correction pushes to `applied`, logs "the name was set right," and **nothing reads it** — the map/prompt keep the old name forever. *Fix:* a reader on the place card/GM context, or route location corrections through the real place fields. (Design-ish — worth deciding with Aevi.)
4. **`gm.js` degraded path discards salvaged ops** (`gm.js:487`) — on two consecutive malformed replies, if the salvaged narration is ≤80 chars the branch drops the already-recovered `moveTo`/`characterDeltas`; and the op-loss note doesn't name those two. Needs a double-hiccup, so MED. *Fix:* spread `salvagedOps` into the prose fallback + name vitals/moveTo in the restate note.
5. **`recordAspirationProgress` reads `action.abilityId`, the caller never sets it** (`practice.js:57` ← `app.js:4487`) — so a solo same-tradition cast never feeds an aspiration; only the effect-tag branch can. *Fix:* pass `abilityId` (or read `abilityIds`) on the action.
6. **`synthesizeDuelDef` drops `tier`/`minDanger`** (`random_encounters.js:207`) — so the SNG-230 collapse/finisher is judged by *location danger*, not *creature tier*: a riffraff pest at a danger-4 frontier reads "too great to end in one stroke," and Aevi's tier-keyed `collapseEligibility` applies to no random duel. *Fix:* carry `entry.tier`+`entry.minDanger` through. (My SNG-230 area — recommend I take it.)
7. **`standingLedger` written, never read in production** (`standing.js:64`) — the receipts explaining *why* a people's regard moved accumulate (24-cap) on live saves and are shown to no one (only a smoke test reads them), contradicting the module's own "standing that moves without a reason is standing they won't trust." *Fix:* surface on the standing panel, or remove. (Design call.)

## PUNCH-LIST — LOW (smells / dead surface; cheap to clean)

- Dead exports/imports: `names.js NAME_KINDS`, `braids.js` unused `discoveryKey` import (also creates a phantom ENGINE_MAP edge), `claude.js chronicle-compress` routing entry, `practice.js ripeAxisTouchCombinations` + the `combinationsAvailableFor` call that omits `thresholdMet` (→ `combosFor` always `[]`, so authored `combination` abilities never surface via teachers).
- Doc drift: `art.js:8` says default "static" but `getArtMode` returns "generate" (images on by default); several stale module-header self-descriptions (`reputation.js "(v0.3)"`, etc.).
- Unregistered task ids in `MODEL_MAP` (`describe-build`, `suggest-next-crafts`, `gambit-extract`) → silently route to sonnet default; functionally fine, breaks the "single source of truth" contract + telemetry.
- `encounterFrame.js frameExits` computes `label`/`action`/`chainTo` the render ignores (buttons use hardcoded labels) — the descriptor's exit fields are inert. `standoff` frame kind is an unreachable scaffold (no `startEncounter` branch, 0 authored defs) — consistent with the module's stated phasing.
- `worldEvents` store: the text surfaces via `ctx.recordEvent`→facts, but the `delayDays`/`propagates` scheduling queue has no reader (delayed consequences never fire).
- `n.interiority` save-side read in `npcRegistryForGM` is a dead branch until §2c writes it (my forward hook — expected).

## TUNING / DESIGN — yours to call

- **Resolve ceiling swallows difficulty at the cap** (`resolve.js:38`) — mastery is uncapped and the clamp is 95, so a "very hard" (diff 30) roll stops biting once raw chance ≥ 125 (reachable at sub ~13). `balance_sim` is a *report, not a gate* and only samples attr 2–6, so it structurally can't see this. Known debt ("Erik's balance call pending"). Decide: cap the mastery term, or accept that a maxed character trivializes very-hard.
- **Skill-battle duels end in ~1–2 rounds** — `momentum.marginScale 0.5` vs `surgeCrushEndsIt 8` means most decisive rounds crush immediately. Config-tunable (`skill_battle_sim` exists to tune it); flag only if duels feel too short.

## LEGIBILITY — you already have the map you asked for

`ENGINE_MAP.md` (now refreshed, 67/67) gives every module: one-sentence **purpose**, **player-visible surface**, **what makes it fire**, and a **transitive blast-radius** ("read before changing: `namematch.js`→34 downstream, `traditions.js`→27, `wake.js`→24, `quests.js`→23…"). Plus a **"six lenses"** catalog of the exact defect shapes and where each is caught. It's the answer to "what does this do and what breaks if I change it." The one gap it flags itself: **19 GM ops are handled *inline in app.js*, reaching no engine module** — "engine logic in the view layer, where it becomes untestable" (a real, known architectural smell worth a future extraction).

*— CCode. The machine is sound; two real breaks are fixed; the rest is a legible punch-list. Awaiting your call on which MED items to take (I recommend #1 NPC-slug and #6 duel-tier as mine; #3/#7 want a design decision).*
