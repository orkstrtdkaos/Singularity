# ENGINE MAP

> **Generated** by `scripts/engine_map.mjs` — re-run it rather than editing this file.
> Mechanical columns are derived from the static import graph, which is complete: `app.js` contains **zero dynamic imports**.
> **`purpose` and `player-visible surface` are AUTHORED** in `scripts/engine_map.authored.json` and are never overwritten by a regeneration.

**54 modules · 23/54 described.** `player-visible surface: NONE` is the flag that matters — it is a different question from reachability, and it is how a capability gets built, tested, and never met.

**How each derived column is measured** — so the columns can be trusted or corrected rather than believed:

- **depends on / depended on by** — static `import` statements. Complete: `app.js` has zero dynamic imports.
- **reach** — transitive closure of *depended on by*. `app.js` counts once if reachable at all, directly or through a chain.
- **content it reads** — literal `*.json`/`*.md` paths, `CONTENT.*` keys, and content-schema fields harvested from the real location and NPC corpus. **Excluded:** field names that collide with JS members (`map`, `name`, `id`, …) and fields ≥9 modules read, which discriminate nothing. 32 fields qualify.
- **GM verbs** — from `applyTurn`'s dispatch in `app.js`, *not* from imports: each `turn.<verb>` handler block is walked and the verb attributed to whichever module owns the functions called inside it.

| module | purpose | player surface | exports | depends on | depended on by | reach | content it reads | GM verbs |
|---|---|---|---|---|---|---|---|---|
| `engine/namematch.js` | The one name-resolution primitive — slugify and fuzzy-match an entity the same way everywhere, so codex, quests and inventory can never disagree about what the GM just named. | Indirect but constant: every id the player sees, and the quest panel's "couldn't match" note when the GM names something that does not resolve. | 4 | — | `canon.js` `codex.js` `corrections.js` `encounters.js` `facts.js` `generate.js` `gm.js` `inventory.js` `npcs.js` `party.js` `places.js` `practice.js` `progression.js` `quests.js` `worldtick.js` `app.js` | **25** | — | — |
| `engine/quests.js` | Quests as typed state the GM drives through clamped ops — the model proposes, the engine adjudicates and refuses in the open. | The quest panel: active quests, stage progress lines (✦ …), the resolution choice when every stage is done, and refusal notes when the GM names the wrong stage. | 15 | `namematch.js` | `codex.js` `generate.js` `gm_registry.js` `npcs.js` `progression.js` `reconcile.js` `app.js` | **19** | `.arcId` `.boundToCharacter` | `questUpdates` `stageOps` |
| `engine/playerprofile.js` | Player identity across characters, and the earned play-style (tendencies, aptitudes) that accrues on each character from how it is actually played. | The profile screen's play-style readout, and the character-select roster. | 19 | — | `art.js` `canon.js` `app.js` | **15** | — | — |
| `engine/art.js` | Images for characters, locations, items, NPCs and big moments, from either a static file or a generated prompt, behind one seam. | Every image in the app: location art, portraits, item art, the moment gallery. | 20 | `playerprofile.js` | `corrections.js` `npcs.js` `app.js` | **13** | `.descriptionSeed` `.encounterFlavor` `.voiceHints` `.arcId` | `imagePrompt` |
| `engine/traditions.js` | The Great Circle geometry — the 24-station ring, neighbours, antipodes and distances — read from content, never hardcoded. | The skill wheel's ring layout and the tradition labels shown on abilities and standing. | 14 | — | `functions.js` `progression.js` `reconcile.js` `standing.js` `state.js` `app.js` | **13** | — | — |
| `engine/npcs.js` | NPC permanence — everyone met, authored or invented mid-scene, gets a durable registry entry the GM writes to through clamped npcUpdates. | The people list and each NPC's detail card: who they are, where you met, what has passed between you. | 17 | `art.js` `namematch.js` `quests.js` | `companions.js` `company.js` `corrections.js` `entityDetail.js` `gm_registry.js` `worldtick.js` `app.js` | **12** | `.communityId` `.homeLocation` `.pronouns` `.relationships` | `npcUpdates` `relationshipDeltas` |
| `engine/reputation.js` | Deeds are the source of truth and reputation is a VIEW over them — a community's opinion is the sum of the deeds it knows about. | The standing list on the character screen (band per people). Empty for most players today — the gap BATCH-12 §3 exists to close. | 5 | — | `gm.js` `progression.js` `standing.js` `app.js` | **11** | `.communityId` | `deeds` |
| `engine/skilltree.js` | Skill legibility and gating: tiers, attribute gates, and what is learnable now versus later. | The skill wheel and skill graph — tier rings, locked/unlocked state, and the reason a locked ability is locked. | 22 | — | `intensity.js` `progression.js` `app.js` | **9** | — | — |
| `engine/company.js` | The unified company: companion, trainer, liaison, partner and ally are stacking ROLES a person in your party holds, each wired to the system that already implements it. | The company panel — who travels with you and what each one is to you. | 11 | `npcs.js` | `progression.js` `app.js` | **8** | `.teaches` `.liaisonFor` | — |
| `engine/progression.js` | Character growth with numbers you can point at — sub-attributes, levelling, ability acquisition and the receipts for each. | Level-up prompts, the attribute allocation screen, new-ability offers, and the ✦ receipt lines when something is earned. | 34 | `company.js` `namematch.js` `quests.js` `reputation.js` `skilltree.js` `traditions.js` | `backfill.js` `corrections.js` `gm.js` `gm_registry.js` `practice.js` `app.js` | **7** | — | `markDefiningMoment` `newAbility` `offerPromotion` |
| `engine/genschema.js` | *— unstated —* | *—* | 3 | — | `generate.js` | **6** | — | — |
| `engine/resolve.js` | *— unstated —* | *—* | 4 | — | `gambit.js` `sense.js` `skill_battle.js` `app.js` | **6** | — | — |
| `engine/claude.js` | Anthropic API transport, with MODEL_MAP as the single source of truth for task→model routing and a token/stop_reason log per call. | NONE directly — but every latency the player feels and every API error card comes from here. | 5 | — | `gambit.js` `gm.js` `worldtick.js` `app.js` | **5** | — | — |
| `engine/codex.js` | *— unstated —* | *—* | 15 | `namematch.js` `quests.js` | `gm_registry.js` `reconcile.js` `worldtick.js` `app.js` | **5** | — | `codexUpdates` |
| `engine/generate.js` | The ONE generative path — authors a new NPC, location or arc in-grain for its locale, validates against the derived schema, resolves before minting so it never duplicates, and persists it. | Any place or person that did not exist until the fiction needed it; the player meets these as ordinary world content. | 24 | `genschema.js` `namematch.js` `quests.js` | `canon.js` `chronicle.js` `gm_registry.js` `worldtick.js` `app.js` | **5** | `.regionId` `.communityId` `.connections` `.descriptionSeed` | — |
| `engine/inventory.js` | *— unstated —* | *—* | 17 | `namematch.js` | `entityDetail.js` `gm_registry.js` `reconcile.js` `app.js` | **5** | — | `itemUpdates` |
| `engine/personalArc.js` | *— unstated —* | *—* | 4 | — | `reconcile.js` `app.js` | **4** | — | — |
| `engine/practice.js` | Competency as the residue of attention — an engine-owned ledger of ability use and co-activation that unlocks ranks at zero skill-point cost. | Aspiration progress and the unlock notices when practice crosses a threshold. | 15 | `namematch.js` `progression.js` | `backfill.js` `evolution.js` `gm_registry.js` `app.js` | **4** | — | — |
| `engine/standing.js` | How a people regards you — seeded at creation from who you are, drifting with the company you keep, and moved by narrated acts the engine adjudicates rather than the model. | The standing list on the Chronicle (band per people and settlement), the ✦ receipt when a band changes, and the GM's own knowledge of your welcome. | 11 | `reputation.js` `traditions.js` | `gm_registry.js` `reconcile.js` `app.js` | **4** | `.teaches` `.liaisonFor` | — |
| `engine/sync.js` | *— unstated —* | *—* | 14 | — | `party.js` `worldtick.js` `app.js` | **4** | — | — |
| `engine/canon.js` | *— unstated —* | *—* | 17 | `generate.js` `namematch.js` `playerprofile.js` | `worldtick.js` | **3** | `.regionId` | — |
| `engine/companions.js` | *— unstated —* | *—* | 7 | `npcs.js` | `backfill.js` `gm_registry.js` `app.js` | **3** | `.voiceHints` `.knowledge` `.appearance` `.hooks` | — |
| `engine/functions.js` | *— unstated —* | *—* | 11 | `traditions.js` | `gm_registry.js` `toolkit.js` `app.js` | **3** | `function_vocabulary.json` | — |
| `engine/legends.js` | *— unstated —* | *—* | 7 | — | `state.js` `app.js` | **3** | — | — |
| `engine/reconcile.js` | *— unstated —* | *—* | 5 | `codex.js` `inventory.js` `personalArc.js` `quests.js` `standing.js` `traditions.js` | `state.js` `app.js` | **3** | `.connections` `.poleIntensity` | — |
| `engine/skill_battle.js` | *— unstated —* | *—* | 4 | `resolve.js` | `encounters.js` `app.js` | **3** | — | — |
| `engine/worldtime.js` | *— unstated —* | *—* | 14 | — | `gm_registry.js` `worldtick.js` `app.js` | **3** | — | `timeOps` |
| `engine/corrections.js` | *— unstated —* | *—* | 5 | `art.js` `namematch.js` `npcs.js` `progression.js` | `gm_registry.js` `app.js` | **2** | `.pronouns` | — |
| `engine/encounters.js` | *— unstated —* | *—* | 14 | `namematch.js` `skill_battle.js` | `gm_registry.js` `app.js` | **2** | — | `encounterOps` `newEncounter` |
| `engine/evolution.js` | *— unstated —* | *—* | 8 | `practice.js` | `gm_registry.js` `app.js` | **2** | — | — |
| `engine/facts.js` | *— unstated —* | *—* | 3 | `namematch.js` | `gm_registry.js` `app.js` | **2** | — | `factUpdates` |
| `engine/gm.js` | Assembles the GM prompt and parses the structured reply — code owns the rules and the dice, the model owns the words. | All narration and the choice buttons; also the salvage path that keeps prose on screen when the reply parses badly. | 17 | `claude.js` `namematch.js` `progression.js` `reputation.js` | `gm_registry.js` `app.js` | **2** | `.communityId` `.descriptionSeed` `.npcsPresent` `.encounterFlavor` | `scene` |
| `engine/narration_voice.js` | *— unstated —* | *—* | 6 | — | `gm_registry.js` `app.js` | **2** | — | — |
| `engine/party.js` | Shared-world play — scene publication, the open-scene index, and merge-safe writes so two players in one scene cannot clobber each other. | The party beat feed and the presence indicator when someone else is in your scene. | 16 | `namematch.js` `sync.js` | `gm_registry.js` `app.js` | **2** | `world/scenes/_open_index.json` | — |
| `engine/places.js` | Location permanence — durable changes, things left behind and discoveries that OUTLIVE the scene, fed back on every return visit. | The location panel's "what happened here" lines on returning somewhere you have been. | 5 | `namematch.js` | `gm_registry.js` `app.js` | **2** | `.want` | `placeUpdates` |
| `engine/sense.js` | *— unstated —* | *—* | 4 | `resolve.js` | `gambit.js` `app.js` | **2** | — | — |
| `engine/state.js` | Content-pack loading and save/load — localStorage is authoritative, GitHub sync is optional on top. | Boot ("Loading the Valley"), the save/load controls, and the recovery-slot list when a save fails to write. | 25 | `legends.js` `reconcile.js` `traditions.js` | `gm_registry.js` `app.js` | **2** | `content/packs/core/manifest.json` `content/packs/valley/manifest.json` `world/regions/valley.json` `content/packs/valley/lore/generative_substrate.json` | `moveTo` |
| `engine/toolkit.js` | *— unstated —* | *—* | 1 | `functions.js` | `gm_registry.js` `app.js` | **2** | `.knowledge` | — |
| `engine/waygate.js` | The waygate network and its hub at the Crossing, including routing a GM's moveTo to a real gate rather than letting it mint a destination. | The waygate travel control and the destination list when standing at a gate. | 9 | — | `gm_registry.js` `app.js` | **2** | `.waygate` `.waygateTier` `.waygateHub` | `moveTo` |
| `engine/worldtick.js` | *— unstated —* | *—* | 9 | `canon.js` `claude.js` `codex.js` `generate.js` `namematch.js` `npcs.js` `sync.js` `worldtime.js` | `gm_registry.js` `app.js` | **2** | `world/regions/valley.json` `.communityId` `.poleIntensity` `.wants` | — |
| `engine/affinities.js` | *— unstated —* | *—* | 5 | — | `app.js` | **1** | — | — |
| `engine/backfill.js` | *— unstated —* | *—* | 5 | `companions.js` `practice.js` `progression.js` | `app.js` | **1** | — | — |
| `engine/chronicle.js` | *— unstated —* | *—* | 10 | `generate.js` | `app.js` | **1** | — | — |
| `engine/entityDetail.js` | *— unstated —* | *—* | 4 | `inventory.js` `npcs.js` | `app.js` | **1** | — | — |
| `engine/gambit.js` | *— unstated —* | *—* | 6 | `claude.js` `resolve.js` `sense.js` | `app.js` | **1** | — | — |
| `engine/gm_registry.js` | The declared table of everything the GM can be told — one row per context block, iterated at every call site so a capability cannot be built and left unreachable. | NONE. It is the §23 wiring contract itself; the player meets it only as a GM that knows things. | 3 | `codex.js` `companions.js` `corrections.js` `encounters.js` `evolution.js` `facts.js` `functions.js` `generate.js` `gm.js` `inventory.js` `narration_voice.js` `npcs.js` `party.js` `places.js` `practice.js` `progression.js` `quests.js` `standing.js` `state.js` `toolkit.js` `waygate.js` `worldtick.js` `worldtime.js` | `app.js` | **1** | `CONTENT.region` `CONTENT.events` `CONTENT.lore` `CONTENT.rules` | — |
| `engine/intensity.js` | *— unstated —* | *—* | 10 | `skilltree.js` | `app.js` | **1** | — | — |
| `engine/intent.js` | Intent confirmation for costly acts — nothing irreversible or world-scale commits until the player confirms, the same shape character creation already uses. | The confirmation card before a harmful or departing act, naming the cost in plain language. | 7 | — | `app.js` | **1** | `.regionId` | `offerIntent` |
| `engine/pacing.js` | *— unstated —* | *—* | 4 | — | `app.js` | **1** | — | — |
| `engine/random_encounters.js` | *— unstated —* | *—* | 14 | — | `app.js` | **1** | `.regionId` `.communityId` `.dangerLevel` | — |
| `engine/recurrence.js` | *— unstated —* | *—* | 11 | — | `app.js` | **1** | `.arcId` `.challengers` | — |
| `engine/substrate.js` | The SECOND difficulty map — the nanite lattice varies in density by place and each tradition is tuned to a band of it, so where you stand changes what you can do. | The success-chance readout before acting (the penalty is folded in, per SNG-116) and the thin/crowded lattice note the GM works into prose. No named receipt of its own. | 7 | — | `app.js` | **1** | `.regionId` | — |
| `engine/vectors.js` | *— unstated —* | *—* | 4 | — | `app.js` | **1** | — | — |
| `engine/worldmap.js` | The data-driven map foundation: stable auto-positioning for every location including ones minted mid-play, plus the three zoom tiers. | The map screen and its World / Region / Location tier bar. | 13 | — | `app.js` | **1** | `.regionId` `.connections` `.poleIntensity` `.waygate` | — |

## GM verbs handled inside `app.js` itself

17 of the reply contract's ops never reach an engine module — `applyTurn` handles them inline. Some of those are correct (a narration flag has nowhere else to live); some are engine logic sitting in the view layer, which is where it gets hard to test.

`characterDeltas` · `discovery` · `gambitApt` · `gambitOps` · `generateRequest` · `ledgerEvents` · `markTeacher` · `momentArt` · `offerAcquisition` · `sceneEnded` · `standingOps` · `stateOps` · `timeAdvanceHours` · `unlockLivingCurrent` · `unlockPrecursor` · `unlockSubstrate` · `unlockWildCurrent`

## Blast radius — read this before changing a module

`reach` is the TRANSITIVE count: every module that can be affected by a change here, not just direct importers. A spec touching one of these should state the number before work starts.

- `engine/namematch.js` — **25** modules downstream
- `engine/quests.js` — **19** modules downstream, serves `questUpdates` `stageOps`
- `engine/playerprofile.js` — **15** modules downstream
- `engine/art.js` — **13** modules downstream, serves `imagePrompt`
- `engine/traditions.js` — **13** modules downstream
- `engine/npcs.js` — **12** modules downstream, serves `npcUpdates` `relationshipDeltas`
- `engine/reputation.js` — **11** modules downstream, serves `deeds`
- `engine/skilltree.js` — **9** modules downstream

