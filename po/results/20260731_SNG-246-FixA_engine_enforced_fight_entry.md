# SNG-246 Fix A — the engine enters the fight, not the GM's memory

**CCode · 2026-07-31 · v1.8.317 (`c72223fd`) · npm test exit 0 (19 seams, rawProseCaps 63) · boot verified on a never-used port.**

Erik's ruling: **"c with b backup like you said."** Built exactly that.

This closes the oldest open ticket in the combat line — and the root of his very first complaint back at CCODE-33:
*"one action ended it in pure prose."*

## The gap

A committed killing blow resolved as **one prose roll**, because entry into a structured fight depended on the GM
remembering rule 18. Everything else built this session — the turn structure, the pre-clamp stack, persistent
effects, priced moves, functional items — sits *inside* a skill battle. If the fight never becomes one, none of it
runs.

## (c) — the engine resolves the target the player actually chose

New pure `harmTargetFor(action, ctx)` in `engine/intent.js`, in two steps:

1. an explicit `targetNpcId` / `targetName` already on the choice;
2. else a **registered** NPC whose name or alias appears in the choice label or in the player's own exact words.

That second step is the same matching `personDestination` already uses, deliberately — so both agree on what counts
as a person, and a name that reads as a person in one path can't read as a place in the other.

When it resolves, `onChoice` calls the new `escalateToFight(target, choice)`: the engine **mints** a duel against
that named person via `synthesizeDuelDef`, synthesizes the opponent sheet, writes `character.activeEncounter`, and
**enters it as a real skill battle**. Threat comes from the registry when the NPC is known, else from
`hereNow().dangerLevel * 12` clamped to 20–70. No prose-only fight, no waiting on the GM to cooperate.

## (b) — when no target resolves, it refuses to invent one

`harmTargetFor` returns **`null`** rather than guessing. That refusal is the design, not a gap in it: a guessed
opponent is the same failure class as `seam_travelTo_is_place`, where a *person* got minted as a travel
destination. Inventing an opponent to satisfy a rule produces a phantom the player never met.

On `null`, the engine sets `pendingFightFraming`, and the next GM turn carries a HARD directive —

> the player has COMMITTED to violence… you MUST present it as a bounded FIGHT and emit `newEncounter` for the
> person they are attacking (name them from what you have already narrated).

The engine still decides that a fight **must be structured**. It borrows only the GM's knowledge of *who is standing
there* — the one fact the engine legitimately doesn't have.

## The gate caught my wiring, again

The wiring audit **failed the first run**:

> `fightFramingDetail` — consumed but NEVER provided — can never land.

I had threaded the key through `gm.js` and `app.js` but never registered it in `gm_registry.js`, so the whole (b)
fallback would have been **silently dead** — the exact "advertised but inert" class CCODE-48 was spent cleaning up.
Registered with its full `reachedBy`.

That is the **third inert path the audit has caught this session** (the others: `phaseDenied` with no consumer, and
`skillBattleRound` silently dropping its options). It is worth its weight.

## Verification

5 new checks. The load-bearing one:

> *an unresolvable target returns NULL — the engine never invents a person*

because that single property is what makes (c) safe to run automatically. The others cover explicit-id resolution,
alias-in-label resolution, exact-words resolution, and that an unregistered name doesn't resolve.

`npm test` exit 0 across every gate. Boot verified live on **never-used port 8431**, no console errors.

## SNG-246 is now fully closed

**A, B, C and D are all shipped.** Fix C was completed across the session rather than as one ticket: `frameExits`
surfaces defeat/flee/fail, CCODE-42 gave the finish condition honest situational odds, and CCODE-39 made energy a
real state with real exits. The only remnant is the **fight→chase morph being visible**, which is cosmetic and small.

## What is left, honestly

Nothing structural. The whole combat line has been built without Erik ever playing it with a live API key — the two
GM calls, the whole-fight narration, and the Haiku quick beat are all still theoretical, verified only as code paths
and failure paths.

**The next useful thing is his combat log, not more code.**

## Files

`engine/intent.js` (`harmTargetFor`) · `app.js` (`escalateToFight`, the `onChoice` hook, `pendingFightFraming`,
`fightFramingDetail`) · `engine/gm.js` (the HARD directive section) · `engine/gm_registry.js` (the registration the
audit demanded) · `tests/skill_battle_sim.mjs` (+5 checks) · `index.html` (v1.8.317).

*— CCode. The engine now decides that a fight is a fight. status: complete_pending_review.*
