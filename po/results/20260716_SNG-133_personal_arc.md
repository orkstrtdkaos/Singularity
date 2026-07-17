# Results — Every backstory seeds a personal quest arc (SNG-133)

Date: 2026-07-16 · HEAD `be1e106` · **v1.8.92** · full suite green · browser-verified. Status: **shipped, complete_pending_review.**

Brooklyn proved the pattern (Aelyn's bio WAS an arc — hand-authored as SNG-132). This makes it automatic: every character is born with a **primary personal arc** generated from the story they wrote, bound to them so SNG-132's runtime surfaces + paces it with no extra wiring.

## The build — `engine/personalArc.js` (new, pure)
- **`arcSeed(character)`** — maps the bio fields to arc inputs (motivation/story/hometown/livelihood/origin/domains) and flags a **thin** bio (→ modest hook) vs a rich one (→ epic).
- **`fallbackPersonalArc(character)`** — a light, **LLM-free** bound arc that is **always present** (SNG-133 "never zero"): premise + stakes from the bio (motivation, home), 3 stages, routes from the character's domains, `boundToCharacter`/`boundToPlayer`/`arcId`. Deterministic; scales down for a thin backstory. Validates as a real structured quest (`isRealQuest`).
- **`buildPersonalArcPrompt(character, {ratingLine})`** — `{system,user}` using the bio facts + **the SNG-132 arc (`the_reaching_light`) as the few-shot exemplar and quality bar**, mythic-tragic register, "use ONLY what the bio gives," ceiling-bound. No generic fetch quests.
- **`sanitizePersonalArc(raw, character)`** — coerces a model arc into the bound-arc shape (name/premise/stakes/3-stages/routes/outcomes) + embeds the **catalyst legend NPC** inline; falls back to the light arc on any malformed field (a hiccup never yields a broken arc).

## The hookup — `app.js`
- `finish()` seeds `character.personalArc = fallbackPersonalArc(character)` **synchronously** (creation never waits, never zero) + a creation aside: *"Your story has become a thread here: {name}."* Then `enrichPersonalArc(character)` fires **best-effort in the background** (model → sanitize → update; **no API key → the fallback stands**).
- The arc is included in the `availableStructuredQuests` catalog at both offer sites, so it surfaces via the **SNG-132 bound gate** (only for its character, ignoring proximity, paced).
- `structuredQuestsForGM` now reads an arc's **embedded** `legendNpc` first — a generated arc carries its legend inline, so it surfaces to the GM stage-gated with no catalog entry needed.

## ROUND-2 answers
1. **Synchronous or lazy?** Both — a synchronous fallback (ready instantly, the player sees their story was heard) + a background model enrichment (no creation latency; degrades to the fallback without a key).
2. **Re-generation on bio edit?** Locked once created (no silent auto-reweave); a central arc shouldn't change under the player.
3. **Catalyst NPC registered?** Embedded on the arc (`legendNpc`); the GM introduces + registers it (via `npcUpdates`) on first meeting, so it recurs with a stable identity without a phantom "already-met" entry.

## Guards honored
- **Never foreclose the ending** — generated arcs carry open routes; `notes_for_gm` says the ending is the player's (inherited from SNG-132).
- **Quality + register** — the SNG-132 arc is the exemplar + quality bar; mythic-tragic/heroic as the story warrants; no generic personal fetch-quests.
- **Scales to input** — rich bio → epic; thin → modest hook; empty → origin-seeded thread. Always something.
- **Bound + private + paced** — one primary arc per character, surfaces in their play only, unfolds across sessions.
- **Rating-aware** — the enrichment prompt carries `ratingLineForGM()` (the GM's ceiling).

## Verification
- **9 smoke tests:** the fallback is a valid bound structured quest (stakes + 3 stages + outcomes, `isRealQuest`); seeds premise/stakes from the bio + routes from domains; a thin bio still yields an arc; `arcSeed` thin-vs-rich flag; the arc surfaces for its character only (SNG-132 gate); the prompt is facts-only + exemplar + ceiling; `sanitizePersonalArc` coerces a model arc + embeds the legend; malformed → fallback; the embedded legend surfaces to the GM stage-gated + never-foreclosed. Full `npm test` green.
- **Browser-runtime, served module:** the fallback ("The Thread of The Hidden Forest") is a valid bound quest that surfaces for its character only; the sanitized arc embeds Caelum + surfaces stage-gated to the GM. 3/3. Boot-clean on 8229.
- The live model-enrichment *feel* (a rich bio → an epic arc at the SNG-132 bar) needs an API key + a real creation flow — that's the eyeball-in-keyed-session part; the always-present fallback + all structure are verified.

## Files
`engine/personalArc.js` (new) · `app.js` (finish() seed + creation aside + enrichPersonalArc; personalArc in the offer catalog) · `engine/quests.js` (structuredQuestsForGM reads embedded legendNpc) · `tests/smoke.mjs` · `index.html`.
