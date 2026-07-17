# Results — Encounter dead-zone fix + pacing (SNG-127)

Date: 2026-07-16 · HEAD `72a668c` · **v1.8.85** · `npm test` green · browser-runtime verified. Status: **shipped, complete_pending_review.**

Erik: *"I've never encountered a fight or any event — crank up the chances everywhere."* The base rates were fine; the fix is surgical — a **missing config** + a **suppressor stack** + a **0-hour blind spot** — and everything is now config- and player-tunable.

## ROUND-2 answers
- **Q1 (is `maybeNarrativeEncounter` called every narrative turn?)** — yes, unconditionally from `applyTurn`. So the gate was purely the suppressors + the missing rate.
- **Q2 (is `hoursPassed` reliably populated?)** — NO, and this was a *second* dead-zone. A normal beat emits no `timeOps` (the contract says "a normal beat needs no timeOps"), so `turn.timeOps.hoursPassed` was `undefined → 0` → `classifyNarrativeKind` returned `"none"` → the path bailed before rolling — even though the clock ticks `+1h` (`ADVANCE.beat`) every beat. Fixed with `beatHours()`: an **undeclared** beat is floored to `minHoursPerBeat` (=1, matching the beat tick); a **declared** short beat keeps its real (quiet) hours.
- **Q3 (what rate does it actually yield?)** — measured, not guessed (below).

## The fix (config-tunable, not a blanket multiply)
1. **The missing rule (the actual dead-zone).** `random_encounters.json` had no `onNarrativeTime`, so the engine fell back to a hardcoded `0.04/hr` → near-silence in chat play. Added `onNarrativeTime: { ratePerHour: 0.14, maxChance: 0.6, minHoursPerBeat: 1, cooldown: 1 }`.
2. **Click-path bumps.** `onTravel` 0.35→0.45, `onEnterLocation` 0.12→0.20, `onRest` 0.15→0.20.
3. **Loosened the suppressor stack.** The permanent once-per-scene cap is now **soft** — `sceneEncounterFired` adds +2 spacing after the first fire rather than blocking the whole scene (most play is one long narrative scene, so the hard cap was a huge part of the dead-zone). Cooldown 3→1 (now from pacing). The intense/intimate + combat/gambit suppressors are **kept** (never interrupt a kiss or a duel — SNG guard).
4. **Everything tunable.** Rate, cap, floor, cooldown, and the pacing multipliers all live in `random_encounters.json` — the next "more/less" is a JSON edit, never an invisible code fallback.
5. **Player-selectable pacing (the durable "crank it").** `profile.pacing` ∈ Calm / Balanced / Eventful / Relentless, set in Settings. `resolvePacing` reads `pacingModes` from config → `{mult, cooldown}` applied to **every** roll (narrative + travel/enter/rest). Default **Balanced**; a new or family player can pick **Eventful** so their first sessions feel alive. Stored on the profile like the SNG-120 sidebar preference — every character dials its own world.

## Guards honored
- **Decline/flee before lethal** — untouched (`lethalRule`/SNG-002b): more encounters, same consent-before-danger.
- **Danger-weighting** — `×(1 + danger×0.1)` unchanged: dangerous places still skew fights, kind places skew grace; the valley stays hopeful-strange. Fights route into the SNG-098 skill-battle panel.
- **No mid-kiss/mid-duel interruptions** — the intimate/grief/combat suppressors stay.

## Verification — measured, not asserted
- **12 new smoke tests** incl. a **400 × 30-turn Monte-Carlo**: an undeclared beat is floored to a real hour and now yields a non-zero chance; a declared short beat stays quiet; the config carries the rule + pacing modes + bumped click rates; `resolvePacing` reads modes and defaults/falls-back to balanced; pacing scales the chance (Relentless > Balanced > Calm); **a 30-turn session averages > 1.5 encounters**, **< 25% of balanced sessions are silent**, and **Relentless > Balanced > Calm**. Existing SNG-075 rate tests updated to the new (louder) rate. `npm test` fully green (smoke + parse + content_ci + balance + skill-battle).
- **Browser-runtime, real served content:** the live 30-turn simulation against the actual `random_encounters.json` — **Balanced 3.0, Relentless 6.2, Calm 1.6 encounters per session** (was effectively 0 — the dead-zone). `beatHours`/`narrativeTimeChance`/`resolvePacing` all correct. Boot-clean on 8211, `?v=1.8.85`, no console errors.
- The in-play *feel* (events actually surfacing every few beats, the Settings pacing selector changing frequency) is the part to confirm in a keyed session — the numbers above are the mechanism proof.

## Files
`content/packs/valley/events/random_encounters.json` (onNarrativeTime + pacingModes + bumped click rates) · `engine/random_encounters.js` (resolvePacing, beatHours, `mult` on narrativeTimeChance/rollNarrativeTime/rollTrigger) · `app.js` (maybeNarrativeEncounter — pacing cooldown/mult, beatHours floor, soft scene gate; maybeRandomEncounter pacing mult; Settings pacing selector + persist) · `tests/smoke.mjs` · `index.html`.
