# Results — Prestige-driven recurring challenges (SNG-138)

Date: 2026-07-17 · HEAD `229ba67` · **v1.8.97** · full suite green · browser-verified (served bytes). Status: **shipped, complete_pending_review.**

Wired the RECURRENCE for Saehara/Brayden's ronin arc — the content (arc `the_name_that_travels` + the 6-challenger pool) was already authored, shipped, and manifest-registered. This ships the engine that draws challengers as his renown rises. Built as a **reusable recurrence arc type**: any bound arc carrying a `recurrence: {trigger:"prestige", escalationBands:[…]}` block gets the same behavior (a duelist, a wanted name, a feared mage — SNG-133's generated personal arcs can be recurrence arcs too).

## New engine — `engine/recurrence.js` (pure, ~110 lines)
- **`renownScore(character)`** — aggregate deed weight across all communities (a name travels; wins raise, losses lower). Chose net-deeds for legibility (OQ1) — the loop is self-contained: each challenger win records a band-scaled deed back into this same number.
- **`bandForRenown(renown, escalationBands, thresholds?)`** — walks the arc's own bands (`unknown → known → renowned → legendary`) by threshold; default thresholds (0 / 6 / 16 / 30) are arc-overridable via `recurrence.bandThresholds`. Never null-drops below the first band.
- **`findPrestigeArc(quests, defs)`** — the held quest instance carries only `arcId` (not the recurrence block), so it resolves the DEF from the catalog by arcId/id and confirms `recurrence.trigger === "prestige"`. Detects the *active* bound arc; ignores non-prestige / inactive.
- **`challengerPoolFor(def, pools)`** — resolves the pool from `content.challengerPools` (SNG-137's home) by shared `arcId` (the arc has no explicit pool-id field).
- **`pickChallenger(ids, challengers, rng, avoidId)`** — band-filtered, avoids an immediate repeat.
- **`challengerToDuelEntry(challenger, band, opts)`** — the ADAPTER. The challenger records are narrative-only (`concept/style/traditions/duelStakes`, no mechanical block); this maps one → a `routing:"duel"` encounter entry with `opponent{name, threat, tacticTags, fleeDifficulty, yieldAt}`. Threat scales by band; `tacticTags` are read lightly from the authored `style`; `traditions` thread into the seed so the duel reads in the challenger's idiom. Carries `_challengeBand`/`_challenger`.
- **`challengeDeedWeight(band)` / `challengeLossWeight(band)`** — a win is band-scaled (unknown 1 → renowned/legendary 3, within recordDeed's ±3 clamp); a loss costs the name modestly (−1).
- **`shouldFireChallenger(renown, band, paceMult, rng)` / `challengeCooldown(paceMult)`** — the paced fire test (a famous name draws more: base chance by band × pacing, capped 0.75) + a cooldown so it's "regularly", not "constantly."

## App wiring — `app.js`
- **`maybeRandomEncounter` (the travel/enter click-paths)** — a challenger gets its OWN paced roll *ahead of* the generic encounter, via `challengerOfferFor(trigger, pace.mult)`. It fires as a duel **OFFER** through the existing `fireEncounter` path — so the guaranteed decline (`"Back away — refuse the fight"`, `trivial`, SNG-002b) and the `def.type==="duel"` → SNG-098 skill-battle route come for free. A blade finds you on the move (travel/enter), not at rest. Cooldown + `_lastChallengerId` persist on the character.
- **`sbEnd(rr)`** — a resolved challenger duel records a **band-scaled deed** → renown → harder next challenger. Win (`opponent_fell`/`opponent_yielded`) raises; a real loss (`player_overcome`/`yielded`/`incapacitated`) costs −1; a clean break (`fled`) is neutral. The loop closes.
- **`random_encounters.js` `synthesizeDuelDef`** — passes `_challengeBand`/`_challenger` through onto the def (harmless `undefined` when absent) so the resolved duel can find its band in `sbEnd`.

## Why the click-path (not the narrative weave)
`maybeNarrativeEncounter` deliberately WEAVES a seed for the next GM turn (no card, no interrupt) — it can't render a deterministic offer beat without clobbering the turn's own render. A duel challenge needs the real OFFER beat (decline path + skill-battle routing), which only `fireEncounter` produces cleanly, and only the click-paths (`maybeRandomEncounter` at travel/enter) return-and-skip safely. Travel is also the natural moment — *the name that travels* draws blades onto the road. So challengers fire as offer beats on travel/enter; ambient narrative encounters keep weaving as before.

## ROUND-2 answers (OQs)
1. **Renown→band:** a self-contained duel-fed renown = aggregate deed weight; each win records a band-scaled deed, so the prestige loop is legible and closes on itself (no dependence on per-community standing).
2. **Frequency:** base chance per band × `resolvePacing` mult (Calm→Relentless), capped 0.75, plus a pacing-scaled cooldown — scales with renown + the player's pacing, tuned under SNG-127's rates.
3. **Adapter:** `synthesizeDuelDef`/`synthesizeOpponentSheet` do NOT read `traditions`/`style` — they want a light `entry.opponent{threat,tacticTags,name}`. So `challengerToDuelEntry` is the needed adapter (band→threat, style→tacticTags, traditions→seed); once shaped, the whole existing duel path runs unchanged.

## Guards honored
- **Always a decline/flee path** — every challenge is an OFFER with a `trivial` refuse choice before engagement; engaging routes to SNG-098 with in-battle flee/yield. Never a forced lethal duel (required for the "brush" win-by-refusal route).
- **Paced, not spammy** — band-scaled probability + cooldown + the player's pacing; a rising name draws more, never every beat.
- **Fought in the challenger's idiom** — `traditions` (blazeborn fire, syllogist mind-duel, somatic steel) thread into the seed; magic/fantasy is canon.
- **Losses aren't death** — yield/flee exist; a loss costs renown, not a life.
- **Bound + private** — only the character with the active bound arc draws its challengers; `findPrestigeArc` matches by arcId + active status.
- **Reusable** — nothing is Saehara-specific; the recurrence block + a challenger pool with matching `arcId` is the whole contract.

## Verification
- **23 smoke tests:** renown sum; the band ladder + threshold override + never-null-drop; `findPrestigeArc` (active-only, prestige-only, by arcId); pool-by-arcId; `pickChallenger` band-filter + avoid-repeat; the adapter's duel entry (opponent block, band-scaled threat, traditions in seed); `_challengeBand` survives `synthesizeDuelDef`; `buildOffer` gives the guaranteed decline; band-scaled win / modest loss weights; the paced fire test (rng bounds + band-scaling) + cooldown; **and end-to-end against the REAL authored arc + pool on disk** (every escalationBand id exists in the pool; a renowned Saehara draws a real challenger as a valid duel). Full `npm test` green.
- **Browser-runtime, served modules (cache-busted, fresh port 8397):** 7/7 — the band ladder, arc+pool resolution, the renowned-Saehara end-to-end duel, the guaranteed decline path, band-scaled deed weight, the paced roll; served `app.js` carries the `challengerOfferFor` hook + `sbEnd` deed hook + recurrence import; v1.8.97; boot-clean.
- **Not reachable headless:** the actual in-play sequence (travel with the arc active → a challenger offer appears → decline or fight it as a skill battle → renown rises → a harder challenger next) needs a keyed play session with Saehara having taken the arc. The engine (who/when/worth) is fully verified; the offer/decline/skill-battle machinery it rides is the shipped SNG-098/SNG-002b path.

## Files
`engine/recurrence.js` (new) · `app.js` (challengerOfferFor + maybeRandomEncounter hook + sbEnd band-scaled deed + import) · `engine/random_encounters.js` (`synthesizeDuelDef` band passthrough) · `tests/smoke.mjs` · `index.html` (v1.8.97).
