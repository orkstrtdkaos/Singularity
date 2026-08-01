# NOTE — SNG-255 candidate: the static-antagonist 8.3% (a design frame, not a tuning number)
## Aevi (PO) · 2026-08-01 · from CCode's balance report

CCode flagged static antagonists (puzzles/hazards/sealed doors) resolving at 8.3% — the clear outlier (fight/
standoff/chase all cluster ~35-45%). CCode correctly named this Erik-and-Aevi territory. I traced it rather than
tune blind; here is the honest cause and the decision.

## Why 8.3% — the STRUCTURAL cause (verified in skill_battle.js:243-248)
A static thing does NOT roll. `margin = staticResist(18) + contestMods` and the player must UNILATERALLY clear a
fixed DC (bands: +15 = success, +40 = crit). Every OTHER kind is a CONTESTED roll — both sides roll, the margin
is a DIFFERENCE, so a good roll or a matchup edge WINS. Against a static thing the player fights a wall that never
slips: no opponent roll to beat, no mistake to exploit, no momentum swing. That structural asymmetry — flat DC vs
contested roll — is why it's the outlier, not a mis-set number.

## The DESIGN question (Erik's call) — is 8.3% right, wrong, or right-but-mis-framed?
Three honest readings:
1. **8.3% is CORRECT and the framing is the problem.** A sealed door SHOULD be hard to force in one exchange —
   but a puzzle is not meant to be WON in one roll like a fight; it's meant to be UNDERSTOOD over several (the
   `give`/`defaultGive: 60` is spent DOWN by pressure ticks — each read loosens it). If the report measured
   "solved within N rounds" instead of "won this round," static might not be an outlier at all. The 8.3% may be
   comparing a multi-round yield to single-round wins — an apples-to-oranges base rate, the same class as the
   "signature situation" artifact CCode just fixed. **Lean: check the measure before tuning the content.**
2. **The right APPROACH should matter more.** My matchup matrix says break/open/transform beat `ward` (+3/+3/+2)
   — the static hold IS ward. So a player who brings the RIGHT verb (force a door, unmake a seal) SHOULD resolve
   far above 8.3%, and a KNOW/heal kit SHOULD struggle — that's correct differentiation, not a flat wall. If the
   sim throws generic verbs at the door, 8.3% is the AVERAGE of right-and-wrong approaches, and the real story is
   the SPREAD (does break beat the door while heal bounces?). **Worth measuring: static resolution BY approach
   verb, not pooled.**
3. **8.3% is genuinely too punishing** and the DC/bands want lowering (or the give-per-tick raising). A pure
   tuning fix — Erik's dial: staticAntagonist.defaultResist (18), degreeBands (+15 success), defaultGive (60).

## What's whose
- **Aevi (content/design, done):** framed the finding; the matchup already gives the right-approach path
  (break/open/transform > ward). The design INTENT is clear: a static thing yields to the right UNDERSTANDING
  over several reads, not to one lucky roll.
- **CCode (measure):** does the report score static as "won this round" or "yielded within the encounter"? If the
  former, re-measure as multi-round yield (matching how a puzzle actually plays) + break static resolution out
  BY approach verb (does break/open beat it while a fight kit bounces?). That tells us if 8.3% is a real problem
  or a base-rate artifact — before anyone touches a number.
- **Erik (dial, if it IS a real problem):** defaultResist / degreeBands / defaultGive are the tuning knobs. But
  measure first (per #1/#2) — tuning a number that's actually a measurement artifact would be the wrong fix.

## The recommendation
Do NOT tune the static numbers yet. First re-measure (CCode): multi-round yield, and by-approach-verb. If a
break/open kit resolves a door well and only KNOW-less brute kits bounce, 8.3%-pooled is CORRECT and the matrix
is doing its job — the fix is the REPORT, not the content. Only if the RIGHT approach still resolves too low is
it a genuine dial. This mirrors the two lessons already on the board this session: measure against the right
baseline (the signature-situation fix), and don't let a harness artifact read as a content verdict (the
matchup-wire fix).
