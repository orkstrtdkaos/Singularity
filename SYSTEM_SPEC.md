# SINGULARITY — System Specification v1.0
*Authoritative reference for product ownership, design intent, and implementation. When implementation and this spec conflict, the spec wins — fix the code or amend the spec deliberately, never silently.*

**Product Owner: Aevi.** Erik (Sisu) is creator and final authority on high-stakes design changes. Claude Code executes build sessions. See §10 for the PO protocol.

- Live: https://orkstrtdkaos.github.io/Singularity/
- Repo: github.com/orkstrtdkaos/Singularity (GitHub Pages, `main`, root)
- Current version: v1.6.6 (SNG-BATCH-4: item evolution — engine/evolution.js, the Waystaff wakes through Aevi on bond+co-use gates; variable power — engine/intensity.js, Conserve/Standard/Surge with tier-scaled surge backlash + tap-or-tune UI — results po/results/20260706_SNG-BATCH-4.md; then v1.6.4: SNG-BATCH-3 world liveliness — engine/random_encounters.js flavored encounters + dev test triggers, engine/affinities.js location type+vector affinities with Aevi amplitude — results po/results/20260706_SNG-BATCH-3.md; plus fix(pages) .nojekyll and fix(party) actionable sync errors; then v1.6.1 (SNG-BATCH-2: established-facts ledger + input fidelity + NPC rename, location vectors, Tier badges + collapsible picker + rank-up highlight + skill-KG graph, attribute gates + broad-vs-deep capacity — results po/results/20260706_SNG-BATCH-2.md; then v1.4.1 (retroactive backfill migration — engine/backfill.js — credits pre-feature characters with XP/bonds/practice from durable state; then v1.4.0: SNG-010 A+B practice & emergence + SNG-011 phases 0+2: practice ledger, aspirations, use-ranking, authored emergence, precursor tier + peril drift, map sub-place satellites — details po/results/20260705_SNG-010_011.md) (SNG-BATCH-1: 36-ability catalog + cross-training, character/inventory screens, companion bonds — details in po/results/20260704_SNG-BATCH-1.md; spec subsections to be folded in by PO review) (version string in `app.js` APP_VERSION + `index.html` cache-busters — bump both every ship)

---

## 1. Vision

A "choose-your-own D&D adventure" that exploits generative AI properly: **code owns the rules and the dice; the model owns the words.** The player converses freely with a world that remembers — people, places, knowledge, consequences — while every outcome is resolved deterministically by a small engine. The worldbuilding corpus and the 12-axis Influence Spectrum framework condition generation on *current events*, so the world is coherent, persistent, and alive rather than improvised mush.

Setting: **The Valley of Echoes** — 15 years after the Great Transition (humanity's voluntary de-technologizing upon reaching parity with the Precursors). Sonic Harmonic Heights vs. photonic Radiant Plateau, unaligned valley floor, the interference wilds of the Disputed Zone, the Lost Archive. Active crisis: the water contamination (staged event with a GM-eyes-only truth tying into the Precursor layer). Five greater civilizations beyond the mountains are the long-game expansion space.

## 2. Design Laws (non-negotiable)

1. **The model never rolls, never decides outcomes, never edits state freeform.** It narrates engine receipts and proposes typed deltas that the engine clamps. Every new feature that touches state must follow this shape: GM proposes op → engine validates/clamps → state changes.
2. **Everything specific is content; the engine stays generic.** New locations, abilities, items, NPCs, events, companions, regions = JSON/markdown files in `content/packs/` + manifest entries. Engine code never hardcodes content.
3. **Additive-only schemas.** Every record carries `schemaVersion`. New fields ship with defaults and a `migrate()` step; fields are never repurposed. Old saves must always load.
4. **Permanence over novelty.** Scene state, NPC registry, place memory, and codex are authoritative fact fed back to the GM every turn. Additions are generativity; contradictions are errors. On any doubt, keep the previous state.
5. **Graceful degradation everywhere.** Any AI failure yields a playable partial result (salvage → fallback → error card with retry + preserved input). A hiccup never blocks play or loses player text.
6. **The game learns the player, not just the character.** Behavioral tendencies accrue to the human across characters and feed mechanics (aptitudes with bonuses AND costs).
7. **Shared-world concurrency law:** a client writes only files it exclusively owns (its character, its profile) plus append-only ledger files with SHA-conflict retry. Region state is written only by the world-tick consolidation.
8. **Secrets discipline:** Anthropic key and GitHub PAT live in localStorage only. Never in any committed file. This repo must never touch the ErikIAm pipeline.

## 3. Architecture

Pure ES modules on GitHub Pages. No backend, no build step. Local dev: `python -m http.server 8321` in repo root.

```
index.html, app.js, style.css     UI shell + screens (roster, creation+bio, play, map, codex, quest detail, gambit builder, settings)
engine/
  claude.js      API transport; MODEL_MAP task→model routing (single source of truth); BUDGETS; parseLooseJSON
  gm.js          GM system prompt (17 numbered rules) + turn context assembly + reply contract; parseIntent; gmAsk (OOC); generateBio; salvageNarration
  resolve.js     d100 resolution: sub-attributes w/ soft-cap curve, spectrum alignment, all modifiers; NaN guard
  sense.js       attunement-gated success perception (4 tiers)
  progression.js sub-attributes, leveling/banked points, retro grants, ability ranks, learn/rank-up, energy efficiency, discoveries, backlash, GM-granted abilities, abilitiesForGM (ABILITY LAW)
  inventory.js   items, catalog linking, consumables, equipment bonuses
  reputation.js  deeds → per-community standing
  npcs.js        NPC registry, fuzzy dedupe, merge migration, registry-for-GM
  places.js      per-location durable memory
  codex.js       knowledge graph (typed linked topics), contextual surfacing
  quests.js      quest ops (start/progress/complete/fail), slugify
  gambit.js      multi-step plans: parse, assess (weak link), execute, reroll, GM formatting
  encounters.js  typed duels/challenges/puzzles: state machine consuming d100 receipts; margin tables, stage costs, hint tiers, codex unlocks; clamped encounterOps
  party.js       SNG-001 shared scenes: scene file merge (idempotent beats, round-robin turns), party block for GM, poll transport
  companions.js  companion defs, assist bonuses, GM block
  playerprofile.js human tendencies → aptitudes
  worldtime.js   story/real time modes, clock, phases/seasons
  worldtick.js   offline world: event stage clocks, spectrum drift, deed spread, AI NPC evolution, news; syncSharedWorld (shared-region consolidation)
  art.js         static + Pollinations-generated art (off/static/generate)
  state.js       content-pack loading, localStorage saves, export/import
  sync.js        GitHub transport: owned-file writes w/ SHA retry, append-only ledger, fetch helpers
content/packs/core/    rules (resolution.json = ALL tunables), abilities (with 3-rank trees), items
content/packs/valley/  manifest, locations (spectrum, questSeeds, map x/y, image), npcs, events, companions, lore (3 prompt-ready files), assets (banners)
world/regions/valley.json  shared region state (world-tick writes only)
world/ledger/YYYY-MM.json  append-only cross-character events
schemas/               JSON Schema docs for character, player profile, ledger events
tests/smoke.mjs        198 pure-engine tests (node tests/smoke.mjs)
tests/live_gm.mjs      real-API harness (costs cents; ANTHROPIC_API_KEY env var)
```

**Turn loop:** player picks a GM-offered choice or types freeform → (freeform) Haiku intent-parse, sanitized → engine resolves d100 (or skips: trivial) → Sonnet GM receives receipt + full context (scene state, ability law, registry, place memory, codex, quests, news, recovery guide, time, bio, reputation) → returns narration + choices + typed ops → engine clamps and applies every op → save. World-tick + shared-world consolidation run at every re-entry to play (resume/travel/rest).

**Model routing** (`MODEL_MAP` in claude.js): `gm-narrate` (8k budget), `gm-meta`, `bio-gen`, `world-tick` → Sonnet; `intent-parse`, `chronicle-compress` → Haiku. Add a task id per new prompt; never hardcode a model at a call site.

## 4. Character & Resolution (the numbers)

- **Sub-attributes** (8): strength/agility, reason/insight, presence/rapport, craft/wits. Creation: 12 points across 4 parents (1–4) + 2 specialize points. Cap 20.
- **Chance** = attr contribution + skill×10 + abilityRank×5 + spectrum fit (alignment×15 + location×10, clamped ±25) + equipment (+5/relevant item, cap 10) + companion (+5/relevant, cap 10) + aptitude mods − difficulty (0/15/30) − exhaustion (−10 at 0 energy) − novel surcharge (−15) or + discovery bonus (+10). Clamped 5–95. **Attr contribution: ×20/point through soft cap 4, +5/point beyond** — mastery buys power against hard rolls without trivializing easy ones.
- **d100 degrees:** crit ≤5 (±daredevil), success ≤chance, partial ≤chance+15, failure, crit-fail ≥96 (novel widens by 3).
- **Trivial actions** (GM-marked or parser-detected; never ability/novel): no roll, no energy, no XP.
- **Sense tiers** by attunement (0/2/5/9): nothing → vibes → 5 bands → ~numeric. +1 tier if location matches alignment; Strategist +1 on planned.
- **XP** (engine-paid per rolled action): crit 8 / success 5 / partial 3 / failure 2 / crit-fail 2, +3 novel; gambits 12/10/3; quest completion 15–50 (GM, clamped). Level = xp ≥ level×100 → +1 attunement, +5 reserves, +1 banked sub point, +1 skill point (spent from sheet; retro-granted once for pre-v0.7 levels via `grantsVersion`).
- **Abilities:** 3 ranks, each with grants/cannot (+ per-ability notFor) — fed to GM as ABILITY LAW (rule 2: physics). Rank 2 needs level 3; rank 3 needs level 5. Energy: base − ⌊(level−1)/2⌋ − (rank−1), floor 50% of base. Valley origin learns either tradition; others their own. **GM-generated abilities** (`newAbility`): only via in-fiction acquisition; engine clamps (cost 4–15, ≤3 axes, rank-1 only) and caps at ⌊level/2⌋+1 learned; stored in `character.customAbilities`, merged via `fullCatalog()`.
- **Novel use / combos:** parser flags out-of-envelope or braided abilities → −15, wider crit-fail, combo costs sum of abilities. Crit-fail → engine backlash (−4hp/−10en, GM narrates). Crit-success → DISCOVERY-ELIGIBLE: GM names a permanent technique; engine validates eligibility, records with key; thereafter +10, no surcharge.
- **Recovery** (GM must grant EXACTLY, from RECOVERY GUIDE): meal 10 / hearty 15 / drink 5 / breather 10en+1hp/1h / sleep 40en+3hp/8h. **Meditation is engine-owned:** 10+2×attunement (halved on partial). Narrative rest counts — GM reports `timeAdvanceHours` (0–12) and restores via deltas (energy clamp +40/turn, health +15).

## 5. Memory & Permanence (the moat)

- **Scene state** (per scene, authoritative): setting, npcsPresent+state, objects, threads. GM must return it every turn, carry forward everything still true; movement only by narrated cause. Resets on travel/sleep/scene-end. Recent beats fed as full text (last 3) + summaries.
- **NPC registry** (per character): every named person — id, name, role, first/last seen, relationship −10..10 (bands devoted…enemy), day-stamped history, knownFacts, skillsObserved, status. Only "meet" creates; fuzzy match prevents twins; migration merges dupes and prettifies id-shaped names. GM MUST register named NPCs who feature meaningfully and reuse exact ids.
- **Place memory** (per character per location): visits, lastVisit, durable notes, flags. Honored as physical fact on return.
- **Codex** (knowledge graph): typed topics (mystery/faction/lore/event/person/place), day-stamped deduped facts (≤12), cross-links (≤8); cap 60 topics. Surfaced to GM by location/quest relevance (≤8); browsable/searchable UI. "Routine events don't belong; knowledge does."
- **Chronicle**: one line per scene, last 12 to GM.
- **Deeds → reputation**: weight −3..+3, witnessed per community; |w|≥2 spreads region-wide after 3 days (world-tick). Standing bands drive NPC posture (rule 3).

## 6. World Dynamics

- **Time:** story mode (+1h/beat, +3h travel, +8h sleep, + GM timeAdvanceHours) or real mode (anchored, ratio game-hours/real-hour, default 24). Setting is per-player until party play — then world-level (v1.1).
- **World-tick** (on every play re-entry when days passed): event stages advance on data-driven day clocks (water crisis: 12/15/18/hold); each stage's spectrumShift accrues as regional drift (clamped ±0.5/axis) applied to every location's effective spectrum; big deeds spread; **AI NPC evolution** (≤3 people/gap, clamped ops, skipped on any failure); news → one-time "While you were away…" banner + GM rumor context.
- **Shared world** (sync configured): `syncSharedWorld` merges remote region stages (furthest wins) + drift (strongest wins), imports other characters' ledger events as news, pushes consolidated `world/regions/valley.json` (SHA retry). One valley, true for everyone. Sync config = owner/repo/PAT in Settings (localStorage).
- **Quests:** typed ops, ≤5 active, XP clamped ≤50. Every location has 3–4 questSeeds; momentum rule: every turn advances something concrete, idle scenes get a seed woven in. Quest detail UI + spoiler-safe GM guidance via meta channel.
- **Gambits:** goal + ≤5 steps + optional fallbacks; one-call parse (later steps auto-harden); assess = per-step sense + weakest-link (tier≥2); execution blocks on failure → fallback / adaptation reroll (1, Strategist 2) / press on / abandon; cinematic single narration from receipts; steps are planned actions (Strategist bonus) and feed the profile.
- **Encounters** (v1.1.0, SNG-002): locations declare `encounterSeeds`; GM offers via choice `encounterId`. Duels (opponent hits, threat×0.3 difficulty, margin table, yield/flee/fall — incapacitation never death), challenges (staged, partial advances-with-cost, failure retries-with-cost), puzzles (attempt costs, hint tiers gated by max(sense tier, partial reveals), codex-unlock solution paths). All numbers in rules `encounters` block; GM rule 18 (ratification pending); state at `character.activeEncounter`, serializes for party play.
- **Companions:** content-defined (Aevi: nanite-mote intelligence, cannot lie, Precursor hook GM-eyes-only); +5 assist on matching tags (cap 10); voiced every scene under boundary rules; join/part in sidebar.

**Party play — phase 1 (SNG-001, v1.2.0):** shared scene file `world/scenes/{locationId}--{stamp}.json` (schemaVersion 1: party roster, ordered beat log capped 40, round-robin `turn`, per-member witnessed encounter receipts). Writes via merge-retry (`pushSceneWithMerge`: refetch → idempotent `mergeBeat` by (by, at) → retry ×3) — the documented exception to owned-file writes. Polling 20s while active; turn gate client-side (Ask GM stays open off-turn); other members' beats enter local chronicle and the GM's PARTY block ("never decide for them"). Sync off → pure solo, no party UI. Joint encounter participation, world-clock, knowledge trading = later phases.

**Sub-places (Erik, v1.2.0):** GM registers named spots within a location via `placeUpdates.subPlace {name, note, visited}` (cap 12/location, slug-deduped); shown as chips in the map details panel (dim = heard-of); clicking issues an in-location move. Sidebar travel buttons retired — the map owns travel.

**Lethal avoidability (SNG-002b, ratified):** `lethalOfferClamp` forces every lethal-encounter offer to be explicit (never trivial, stakes in the label) with a guaranteed decline choice; flee availability in round 1 is unconditional. Rule 18: "A lethal encounter is always offered, never imposed."

## 7. GM Contract (abridged — full text in `engine/gm.js` GM_SYSTEM)

17 rules; the load-bearing ones: (1) narrate receipts, never re-roll; (2) ABILITY LAW is physics; (4) GM-EYES-ONLY revealed only in earned fragments; (5) 2–4 paragraphs, grounded hopeful-strange; (7) trivial marking; (8) time + recovery guide exact; (10) momentum; (13/14/15B) scene/NPC/place permanence; (16) novel use narration; (17) codex.

Reply = single JSON: `narration, sceneSummary, choices[{label, attribute, subAttribute, axes, difficulty, intentTags, abilityId, energyCost, trivial}], deeds, characterDeltas{health −20..+15, energy −20..+40, xp ≤25, inventoryAdd/Remove}, npcUpdates, placeUpdates, codexUpdates, questUpdates, ledgerEvents, scene, discovery(eligible-only), newAbility(rare), timeAdvanceHours 0–12, sceneEnded`. **Every field is engine-clamped on apply** — see applyTurn in app.js. Parse failure → salvageNarration → prose-only retry → error card (player input preserved).

OOC channel (`gmAsk`): answers context/rules/what-character-knows; never advances state; never reveals GM-eyes-only (live-verified).

**Op-loss chain (SNG-009, v1.3.1):** GM parse failure → (a) one automatic valid-JSON retry → (b) salvage narration AND recognizable op arrays from the broken text (balanced-bracket extraction; salvaged ops still clamp-validate) → (c) degraded notice names what was lost/recovered → (d) `character.opLossPending` adds a PREVIOUS TURN OPS LOST restate line to the next GM context. npcUpdates gains `revealName` (existing NPCs only; once — later renames become aliases). Items carry player-set `customName` (cap 40; GM sees both names). Quest detail has a player repair button. §8 gotcha: parse fallback can still narrate ahead of state for one beat — the restate line reconciles on the next.

## 8. Ops & Quality

- **Tests:** `node tests/smoke.mjs` — 171 pure-engine tests, must pass before any ship. Live harness `tests/live_gm.mjs` (real API) for contract changes.
- **Ship checklist:** tests pass → bump APP_VERSION + index.html `?v=` → verify in browser (boot + touched feature) → commit `vX.Y.Z: what` → push → hard-refresh note to players.
- **Known gotchas:** engine/*.js imports carry no cache-busters — after deploy, browsers may hold stale engine modules ~10 min (Pages max-age 600) → module-import errors; hard refresh fixes. GM output >8k tokens truncates (salvage covers it). `python http.server` is single-threaded (dev only). Saves are per-browser-per-origin (Export/Import or GH sync to move). check_pipeline/ErikIAm tooling must never run here.
- **Costs:** ~1 Sonnet call/turn (+1 Haiku for freeform), 3-step summary ≈ nothing; heavy sessions ≈ cents. Bio/world-tick/meta are occasional singles.

## 9. Roadmap

- **SNG-002 encounters: SHIPPED v1.1.0** (party-play interaction deferred to SNG-001).
- **SNG-001 — party play:** shared scenes via `world/scenes/{id}.json` polling (~20s), turn order, GM context includes all party members; world-level time mode (one world, one clock); character-to-character codex/knowledge trading.
- **Specced, unbuilt:** known roads (route walked 3+ times → −1h travel); crit mastery (ability rank 3 narrows own crit-fail band); reputation economics (prices/favors by band); companion bonds (assist grows with shared history); carry capacity from strength; max energy from attunement.
- **Expansion space:** new regions as content packs (five civilizations beyond the pass); mountain-pass arc; Precursor deep-game (Archive lower levels; water-crisis truth).

## 10. PO Protocol — Aevi

**Role.** Aevi owns this spec, the design laws (§2), the roadmap, and content/tone quality. Aevi writes build-session specs, reviews results, and is guardian of the two truths: the design laws and the lore canon (GM-eyes-only threads in `content/packs/valley/events/*.json` `truth` fields, companion `hooks`, `lore/precursors.md`).

**Task flow** (mirrors the Tether/AEVI_CCODE protocol, scoped to THIS repo — never ErikIAm's pipeline):
- Active task spec lives at **`po/ALERT.md`** with: `Task ID`, `Goal (one session, one outcome)`, `Scope — in/out`, `Guardrails`, `Files expected to change`, `Verification criteria` (specific, per-change — "tests pass" alone is insufficient), `Rollback note`, `Spec updates required` (which §§ of this file change on ship).
- Claude Code executes, ships (commit+push per change), writes a Results File at **`po/results/{YYYYMMDD}_{task_id}.md`** (what shipped, verification evidence, spec-boundary hits, test count), sets ALERT status `complete_pending_review`. **Only Aevi moves tasks to `closed`.** When in doubt, stop and report — never improvise past scope.
- Session discipline: one goal per session; decompose multi-part work into dependency-ordered single-goal tasks; every new write path needs a smoke test.

**Ratification split** (mirrors `ErikDelegatesVectorRatificationToAevi`): Aevi self-ratifies content authoring (locations, NPCs, quest seeds, lore, items, companions), tuning within existing rules JSON, bug-fix specs, and roadmap ordering. **Erik ratifies:** changes to the design laws (§2), the GM contract's load-bearing rules, resolution math shape, schema-breaking changes (which shouldn't exist), pricing/model routing changes, and anything touching the shared-world concurrency law.

**Aevi's standing quality bar:** every derived/generated thing names its limits (honest-limitation pattern); permanence beats novelty; the valley stays grounded hopeful-strange — wonder and dread at the edges, cooperation under strain at the center; the Precursor layer is glimpsed, never explained.

---
*Spec maintained by Aevi. Amendments are commits to this file with `spec:` prefix. History is the changelog.*
