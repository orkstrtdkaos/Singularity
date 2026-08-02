# SPEC — SNG-260: two-spectrum tiers, L100 pacing, and the skill-breadth cap
## Aevi (PO) · 2026-08-02 · grounded in Silas + Cellaceron saves (real pacing data)

Erik gave three interlocking things + real playthrough data. They're one decision cluster because they share the
level economy: the tier bands, the game-length target, and the breadth cap all key off "what level means."

## The playthrough data (from the actual saves — this is the calibration)
- **Silas Weir: level 29, 36 crafts known, ranks {1:27, 2:5, 3:4}.** ~1 arc (Water contamination) complete,
  thorough. Erik's read: "just begun establishing himself as a HERO." → **heroic starts ~L29.**
- **Cellaceron: level 11, 9 crafts, ranks {1:5, 2:3, 3:1}.** ~1 arc, less complete. Erik's read: "between ADEPT
  and MASTER." → **adept/master boundary ~L11.**
- **Erik's pacing target:** one arc felt like a lot but is just ONE; a full game = 3-5 arcs ≈ **~L100**. So the
  whole level→tier and sim must be recalibrated to a ~L100 complete-game arc, not the old short economy.
- **The tell Erik named:** Silas has 36 crafts but **27 are still rank 1** — breadth without depth. "The idea
  early was one character could learn the majority of the game's skills; that's not practical, and the skills a
  character HAS is what differentiates them." → cap breadth, force broad-vs-deep choices.

## §A — TWO PARALLEL TIER SPECTRUMS (Erik clarified — this is the reconciliation)
There are TWO spectrums, and they should stay SEPARATE but ALIGNED by power level, not merged:
- **PLAYER side:** novice / adept / master / heroic / legendary (what the CHARACTER is)
- **OPPONENT side:** riffraff / notable / regional / epic / legendary (what a THREAT is)
GOAL: don't rewrite a bunch of stuff — keep both vocabularies, but reconcile them onto ONE underlying power-level
scale so they're never buggy/contradictory. Mechanism (CCode's to design): a single numeric power-level (call it
powerBand 0-4 or a level threshold) that BOTH names map onto — tierForArc returns the band, and each side renders
its own WORD for that band. So a "master" player and a "regional" threat are the same powerBand and contest
evenly; the engine reasons in bands, the UI shows the right vocabulary per side. legendary is shared at the top.
This keeps Erik's two naming sets AND guarantees they can't drift, with no big rename — just a band layer under
the two label sets.

## §B — RECALIBRATE THE BANDS TO A ~L100 GAME (from the save data)
The old tierForArc (legendary at L7) assumed a short game. With ~L100 as complete and the save anchors, proposed
bands (Erik tunes; anchored to Silas L29=heroic-start, Cellaceron L11=adept/master):
| powerBand | player name | opponent name | level (proposed) | anchor |
|---|---|---|---|---|
| 0 | novice | riffraff | L1–10 | early |
| 1 | adept | notable | L11–25 | Cellaceron L11 = entering this |
| 2 | master | regional | L26–45 | — |
| 3 | heroic | epic | L46–70 | Silas L29 "just becoming heroic" ⇒ maybe heroic starts lower (~L29–35); Erik to place |
| 4 | legendary | legendary | L71–100 | the endgame |
NOTE a tension to resolve with Erik: he reads Silas (L29) as "just becoming heroic," which would put heroic
~L29, not L46. Two options: (a) heroic starts ~L29 and the bands compress low, or (b) Silas is actually
entering MASTER (L26-45) and "hero" is his STORY role not his power tier. This is Erik's call — the SAVE says
L29, the FEEL says heroic; reconcile the number to the feel. The bands above are a first draft to move.

## §C — THE SKILL-BREADTH CAP (mechanism EXISTS — just needs the right curve)
FINDING: the cap is already built + ratified. `content/packs/core/rules/skill_capacity.json` →
`skillsKnownByLevel` (L1=2, then linear level+1), enforced via `atCapacity`/`breadthCap`/`breadthUsed`, shown in
the UI ("X of Y crafts — at capacity"). **The problem is the CURVE is linear (level+1), so it barely caps** — at
L100 it allows 101 crafts, and Silas at L29 sits at ~30+ (with story-grants/braids on top pushing him to 36).
That's why breadth runs away.
GOAL: **set the breadth cap (the BASE number of distinct crafts) per TIER, tuned so a character is DIFFERENTIATED
by their kit — you canNOT learn most of the game.** Braids, discoveries, and bonus/story-granted skills are
ALWAYS possible ON TOP of the base (they already bypass the cap by design — `powerSystem !== "learned"` and the
grant path skip `atCapacity`). So the base cap defines the CHOSEN, point-bought kit; the extras are earned
narrative breadth.
METHOD (Erik asked for this explicitly): **use the sensitivity analysis + synthetic characters to find the right
base number per tier.** A synthetic with N crafts at tier T — how does breadth trade against depth (ranks)? Find
the N where a character is effective but SPECIALIZED (can't cover everything), so kit becomes identity. The
tradition_matrix already builds synthetic kits; extend it to sweep BREADTH (crafts-known) against depth and
report where differentiation is healthy vs where breadth trivializes. Then set skillsKnownByLevel to a curve that
FLATTENS (not linear) — e.g. generous early, plateauing so a legendary character holds maybe 12-18 CHOSEN crafts,
not 40. Exact numbers from the sweep.

## What's whose
- **Erik:** the band level-cuts (§B, esp. where heroic starts — the Silas L29 tension), and the breadth-cap
  targets per tier once the sweep shows the tradeoff (§C).
- **CCode:** the powerBand layer under the two label sets (§A — the no-rename reconciliation); extend the
  sensitivity/matrix tools to sweep BREADTH vs depth (§C method) and report; then set skillsKnownByLevel to the
  chosen curve. Also: the SNG-259 endgame bands + SNG-259b tierForArc fold INTO §A's powerBand (one source).
- **Aevi:** author the skillsKnownByLevel curve + tierForArc bands once Erik picks the cuts + the sweep lands;
  reconcile the two naming sets in the content/UI layer.

## Sequencing — this SUPERSEDES/absorbs 259 + 259b
§A (two-spectrum powerBand) is the reconciliation 259b needed; §B is 259b's bands done right (on save data, to
L100); §C is new. And the SNG-259 endgame sim should use §A's powerBand so adversary difficulty + character tier
+ the sim all speak ONE scale. Order: (1) CCode builds the breadth-vs-depth sweep (cheap, unblocks §C) + the
powerBand layer; (2) Erik sets band cuts + breadth targets on the data; (3) Aevi authors the curves; (4) the
SNG-259 endgame sim runs on the unified bands. One coherent pass, not four scattered ones.
