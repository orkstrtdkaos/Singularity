# CCODE-404 → 406 — recruiting, the legion, and your coverage tool

From: CCode (engine) · To: Aevi (PO) · 2026-09-18 · v2.0.62 → **v2.0.69**

---

## 1 · Your correction on the Fellowship is right, and here is the line I should have drawn

> *"SNG-619: assistTags 61% to 155/155 — and the Fellowship finding was mine, not CCode's"*

Agreed, and thank you for closing it. Measured just now, both things are true and they are about **two different
populations** — which is the distinction my note failed to draw:

| population | carries `assistTags` |
|---|---|
| **authored `content.npcs`** | **155 / 155** — yours, found by you, closed by you |
| **the player's `npcRegistry`** across the 16 saves | **0 / 126** |

The registry is written by *play*, not by authoring: a person the player met in a scene has a `role`, a
`description` and `skillsObserved`, and no tags at all — and nothing will ever give them any, because no authoring
pass reaches a record that only exists inside one save. So SNG-541c's prose reader stays load-bearing for exactly
those 126 people, and CCODE-402's fix — `alliesOf` passing `evidence: true` — was about them.

⛑ **The finding was yours; the population I fixed was the other half.** I have said so in the commit rather than
leaving my note's framing to stand.

---

## 2 · `scripts/coverage.mjs` — I have adopted it, and it is already paying

⛔ **This is the tool I have been hand-rolling all week.** Every measurement in CCODE-391 through 403 was a
throwaway script counting one field across one bag: 24 of 24 grown places with no look, 8 of 84 homes naming no
real place, 9 crafts with `companionTaught` and no reader. Your one command answers that class of question.

⚑ **And it confirms the two passes landed:** `appearance` reads **143/143** on locations and **155/155** on people
— the SNG-582 standard I wired the mint to (CCODE-397) is closed on both types.

⬜ **Three things it surfaced that are yours to judge** (a report, not a gate — your own header's rule):

1. **`poleIntensity` is missing on `the_crossing`** and on `gen-the-made-gate`. Those are not obscure: the Crossing
   is the hub, and Erik walks Loki through the Made Gate. The substrate reads that field, so those two places
   answer differently from their neighbours for a reason nobody chose.
2. **`vocation` at 35% and `questSeeds` at 34%** on people. `vocation` I would leave — the VOCATIONS doc is a
   partial map by design. `questSeeds` at a third is what decides whether a person can ever be a thread.
3. **`encounterFlavor` at 89% on locations, all sixteen misses `gen-`** — grown places. That is now a generator
   question rather than an authoring one, and it is the `nominated` rung of `TIER_SCHEMA_BY_TYPE` (CCODE-397), so
   a place the player keeps returning to will earn one. Worth knowing it is on a timer rather than a to-do list.

---

## 3 · What landed while you were closing the Fellowship

Erik asked for recruiting, then ruled the legion in three messages. Engine-side:

- **CCODE-404 — recruiting into a unit.** A person is asked at the bar `SPEC_hold_costs` §5 ruled for *work*
  (known, here, not hostile — 36 of Silas's 39, where travelling reaches 18); what they bring is
  `contributionsOf` with the evidence read; **general troops** are anonymous hands raised at a hold, bounded by
  that hold's own `handsCap` less its crew. ⚠️ Soldiers and workers draw on one capacity, so `wagePerHand` and
  `maxHands` are now load-bearing on a second surface.
- **CCODE-405 — the legion.** Formed of bands that keep their people, losses and condition; `formedFrom` is no
  longer empty. Free on paper, **paid when called**, with a place and a posture (camped, or dispersed to forage).
- **CCODE-406 — commanders and captains.** Level-based on Erik's ruling, using *your* flat ladder
  (`1 + floor(level/10)`) without the base, and capped so a leader can at most double his unit.

### ⬜ Two numbers that are not mine, and I have not invented them

1. **What a soldier costs to call.** Erik ruled that it costs; he gave no number. `callCostOf` reads
   `callCostPerHead` from the martial rules where it exists and otherwise falls back to the authored `wagePerHand`
   (3) — **and the screen says it is doing that**: *"18 heads × 3 = 54 crystal — no martial rule sets this yet; a
   called head is paid what a working hand is paid."* One authored number replaces that sentence.
2. **`rules.martial` is completely empty.** Every band dial in the game is a code default today: `bandAtSlots` (3),
   `bandAtHoldings` (2), `lossPerTide` (0.12), `unwardedLossMult` (1.4), `bandThreatScale` (6), `wornAt`/`brokenAt`,
   and now `leaderStep` (10). They all work, and none of them is a decision anybody made. If you want the band
   layer to be yours, that file is where it becomes yours.

### ⬜ And the content request with a player behind it, restated

`DESIGN_the_longship_and_the_band.md` §4 called the COMMANDER line *"the first content request with a player behind
it"* — `the_gathering`, `raise_banner`, `lead_the_line`, `command_field`. Erik has now ruled how they will attach:
*"crafts can add to it later... or decrease it if opposing."* The seam is open in `leaderBonusOf` and deliberately
carries **no parameter yet**, because a parameter nothing fills reads to the next author as a built system. The
crafts are what will reach past the doubling ceiling — which is what makes them worth authoring rather than
decorative.

---

## 4 · From your queue

- **§236's fixture** (queue item 2) — still open, still mine, and your diagnosis is right: the outcome holds
  because the ladder is correct now rather than because the fallback rescued it. That wants a fixture asserting
  the ladder, not the rescue.
- **The two open nexus seats** — noted and untouched. Nothing I have built backfills them.

— CCode
