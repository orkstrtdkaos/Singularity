# SPEC — SNG-259: model the endgame — heroic + legendary in the simulation
## Aevi (PO) · 2026-08-02 · Erik's question: should the sim explore the endgame?

YES — and it's load-bearing, not optional, because we JUST tuned §1 (multiplier 10) and §3b (second-roll crits)
against a grid that STOPS AT EPIC. Verified in the engine, the game already HAS an endgame above epic:
- `engine/legends.js` power-tier spectrum: **legendary / epic → regional / notable → local / riffraff.**
  Legendary is the TOP tier (birth-weight 50 vs epic 45).
- `legends.js:52`: **a character at level ≥ 7 is tiered "legendary"** — players BECOME legendary, and earlier
  than the sim's L20 cap. Comment: "a legendary figure is earned by a developed character. Villains scale same."
- Legends are pursuable (SNG-208): legendary teachers to seek, great figures to aid or oppose, villain
  escalation. The fiction reaches into legendary; the SIMULATION never has.

**So both tools (roll_sensitivity, tradition_matrix) cap at `epic` (d:78) — one band below the top of the actual
game.** We have been balancing the endgame against its second-highest rung.

## Why this matters NOW (not later)
Everything we just decided gets its HARDEST test exactly where the sim doesn't look:
- **The ceiling-as-reserve reframe (Erik):** a master's reserve above 95 is "capacity for the death-dragon's
  lair." The death-dragon's lair IS the legendary band. If we never simulate it, we've asserted the reserve
  matters without ever measuring the encounter it's reserved FOR.
- **Second-roll crits:** legendary-vs-legendary is where BOTH sides pin near the ceiling and the CRIT dials
  decide everything — the crit model's whole point is to make the pinned-vs-pinned contest live. That contest
  only exists above epic.
- **Multiplier 10:** we confirmed the ladder holds through epic. Does a legendary player still meaningfully out-
  perform an epic one, and does a legendary ADVERSARY still threaten a legendary player? Unknown — unmodeled.

## The goal (Erik owns whether/how far; CCode owns the sim mechanics)
GOAL: **the simulation models the full arc the game actually supports — up through legendary player vs legendary
adversary — so the endgame is balanced on data, not assumed.**
1. **Add threat bands above epic** to both tools: a `heroic` and a `legendary` band (d-values scaled from the
   real tier weights — legendary sits ~as far above epic as epic sits above regional). CCode sets the exact d
   from the engine's own tier→difficulty mapping, not a guess.
2. **Add heroic + legendary PLAYER profiles** to roll_sensitivity's cast (today: novice→master). A legendary
   character (level ≥ 7, deep attributes, T3 crafts, entrenched skills) vs the new bands — does the reserve get
   spent? do the crit dials carry the contest?
3. **The key cells to expose:** legendary player vs legendary adversary (the true endgame), and legendary player
   vs epic/regional (does overwhelming capacity trivialise, as the reserve reframe INTENDS — that's a feature to
   confirm, not a bug to tune). Assert the ladder still holds at the top.
4. **Feed it back to §1/§3b:** re-read the multiplier-10 and crit-dial decisions against the FULL grid. If the
   legendary band changes the picture (e.g. attribute at ×10 leaves a legendary player too weak against a
   legendary foe), that's a tuning input we could ONLY have gotten by modeling the endgame. Likely it CONFIRMS
   the choices (the reserve is exactly for this) — but we measure, we don't assume.

## What's whose
- **Erik:** whether to model the endgame now (asked — leaning yes), and how the tiers map (is legendary a smooth
  extension of the curve, or does it have its own rules — e.g. do legendary contests lean harder on crits and
  matchup because raw chance is pinned for both? A design call the sim will inform).
- **CCode:** add the bands + legendary/heroic profiles to both sim tools (scaled from the engine's tier weights,
  not invented); report the endgame grid; assert the ladder holds up through legendary. This is a sim-harness
  extension, same shape as the CCODE-56 fix — cheap, and it closes the "we tuned against epic but the game goes
  higher" gap.
- **Aevi:** fold the endgame results into the §1/§3b read once CCode reports — confirm or revise the
  multiplier/crit decisions against the FULL arc.

## The honest framing
This doesn't change any decision yet — it TESTS the decisions we made against the band we didn't look at. The
reserve reframe PREDICTS that a master trivialises epic and only truly contests at legendary; second-roll crits
PREDICT that legendary-vs-legendary is decided by the crit dials. Both are testable, and neither has been tested,
because the sim stops one rung short of where the game's endgame actually is. Model it, and we either confirm the
endgame works as designed or we find the one place the new curve breaks — before a player ever reaches it.
