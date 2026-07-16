# Results — SNG-098 Phase C: the skill-battle duel UI

Date: 2026-07-16 · HEAD `04a6b40` · **v1.8.79** · `npm test` green · browser data-path verified · boot-clean. Status: **Phase C shipped — SNG-098 (A+B+C) complete, complete_pending_review.**

The playable front end over the tested engine (A) + routing (B). A duel now opens the two-sided contest panel with the fog of war Erik asked for.

## What shipped
- **The panel (`renderSkillBattle`)** — a duel spawns with a synthesized opponent sheet and runs as a skill battle by default when the engine is loaded (`def.skillBattle: false` keeps the classic single-margins duel as fallback). The GM narrates the opening scene, then the panel takes over the rounds:
  - **Declaration:** the player's abilities become contest skills (`functions[0]` → function, rank → tier, effective energy cost shown), plus steel-and-wit fallbacks (a plain strike, a raised guard) so a lattice-starved caster still fights. An intensity dial (conserve / standard / surge).
  - **Momentum meter** (bidirectional) + your hp/energy; `skillBattleRound` resolves both sides and the player's health/energy attrition is applied each round.
  - **Fog-gated opponent panel** — `senseOpponent` at the viewer's tier: outcome-only (blind) → intent → +band → full SNG-106 breakdown ("see their math", via the existing `data-breakdown` popover). Never a fabricated number at a low tier.
  - **"Read them"** spends the round scouting and **buys a tier** of the read (tempo vs information). **Break away** rolls the flee check; **Yield** ends it.
- **Resolution → the GM:** on `opponent_fell / opponent_yielded / yielded / fled / player_overcome / stalemate / incapacitated`, the encounter clears and the outcome is handed to the GM to narrate the aftermath and return to the scene.
- **Resume:** a mid-battle reload re-opens the panel (never stranded mid-fight).
- **CSS** for the meter / fog / intensity / breakdown link.

## Verification
- Engine (Phases A+B): `skill_battle_sim.mjs` — 32 checks incl. the fog-is-presentation-over-true-state invariant and the round → duel-lifecycle mapping. Green.
- **Browser data-path, through the actually-loaded CONTENT** (the exact calls `sbDeclare`/`renderSkillBattle` make): a duel spawns as a skill battle → a declared round shifts momentum to +10 and resolves `opponent_fell` with the player's energy attrition applied → `senseOpponent` at attunement-5 reveals outcome/intent/band with **no numeric field** → "read them" buys a higher tier. Boot-clean; `node --check` clean.
- **What needs your playtest:** the GM-narrated **opening and aftermath** (they need a live API key) and the overall combat *feel* (round pacing, opponent policy, balance of momentum vs attrition). The mechanics, spawn, fog gating, and resolution are proven; the narrated bookends and tuning are the live-play part.

## Notes / forward
- **Default-ON for duels** is the spec's intent ("the model PvE duels run on"); `skillBattle: false` on a def forces the classic path if any set-piece needs it.
- **PvP** remains the flagged follow-on — the engine is already symmetric; swap `opponentPolicy` for a second human declaration and each side reads the other through its own `senseOpponent`.
- Opponent-move narration is currently the engine's fog line, not a per-round GM call (keeps it snappy + free); a future option is an optional GM flourish per round.

## Files
`app.js` (renderSkillBattle + sbDeclare/sbFlee/sbEnd + playerBattleSkills; encounter-start spawn; enterPlay resume) · `style.css` · `index.html`. (Engine/routing shipped in Phases A+B: `engine/skill_battle.js`, `engine/sense.js`, `engine/encounters.js`, `content/.../skill_battle_system.json`.)
