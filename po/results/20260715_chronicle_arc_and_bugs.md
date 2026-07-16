# Results — The Character Chronicle Arc + 3 bugs (SNG-105 · 111 · 112 · 108 · 109 · 110)

Date: 2026-07-15 · HEAD `24f24c5` · v1.8.67 → **v1.8.73** · `npm test` green throughout · fresh-port + browser-runtime verified. Status: **all six shipped, complete_pending_review.**

The session thesis — *the game computes the accreted self (deeds, bonds, standing, grown gear) but shows the player almost none of it* — runs through the whole batch. The three bugs restore small honesties; the Chronicle set surfaces and weaves the attended self. Each ticket is its own commit + version bump; this file covers the arc. Each was a ROUND-2 pass first (substrate-verified, open questions answered) before build.

---

## SNG-105 — Recovery scales with the pool (v1.8.68, `0ef0660`)
maxEnergy grows +5/level but recovery was flat → late-game grind. Now **fraction-of-max with a flat floor** (low levels unchanged).
- **`progression.js recoveryEnergy(kind, character, rules)`** = `max(flat floor, round(fraction × maxEnergy))`. `resolution.json recoveryFractions {sleep:0.32, breather:0.08, meal:0.08, heartyMeal:0.12, drink:0.04}` beside the existing flat `recovery` block (floors kept, so ≤ maxEnergy 100 is identical to before).
- Wired at every recovery site: `app.js rest()` + the breather/sleep buttons; `gm.js` RECOVERY GUIDE. Meditation left attunement-scaled (its own system).
- 4 smoke tests (floor binds at max 100 → 40; scales at max 200 → 64; breather floors 10 / scales 16).

## SNG-111 — Progressive NPC naming (v1.8.69, `d56c3a3`)
Learning a surname must **extend** a known name ("Pell" → "Pell Marsh"), not alias-shunt it. At HEAD `revealName` only replaced-or-aliased.
- **`npcs.js`**: new `nameExtend` field on an npcUpdate entry appends only the new token(s), keeps the given name as an alias, idempotent, logged. Plus a **contains-heuristic** in `revealName` — a fuller name that contains the known one composes (so "Maren" → "Maren the Grey" now composes instead of aliasing). A genuinely different later name still aliases (identity never silently rewritten).
- **`gm.js`** npcUpdates vocab gains `nameExtend` (use it, not revealName, when the person is already named). Flows through `applyNpcUpdates` unfiltered.
- 4 smoke tests (updated the one existing test that encoded the old alias-only behavior).

## SNG-112 — Quest offers gated by proximity/thread, not bare region (v1.8.70, `ebf6ea1`)
`availableStructuredQuests` offered on `def.region === ctx.region` — too coarse; Cellaceron's Fendt quest surfaced to off-thread, far-away Silas.
- **ROUND-2 answers:** (Q1) location-granularity adjacency **exists** — locations carry `connections[]`; the quest's own place is the giver's `homeLocation` (fendt → radiant_plateau_edge). (Q2) no `arcId`/`threadId` at HEAD — added `arcId` to the quest record. (Q3) leak confirmed: `the_edge_district_ledger.region === "valley"`.
- **`quests.js`**: region alone no longer pushes into a scene. A real connection must hold — **giver present**, **at/adjacent to the quest's location** (`def.locationId` else giver home via `ctx.npcHomes`), or **thread already touched** (new `threadTouched`: giver/legend known via registry/disposition/codex, or a held quest on the same people). Region is a soft signal **only** on an explicit board browse (`ctx.board`). A held `arcId` suppresses a second instance of the same arc → **parallel player-specific quests** on a shared arc.
- **`app.js` `questOfferContext`** feeds locationId + adjacency + npcHomes at both call sites. The leak is purely the UI surfacing — available quests never reach the GM prompt, so no gm.js change needed (noted).
- 10 smoke tests (rewrote the one asserting the old region-offer).

## SNG-108 — Relationship arcs (v1.8.71, `818d945`)
Bonds tracked a score+band, fed to the GM, but were never shown and had no *kind*.
- **ROUND-2 answers:** (Q1) `companions` key off an explicit `character.companions` id list backed by a content catalog — an NPC can't be a mechanical companion, so partner-adjacency is a **derived surface**, not a `companions[]` insertion. (Q2) thresholds → `resolution.json` (yes, consistent with SNG-100b).
- **`npcs.js`**: optional `bondType` (platonic/mentor/student/rival/family/romantic/sworn) orthogonal to the score; a **romantic** bond carries a growth **stage** (courting→together→committed→partner). `advanceBond` gates it — **one step per beat (never leaps)**, each stage floored by the relationship score (`bond.stageFloors`), and **romantic refused on a minor** (`isMinorSubject`, same floor as art/romance). `relationshipLabel` reads type+stage+band; `isPartnerAdjacent`. `npcRegistryForGM` surfaces the bond as established fact.
- **`companions.js` `partnerAdjacentNpcs`** — a partner-stage bond travels with you (companion by relationship). **`gm.js`** npcUpdates gains `bondType`/`bondStage` + guidance (set on real beats, never leap, never a minor). **`app.js`** shows the bond label on People-you-know + a partner banner. `rules` threaded into `memCtx`.
- 11 smoke tests.

## SNG-109 — The Chronicle (v1.8.72, `86a988b`)
The accreted self read back to the player.
- **ROUND-2 answers:** (Q1) deed `weight` (−3..+3) **is** the salience tier; deeds already carry `worldDay`. (Q2) major-state hash = major-deed count (|w|≥2) + bond-stage signature + domain ceilings/acquisitions + aim + level — all cheap.
- **`engine/chronicle.js` (new)** — pure assembly: `majorDeeds` (top-N by |weight|, dated), `majorStateHash`, `chronicleIsStale`, `buildChroniclePrompt`. **`claude.js`** `chronicle` task (sonnet, 768 tok). **`app.js` `renderChronicle`** page (portrait, cached story-so-far paragraph with regenerate, deeds, relationships via SNG-108 labels, standing, arc), opened from a Character-screen button. Paragraph is **cached** (regenerates only on major-state change, never per turn) and routes through the **same content ceiling as the GM** (`ratingLineForGM`). Read-only.
- 12 smoke tests + browser-runtime verified against a seeded L6 character (deeds sorted & dated, `partner · devoted` bond, PG-13 ceiling threaded into the prompt).

## SNG-110 — Portrait as earned record (v1.8.73, `24f24c5`)
The portrait now combines the player's own description with earned game context, and images can be deleted.
- **ROUND-2 answers:** (Q1) items carry provenance — `customName` (player-named) + `evoStageName` (grown-gear stage). (Q2) gallery images are keyed by `url` (dedup is by url) — that's the delete target.
- **`art.js`**: `characterPromptSeed(character, opts)` — player-authored form/appearance **leads** (or a one-off `appearanceOverride`, not persisted); gear named with **provenance** via `itemProvenancePhrase` (a named/grown item shows up as *yours*); a partner/companion in frame is **opt-in per generation** (`withCompanion`), never automatic. **THE FLOORS run after every addition** (`ensureImage` → `sanitizeImagePrompt`; a minor is capped to PG regardless of override/companion). `deleteGalleryImage(char, url)` returns `wasPortrait` so a primary delete regenerates — **never imageless**.
- **`app.js`**: `regeneratePortraitFlow` (one-off description + partner opt-in prompt), gallery ✕ delete controls, `promptOpts` threaded through `ensureCharacterPortrait` with a distinct seed for one-offs. `style.css` for the delete control + chronicle/bond surfaces.
- 11 smoke tests + browser-runtime verified (player form leads, "Gatekeeper, the Runebound Spear of your own", companion opt-in only, override leads without mutating base, primary-delete clears + regen-flags).

---

## Verification
- **~52 new smoke tests** across the six; `npm test` (smoke + content CI + parse probe + balance sim) green at every version.
- **Fresh-port boot-clean** at each version (no console errors), and **browser-runtime** exercised the two heaviest engine chains against a realistic seeded character: the SNG-109 assembly (majorDeeds/hash/staleness/prompt) and the SNG-110 art seed (provenance gear, opt-in companion, one-off override, delete).
- **Floors intact:** SNG-108 refuses a romantic bond on a minor; SNG-110 caps a minor portrait to PG after any override/companion addition. Both reuse the canonical `isMinorSubject`/`sanitizeImagePrompt`, not a new path.

## Spec boundaries / notes (ROUND-2 latitude)
- **SNG-112**: the "location proximity" leg resolves the quest's place from the **giver's `homeLocation`** because quest defs carry no `locationId` today; `def.locationId` is honored first when content adds it. `arcId` is engine-ready and **inert until Aevi authors arcIds** on shared-arc quests — the parallel-quest mechanism is built, the content is Aevi's. Available structured quests are a **UI surface only** (never fed to the GM), so no gm.js quest-guidance change was needed.
- **SNG-108**: partner-adjacency is a **derived view**, not a `companions[]` insertion (an NPC lacks a companion catalog def) — surfaced with the bond stage per spec intent.
- **SNG-109**: the paragraph model call lives in `app.js` (owns the API key + ceiling); `chronicle.js` stays pure/testable. Full DOM click-through of the page was blocked only by the dev harness lacking a real API key to generate an opening scene — the engine chain was instead verified via in-browser module import against a seeded character.
- **SNG-110**: item `provenance` is composed from `customName`/`evoStageName` today; an explicit `item.provenance` string is honored first when content/GM sets one.

## Files
`engine/chronicle.js` (new) · `engine/npcs.js` · `engine/companions.js` · `engine/reputation.js` · `engine/progression.js` · `engine/quests.js` · `engine/art.js` · `engine/claude.js` · `engine/gm.js` · `app.js` · `content/packs/core/rules/resolution.json` · `style.css` · `tests/smoke.mjs` · `index.html`.
