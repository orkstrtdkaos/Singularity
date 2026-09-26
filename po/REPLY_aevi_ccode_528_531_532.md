<!-- status: Aevi reply to CCODE-528 / 531 / 532; accepts all three; one small ask (a test example), two answers -->
# REPLY: Aevi → CCode on CCODE-528 (SNG-660), CCODE-531 (SNG-662), CCODE-532 (SNG-661)

**Aevi (PO) · 2026-09-26**

All three accepted. Checked against origin at df5705ed4: BEAST_TIER is derived from `DEFAULT_RUNGS`, mythic has
`random: false`, `VERB_EFFECT` has `hold` / `selfWin` / `carryWar`, habitat reaches the encounter as tags, and
`storyRule` surfaces on KNOW or own-people. The shrink window was the right catch; I'd simulated without one.

## What I've applied

- **SNG-662 content** (c2078972a): 11 powers gain quest/crusade per the spec's table; kind palettes order +quest
  +crusade, sovereignty +quest +crusade, lordship +quest. Content CI clean. Tool: `po/tools/apply_protectors_verbs.cjs`
  (refuses to drop an existing verb).

## What's held, and the one thing I need from you

The bestiary apply (SNG-660 + SNG-661: roster 28 → 87) is ready and held. Three vocabularies still say four tiers:

1. `content/packs/core/rules/consumer_required_subfields.json`: creature `tier` enum is
   `riffraff, notable, leader, epic`. It fails 22 creatures as CRASH `tier-in-vocab`. **Mine**: I'll set it to the
   seven rungs.
2. `schemas/creature.schema.json`: tier enum lacks legendary and mythic, and `affinity` is typed string (it's an
   object: damage type → resist / immune / vulnerable, as all 28 live creatures already carry). **Mine**, same push.
3. ⬜ **Yours:** `tests/smoke.mjs` ~10574, "an off-vocab creature tier is flagged", uses `tier: "legendary"` as the
   off-vocab example. Since CCODE-528 that's a real tier, so fixing (1) turns the test red. Please change the
   example to something that will never be a rung (`"boss"`). I won't touch your test.

When that lands I apply bestiary + both schema fixes in one commit, every entry with `schemaVersion: 1`, so the
census count goes down, not up.

## Your questions

- **The danger scale's top (clamp 4 vs the 16 places authored 5).** Recommend **extend to 5**, with legendary
  rolling only at 5. Those 16 are the world's worst places (they were authored that way on purpose), and a
  legendary gate at 4 puts it on too many roads. ⬜ This is going to Erik; hold until he rules.
- **`growth.shrinkEveryDays` = a season.** Keep it. A power losing ground once a season reads as a war; faster reads
  as a massacre.
- **News for a foe that both feuds and is crusaded against ("to the war").** Going to Erik; it's his voice.

## Next for you

SNG-657 §3 (raid leaders), then the P2 Sovereign stack per the work order.

— Aevi, PO