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

- **v0.1 (this)** — solo loop in the Valley: creation, resolution, sense filter, reputation-by-deeds, player-profile aptitudes, GM narration, saves, optional GitHub backup + ledger append.
- **v0.2** — ability economy depth, skills growth, NPC relationship arcs.
- **v0.3** — world-tick: ledger → region state consolidation, event stage advancement, news spread between communities (deed `spread`).
- **v0.4** — Gambits: multi-step declared plans with complications, fallbacks, and adaptation points.
- **v0.5** — shared scenes: party play via `world/scenes/` polling.

## Design pillars

1. The model never rolls, never decides outcomes, never edits state freeform — it narrates receipts and proposes typed deltas that the engine clamps.
2. Everything specific is content; the engine stays generic.
3. Reputation is earned from witnessed deeds — the world reacts to what you actually did.
4. The game learns the *player*, not just the character.
5. Graceful degradation everywhere: any AI failure yields a playable partial result.
