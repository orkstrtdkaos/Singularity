# Singularity — The Valley of Echoes

An AI-game-mastered narrative RPG. **Code owns the rules and the dice; the model owns the words.**
Pure ES modules on GitHub Pages — no backend, no build step (same architecture as Tether).

## Play

Serve the folder over HTTP (packs load via `fetch`):

```
python -m http.server 8321
# then open http://localhost:8321
```

Or the GitHub Pages deployment. First run: Settings → paste your Anthropic API key
(stored in localStorage only — never in any file or commit).

## Architecture

| Layer | Where | Law |
|---|---|---|
| Engine | `engine/*.js` | Small, generic, deterministic. Never knows specific content. |
| Content | `content/packs/*` | Everything specific is data: locations, NPCs, abilities, events, lore, rules numbers. Adding content = adding files. |
| World | `world/` | Shared persistent state. Region files written ONLY by the world-tick; players APPEND to `world/ledger/`. |
| Saves | localStorage (+ optional GitHub backup via `engine/sync.js`) | A client writes only files it exclusively owns. |

### Engine modules
- `resolve.js` — d100 resolution: attributes + skills + **spectrum alignment** (12-axis fit between who-you-are, what-you're-doing, and where-you-are) + player-aptitude mods. Pure functions.
- `sense.js` — the graduated "sense of success": the engine always knows the true odds; the *character* perceives only what their attunement earns (nothing → vibes → bands → near-precise).
- `reputation.js` — deeds are the source of truth; a community's opinion is a view over the deeds it has witnessed/heard. News spread between communities lands with the world-tick (v0.3); schema already supports it.
- `playerprofile.js` — tracks the **human**, across characters. Action intent tags accumulate into tendencies; thresholds grant aptitudes with bonuses *and* costs (Strategist, Rough-and-Ready, Carouser…). Defined in `content/packs/core/rules/resolution.json` → `playerAptitudes`.
- `gm.js` — assembles the GM prompt (location + lore + reputation + chronicle + resolution receipt) and parses the structured turn JSON. Falls back to plain narration on any parse failure — a hiccup never blocks play.
- `claude.js` — API transport. `MODEL_MAP` is the single source of truth for task → model routing (GM narration on Sonnet, intent parsing on Haiku). Every call logs tokens + stop_reason.
- `state.js` — content-pack loading, localStorage saves, export/import.
- `sync.js` — GitHub transport (swappable). Owned-file writes with SHA-conflict retry; append-only ledger.

### The turn loop
1. Player picks a choice **or types anything** → freeform goes through `parseIntent` (Haiku).
2. `resolve.js` rolls d100 against the computed chance — deterministic, receipt shown in the UI.
3. `gm.js` sends the *result* to the GM (Sonnet), which narrates it and returns the next choices, deeds, deltas, and ledger events as JSON.
4. `applyTurn` clamps and applies everything; deeds update reputation; intent tags update the player profile; ledger events go to the shared world (best-effort).

## Adding content (no code changes)

- **New location**: drop a JSON file in `content/packs/valley/locations/`, list it in the pack `manifest.json`, add its id to a neighbor's `connections`.
- **New ability**: add to an abilities file (or a new one listed in the core manifest).
- **New region**: new pack folder with its own manifest — engine loads whatever manifests declare.
- **Tune the game**: edit numbers in `content/packs/core/rules/resolution.json`.
- **Schema law**: every record has `schemaVersion`; changes are additive-with-defaults only. Never repurpose a field.

## Roadmap

- **v0.1** — solo loop in the Valley: creation, resolution, sense filter, reputation-by-deeds, player-profile aptitudes, GM narration, saves, optional GitHub backup + ledger append.
- **v0.2 (this)** — **Inventory** as first-class items (`engine/inventory.js`): catalog in `content/packs/core/items/`, use/examine/drop in scenes, consumable effects, equipment bonuses (`bonusTags` matching action intent), GM sees and weaves items. **Art** (`engine/art.js`): `image` field on any record + bundled location banners in pack `assets/`, optional generation for missing art (Pollinations, keyless) — setting: off/static/generate. **Time passage** (`engine/worldtime.js`): story mode (clock moves with play) or real mode (anchored to the real clock at a configurable ratio) — the GM narrates time of day and season.
- **v0.3.0 (this)** — pace & depth: **Quests** as typed GM ops (`engine/quests.js` — start/progress/complete/fail, clamped XP, active cap of 5) seeded from per-location `questSeeds` the GM is instructed to weave in whenever a scene idles; momentum rule (every turn advances something concrete). **Character bios** (creation step with AI "weave it for me" draft — hometown, residence, livelihood, hobbies, motivation — fed to the GM every turn). **Ask-the-GM channel**: Act/Ask toggle on the input bar routes out-of-character questions to a spoiler-safe meta GM that never advances state.
- **v0.3.1** — scene permanence: authoritative per-scene state anchor (setting/NPCs/objects/threads) the GM must carry forward; full-text memory of recent beats.
- **v0.4.0 (this)** — NPC & place permanence across scenes: **NPC registry** (`engine/npcs.js`) — every person met (authored or GM-invented) gets a durable record: name, role, first-met, relationship (−10..10 with bands), interaction history, what they've experienced/learned, observed skills, status; GM must reuse these people (rule 14). **Place memory** (`engine/places.js`) — per-location durable notes, flags, and visit history the GM must honor on return (rule 15). Sidebar "People you know". Legacy relationships migrate automatically.
- **v0.5.0 (this)** — world-tick (`engine/worldtick.js`): runs whenever the character re-enters play and in-game days have passed. **Event advancement** — active events progress through data-driven stage clocks (`days` per stage in the event JSON); each stage's `spectrumShift` accumulates as regional drift applied to every location's effective spectrum. **News spread** — significant deeds (|weight| ≥ 2) travel to the region's other communities after 3 days; reputation follows you. **Offscreen NPC evolution** — an AI pass imagines small, grounded developments for up to 3 known people per gap, applied through the same clamped npcUpdates ops; skipped gracefully on any failure. News shows once as a "While you were away…" banner and feeds the GM as rumors. World state is per-campaign (`character.worldState`); shapes designed to lift into region-level shared state at v0.6.
- **v0.6.0 (this)** — Gambits (`engine/gambit.js`): declare a goal + up to 5 steps with optional fallbacks via the ⚙ Plan button. One cheap parse call classifies all steps (later steps auto-harden); Assess shows per-step odds through the sense filter, with the weakest link flagged for experienced planners (tier ≥ 2); execution resolves deterministically in order — partial = complication-but-continue, failure blocks and forces a decision: fallback / spend an adaptation point to reroll (Strategist aptitude grants an extra) / press on / abandon. The GM narrates the whole run cinematically from receipts (rule 15A). Steps count as planned actions (Strategist bonus applies) and feed the player profile.
- **v0.7.0 (this)** — character depth (`engine/progression.js`): **Sub-attributes** — strength/agility, reason/insight, presence/rapport, craft/wits; rolls target the sub (attribute × 20 base), parents derived for back-compat; new characters get 2 points to specialize at creation. **Leveling with choices** — each level banks a sub-attribute point and a skill point (spent from the sheet), plus attunement/reserves. **Skill trees** — every ability has 3 ranks with explicit grants/cannot/notFor in the abilities JSON, fed to the GM as ABILITY LAW (rule 2: treat as physics); ranks level-gated (2→lvl 3, 3→lvl 5); skill points rank up or learn new abilities (origin-gated; valley folk learn either tradition). **Novel use & combos** — intent parsing flags out-of-envelope or combined ability use: −15 to the roll, crit-fail band widens by 3, engine-applied backlash (−4 health/−10 energy) on crit failure — but a crit success is DISCOVERY-ELIGIBLE: the GM names a permanent technique (validated + clamped by the engine) that thereafter earns +10 with no novelty penalty. Works identically inside gambits.
- **v0.8.0 (this)** — maps & memory: **Scene-level art** — in generate mode the banner follows the scene anchor's setting (a cottage, a dock), stable-seeded per setting; static mode keeps bundled banners. **Sub-attribute tooltips** (SUB_DESC). **Interactive world map** — SVG node map from per-location `map` coords: current position, visited history, reachable-in-one-travel nodes clickable to travel, unvisited places shown as "?", danger-ringed. **Codex** (`engine/codex.js`) — the character's knowledge graph: typed topics (mystery/faction/lore/event/person/place) with day-stamped deduped facts and cross-links, written via clamped `codexUpdates` GM ops (rule 17), browsable/searchable from the sidebar, and surfaced contextually to the GM each turn (topics linked to the current location or active quests) so NPCs don't re-explain what you know.
- **v0.9** — shared world consolidation: ledger → region state, shared scenes/party play via `world/scenes/` polling, world-level time mode. NPC relationship arcs.

## Design pillars

1. The model never rolls, never decides outcomes, never edits state freeform — it narrates receipts and proposes typed deltas that the engine clamps.
2. Everything specific is content; the engine stays generic.
3. Reputation is earned from witnessed deeds — the world reacts to what you actually did.
4. The game learns the *player*, not just the character.
5. Graceful degradation everywhere: any AI failure yields a playable partial result.
