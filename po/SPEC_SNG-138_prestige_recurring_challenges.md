# SPEC — SNG-138: Prestige-driven recurring challenges (Saehara's ronin arc, and the pattern)
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik: "Brayden's Ronin should get regularly challenged by similar characters looking to gain prestige — part of his arc; pull from samurai tradition; magic/fantasy welcome."** The arc + challenger pool are AUTHORED + shipped + manifest-registered (below). This spec wires the RECURRENCE: challengers surface as his renown rises, each a duel.

## AUTHORED + SHIPPED (content, verified at origin + registered in valley manifest)
- **Arc `the_name_that_travels`** (`saehara_prestige_arc`, bound to Saehara/player-7bxzzd) — musha shugyō, the warrior's dueling pilgrimage. Prestige feeds challengers feeds prestige (the swordsman's paradox as the arc engine). 3 stages, 3 routes (**kensei** become-the-name / **brush** the-ronin-who-writes / **ganryu** undone-by-the-name), and the resolution is the TITLE of the book he's writing. Drawn from Brayden's authored bio (cogitant ronin, wicker hat, Honor-kanji, katana+tanto, "The Wind" as home, the book).
- **Challenger pool `saehara_challengers`** — 6 authentic duelists across prestige bands: a road-hopeful, a ryūha school-champion (Still-Water kenjutsu), a rival ronin (recurring), a ledger-keeping sworn rival, a **blazeborn fire-kensei** (magic+blade as one art), and **the nameless last blade** (the Ganryūjima beat, built from how Saehara walked the arc). Steel is one language; fantasy is canon (only 2 of 24 traditions fight by hitting things).

## THE WIRING (CCode) — recurrence off prestige
> **Verified at HEAD `v1.8.92` — this composes with built systems:** reputation is a VIEW over deeds (reputation.js — winning duels records deeds → renown rises); duels ALREADY run as SNG-098 skill battles (`def.type === "duel"` → contest panel, app.js L2963) with a guaranteed decline/flee path (L5740); there's even a `"witness_power"` reputation hook for challenge/duel encounters (L1299). **What's missing: nothing SPAWNS challengers as prestige rises.**
1. **A prestige-band tracker for the bound character.** Read Saehara's renown (deeds-driven reputation) and map it to the arc's `recurrence.escalationBands` (unknown → known → renowned → legendary). As renown crosses a band, the pool of eligible challengers shifts to that band.
2. **Surface challengers as encounters, paced.** On the encounter tick (SNG-127), for a character with an active `recurrence: {trigger: "prestige"}` arc, occasionally roll a CHALLENGER encounter instead of a generic one — pick from the current band's pool, mint the opponent (the challenger records carry `traditions`/`style` → `synthesizeOpponentSheet`), and present it as a duel OFFER (guaranteed decline path — critical for the "brush" route where he wins by refusing to cut). Frequency scales with renown + the player's pacing setting; never every beat.
3. **Win → deeds → renown → harder next.** A resolved duel records a deed (reputation.js) — the loop already closes; just ensure a challenge-duel's deed weight reflects the challenger's band, so beating a renowned duelist raises renown more than a road-hopeful. Losses (yield/flee) cost renown but aren't death.
4. **Stage + route tracking.** The arc's stages advance on band-crossings / defining duels (GM stage flags, like SNG-132); the s3 "last blade" is built from Saehara's history (spared/killed/taught) — the GM shapes it, never foreclosed.

## THE PATTERN (beyond Saehara)
A `recurrence` block on a bound arc (trigger + escalation bands + a challenger pool) is a REUSABLE arc type — any character whose arc is "the world keeps testing you as you rise" (a duelist, a wanted outlaw, a rising mage others fear) can use it. Saehara is the first; the recurrence engine is general. (Ties to SNG-133 — a generated personal arc could BE a recurrence arc when the backstory implies one.)

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/*` (recurrence) | `prestigeBand(character)` from renown; `pickChallenger(arc, band)` from the pool; a recurrence hook on the encounter tick that surfaces a challenger duel-offer for characters with an active prestige-recurrence arc. |
| `app.js` (encounter tick, SNG-127) | When a prestige-recurrence arc is active, occasionally route the roll to a challenger encounter (band-scaled, paced, decline-path guaranteed). |
| `engine/reputation.js` | Challenge-duel deed weight scales with the challenger's band (renowned win > road-hopeful win). |
| `engine/*` (skill battle) | `synthesizeOpponentSheet` builds the challenger from the pool record's traditions/style (already the path for duel opponents). |
| `tests/*` | As renown crosses a band, the eligible challenger pool shifts; a challenger surfaces as a duel OFFER with a decline path (never forced-lethal); beating a higher-band challenger raises renown more; the "brush" decline still advances the arc (win-by-refusal); recurrence never fires every beat (paced). |

## GUARDS
- **Always a decline/flee path** — every challenge is an OFFER (SNG-002b); never a forced lethal duel. This is REQUIRED for the "brush" route (winning by refusing to cut) and for player agency. Erik's "regularly challenged" ≠ "constantly forced to fight."
- **Paced, not spammy** — challengers scale with renown + pacing setting; a rising name draws more, but never every beat.
- **Magic/fantasy is canon** — challengers span traditions (blazeborn fire, mind-duels, fae blades); the duel is fought in the challenger's idiom, not only steel.
- **Never foreclose the arc** — climb/redefine/undone stays open; the s3 last-blade is shaped by Saehara's choices; the book's title is earned, not assigned.
- **Bound + private** — the arc + challengers surface in Saehara's play (promoted canon may become shared per SNG-128).
- **Register:** samurai dignity — restraint, honor, the weight of the draw — not gratuitous carnage (matches Brayden's authored tone).

## OPEN QUESTIONS — CCODE ROUND 2
1. Renown→band mapping: use `standingWithPeople`/settlement reputation, or a dedicated renown value from duel-deeds? (Recommend a duel-weighted renown read so the prestige loop is legible and self-contained.)
2. Challenger surfacing frequency formula — renown × pacing × a cooldown so it's "regularly" not "constantly"? Tune against SNG-127's encounter rates.
3. Does `synthesizeOpponentSheet` take a content record's `traditions`/`style` directly, or need a light adapter for the challenger-pool shape?
