# Results — Bound legendary arcs + content-generator flag (SNG-132)

Date: 2026-07-16 · HEAD `a90e7a4` · **v1.8.91** · full suite green · browser-verified. Status: **shipped, complete_pending_review.**

Aevi authored + shipped the NPC (Caelum, the fallen Seraph) and the arc (`the_reaching_light`); this wires them to fire in Aelyn's play and flags Brooklyn/Brayden as canon-authors.

## The registration gap (found + fixed)
The arc `quests/the_reaching_light.json` was on disk but **never loaded** — the manifest's `provides.quests` was `["quests.json"]` and the loader only accepted `{quests:[…]}`/array shapes, so a standalone arc object loaded as empty. Fixed: the loader now accepts a single standalone quest/arc object (`qf.id ? [qf] : []`), and the manifest registers the arc path. Confirmed loaded (`CONTENT.quests` now carries *The Reaching Light*; `CONTENT.npcs.the_lightless_seraph` loads). This is also what SNG-133's generated arcs will rely on.

## ROUND-2 answers
- **Q1 (does the SNG-112 gate support a bound bypass?)** — no; added it. `availableStructuredQuests` gains a `boundToCharacter`/`boundToPlayer` branch: a bound legendary arc **ignores the proximity gate** and surfaces **only** for its character/player (matched by name or playerKey), never anyone else — even on a bare board. It follows the character, not a location.
- **Q2 (where to put the content-generator boost?)** — a **multiplier** at mint (`birthWeightOf`): a flagged author's content starts ×1.5 heavier, so it wins realness contests + promotes into shared family canon more readily (SNG-128). A multiplier keeps authored core (weight 100) outranking. Flag set on `player-7fah99` (Brook) + `player-7bxzzd` (Drizzy); the app threads `contentGenerator` into the generate context.
- **Q3 (stage advancement trigger?)** — GM stage flags (the existing structured-quest `questUpdates` path). `structuredQuestsForGM` now feeds the arc's `legend` NPC to the GM as a **distant, turning-toward-this-character presence**, escalating **only as stages complete** (`stage i/n`) — a slow gravity, never a dump; and the block states the ending is **hers to decide, never foreclosed**.

## Guards honored
- **Never foreclose the ending** — the GM block explicitly says so; the arc's routes (reach / release / become) stay open.
- **Pace it** — the legend escalates by stage, not location; the arc surfaces as one offer, then unfolds.
- **Bound + private** — surfaces in Aelyn's play only; promoted canon may still become visible via the SNG-128 lens.
- **Content-generator additive** — a multiplier that lowers no one else's threshold and never eclipses authored core.

## Verification
- **6 smoke tests:** a bound arc surfaces for its character ignoring proximity; never for a stranger (even a bare board); matches by playerKey (survives a rename); the legend feeds the GM a stage-gated presence with "never foreclose"; the content-generator birthWeight is boosted yet stays under authored-core weight. Full `npm test` green.
- **Browser-runtime, real content:** the arc + NPC now load; the real arc surfaces for its bound character only; the served `birthWeightOf` boost applies. 4/4. Boot-clean on 8227.

## Files
`engine/state.js` (single-object quest loader) · `engine/quests.js` (bound-arc surfacing + legend-presence GM block) · `engine/generate.js` (contentGenerator birthWeight boost) · `app.js` (thread contentGenerator; pass npcs to structuredQuestsForGM) · `content/packs/valley/manifest.json` (register the arc) · `players/player-7fah99|7bxzzd/profile.json` (contentGenerator flag) · `tests/smoke.mjs` · `index.html`.
