# BATCH-9 Handoff — the generative living world (for the next CCode session)

*Written 2026-07-11 at the end of a long session that shipped BATCH-9 Phase 1 + SNG-041 + BATCH-9 Phase 2. Read this to continue with **BATCH-9 Phase 3** (or any generative-world work) without re-deriving the architecture. Session-start reads remain SYSTEM_SPEC.md + po/ALERT.md; this is the detailed map beneath them.*

## State right now
- **Live: v1.8.1** (https://orkstrtdkaos.github.io/Singularity/). 652 smoke checks (`node tests/smoke.mjs`) + `node tests/parse_probe.mjs` green.
- **Shipped this session, ALL awaiting Erik's preview-legs before Aevi closes** (complete_pending_review; only Aevi closes):
  - Correction: the "v1.7.0 4-tier cache is a ghost" flag was wrong — the cache IS built (commit d32b45d). Retracted everywhere.
  - **BATCH-9 Phase 1** (v1.7.6→1.7.9) — the generate anchor. Results: `po/results/20260711_SNG-BATCH-9-Phase1.md`.
  - **SNG-041** (v1.8.0) — one world, one clock. Results: `po/results/20260711_SNG-041.md`.
  - **BATCH-9 Phase 2** (v1.8.1) — living advancement. Results: `po/results/20260711_SNG-BATCH-9-Phase2.md`.
- **Next build: BATCH-9 Phase 3** (shared-world promotion + rating-lens + contradiction→rank). Digest + hooks below.

## The subsystem Phase 3 builds on (all shipped)

### The generated store — `engine/generate.js`
- Store lives on the character: `character.generated = { schemaVersion, npc:{}, location:{}, arc:{} }`, keyed by `entityId`. `ensureGenerated(character)` inits it. `generatedRecords(character, type)` → array. `findGenerated(character, entityId)` → record across types.
- **Every record is authored-shape at top level + a `_gen` sidecar** (so authored vs generated is indistinguishable downstream). On `enterPlay`, `hydrateGeneratedIntoContent(character)` merges the store into the live `CONTENT.locations`/`CONTENT.npcs` maps → grown content is first-class + revisitable.
- **`_gen` envelope** (this is what Phase 3 reads): `{ entityId, type, birthWeight, engagementScore, tier, rating, provenance{ playerKey, characterId, locationId, day, worldDay, hint, why }, attentionHistory[], createdDay, offscreen[{worldDay,note}], repaired, stubbed, romanceEligible, floor? }`.
- **Tiers + weight** (`§2` governor): `fresh → established → nominated`. `TIER_AT = { established: 3, nominated: 8 }` (engagementScore thresholds). `recordAttention(entity, kind, day)` bumps score (`ATTENTION_WEIGHT = { revisit:2, interact:2, fact:1, quest:2, session:1, keep:4 }`, cap 60) + recomputes tier. **`effectiveWeight(entity) = birthWeight + floor(engagementScore/2)`** = realness (Phase 3's promotion + contradiction key). `isDormant`/`isSurfaceable` (fresh un-attended past `FRESH_WINDOW_DAYS=4` stops surfacing; established never dormant; nothing is ever deleted). `livingWorldForGM` surfaces non-dormant. **`nominationsFor(character)`** → tier==='nominated' records `{id,name,type,weight,rating,provenance}` — the promotion-candidate queue Phase 3 consumes.
- **generate path:** `generate(type, context, deps)` — build prompt (few-shot corpus under local disposition) → validate (`genschema.js`) → repair → in-grain stub → resolve-before-mint (SNG-019 `resolveExisting`/namematch) → enforceFloors → stamp `_gen` → persist + codex mirror. LLM call injected (`deps.callJSON`) so it's headless-testable. GM emits a `generateRequest` op; `app.js handleGenerateRequests` runs it (per-scene governor cap 3).

### Validation — `engine/genschema.js` + `schemas/{npc,location,arc}.schema.json`
Dependency-free subset validator (no build step): type/required/properties/items/enum/additionalProperties + `missingRequired` + `defaultFor`. Schemas derived from the authored corpus (green gate: all 61 authored records validate).

### Rating + the two floors — `engine/playerprofile.js` + `engine/generate.js`
- Ceiling on the profile: `RATING_LEVEL = {G:0,PG:1,"PG-13":2,R:3,"R+":4}`. `ratingCeiling`/`ratingLevel`/`isMinorProfile`. `canSetRating`/`setRating` enforce: minor capped at PG-13, R/R+ need the adult gate, no self-elevation. Settings UI has the control. Per-entity tag on `_gen.rating` (stamped to the requesting player's ceiling at generation).
- **Floors (absolute, rating-independent, at the birth-validator):** `enforceFloors`/`isMinorEntity` in generate.js — a sexualized minor is stubbed, a minor's romantic framing neutralized, every minor NPC `_gen.romanceEligible=false`. **Phase 3's rating-lens MUST still honor the floors** (a minor is never romantic/sexual for ANY viewer; sub-ceiling players are hard-excluded from above-ceiling content, not softened).

### The shared clock — `engine/worldtime.js` (SNG-041)
- Fixed shared epoch (`WORLD_EPOCH_MS = 2026-07-01`, `worldDay 1`, rate 1 world-day/real-day; device-agnostic constant → "one clock" with zero sync dependency; tunable via `getWorldEpoch`/`setWorldEpoch`). `absoluteWorldDay(nowMs, epoch)` = the reconciliation key. `worldDate`, `worldDayAt(ISO/ms)` (unknown→null), `relativeWorldDays`. Per-character `clock` stays the LOCAL play-paced frame (journey-day); the shared absolute is the far-world real-time clock.
- Events/news/deeds/ledger stamp the absolute `worldDay`. Cross-character reconciliation dates by `worldDayAt(e.at)`. GM given the world-date + "references-not-invents".

### Living advancement — `engine/worldtick.js` (Phase 2)
- `advanceGeneratedOffscreen({character, evolveFn, now})` — a SEPARATE call (runWorldTick untouched), wired into `maybeTick`. Established/nominated generated NPCs+arcs advance in real-time gaps (gated by `ws.lastTickWorldDay` baseline + the governor); an injectable in-grain AI pass writes a `[while away]` codex fact + an away-digest item dated on the shared clock. Never throws.
- `ledgerEvents.impactsLocal` — the far-world/local boundary-cross tag (an event that reaches another character's area/quest). Phase 2 built the tag + surfacing; Phase 3/later fill the generation of such events.

### Cross-player substrate (what shared canon will use)
Saves sync via the repo when GH sync is configured (Settings): characters → `characters/{playerKey}/{id}.json`; append-only ledger → `world/ledger/{month}.json` (events carry `at` ISO + `worldDay` + `impactsLocal`); region state → `world/regions/valley.json` (written by `syncSharedWorld` in worldtick.js — merges event stages/drift + reads other characters' ledger as dated news). This is the concurrency-safe substrate BATCH-9 Phase 3 promotes shared canon into.

## BATCH-9 Phase 3 — what to build
Spec: `po/SPEC_BACKLOG.md` — the BATCH-9 Phase-1 spec's **"Recorded for later phases → Phase 3"** block (search "EARNED auto-promotion"). Three parts:
1. **EARNED auto-promotion.** A generated entity born personal auto-promotes to SHARED canon when its weight (birth-power + attention) crosses the established/promotion threshold. **The threshold IS the gate — no human curator.** (`nominationsFor` already surfaces the candidates; Phase 3 promotes them into a shared-canon store.)
2. **CONTRADICTION → RANK, not reject.** A promoting entity colliding with existing canon fires an **opposed roll weighted by each side's realness (`effectiveWeight`)**. Winner = loud canonical reality; loser drops to a **variant/rumor tier** — persists, discoverable, contestable later. Authored core canon sits at a **high weight floor** (designed spine stays stable). Collision detection: reuse `resolveExisting`/namematch against shared canon + authored content.
3. **RATING-LENS on the shared world.** Shared canon is a superset; each player receives the subset **at/below their `ratingLevel(profile)`** vs each entity's `_gen.rating`. Above-ceiling content that CAN dial down → **ADAPTIVE RE-NARRATION** (re-render per ceiling, a call per entity). Above-ceiling that CANNOT → **FILTER** (absent; generator substitutes in-ceiling). The floors still apply absolutely (minor-protection is a hard exclude, never a softening). This is the family-safety mechanism that lets Erik's R+, Courtney's G, and a minor's G coexist in ONE world.

Pairs with **SNG-042 (Legends & Villains)** — anchors authored in `content/packs/valley/lore/legends.json` (3 heroes + 2 villains); legends are high-birth-weight generated NPCs that ride the weight/recurrence + Phase-2 offscreen path. A follow-on, not required for Phase 3.

### Likely shape (design, not prescribed)
A new synced shared-canon store (e.g. `world/canon/{region}.json`) that promoted entities write into (concurrency: owned-file/merge-retry like the ledger/region). Promotion runs on the same reconcile/tick cadence. Keep it **derives-never-fabricates**, **governor/weight-gated**, **floors absolute**, **additive schemas**, **never halts play**.

## Conventions & gotchas (do not relearn the hard way)
- **Push after every commit; `git pull --rebase origin main` before push** — Aevi pushes PO ledger updates AND live gameplay saves (characters/profiles) to the repo concurrently; expect non-fast-forward rejections and rebase.
- **Build-owner split:** CCode builds ALL engine/app code; Aevi authors specs + the po/ ledger + content files, never engine. "Aevi has a spec for X" = Aevi wrote the spec; the implementation is CCode's. (See memory `project_singularity_agent_split`.)
- **Preview stale-module cache:** a long-lived local preview tab caches internal `./foo.js` imports stale (only `app.js?v=` is version-busted), so boot hangs on a bogus "does not provide an export named X". The served file is fine (verify with a `{cache:"no-store"}` fetch; Node loads the full graph). **Live-verify on a FRESH port** (`python -m http.server 8322` via Bash, navigate there, kill after). (See memory `project_singularity_preview_stale_modules`.)
- **Every ship:** bump `index.html ?v=` + `app.js APP_VERSION`; suites + parse_probe green; commit `SNG-...: what`; push; then results file + SYSTEM_SPEC version line + po/ALERT.md status; deploy check (`curl .../actions/runs`).
- **Design law 1** (engine owns dice/state/resolution; GM narrates + emits typed clamped ops). Additive schemas w/ schemaVersion. **Never touch the ErikIAm pipeline** (separate repo).
- `.nojekyll` must stay at repo root (a failing Jekyll build silently freezes the deploy — check Actions runs, not just the CDN).
- Tests: `node tests/smoke.mjs` (652 pure-engine checks; inject fake LLMs — no API key needed) + `node tests/parse_probe.mjs`. `gh` CLI is NOT available; use `curl` to the GitHub API. `git bash` heredocs choke on backticks/emoji in JS — write scratchpad node scripts via the Write tool instead.
