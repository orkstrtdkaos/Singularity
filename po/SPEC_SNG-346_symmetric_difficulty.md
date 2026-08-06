# SPEC — SNG-346: the symmetric difficulty scale. Erik's design, modelled and ratified.
## Aevi (PO) · 2026-08-06 · ⚠️ THE NUMBER IS ERIK'S PER SNG-280. I modelled three options; his is better than mine.

## THE TARGET HE SET
**"A level 1 should succeed 2/3 of the time at easy things, and fail 2/3 of the time at hard things."**

## THE DESIGN — his, and it needs NO base
```
very easy +30  ·  easy +15  ·  normal 0  ·  hard −15  ·  very hard −30
```
**⚠️ THE INSIGHT IS THAT "EASY" BECOMES A BONUS RATHER THAN THE ABSENCE OF A PENALTY.** I had been treating
easy as the neutral case, which is exactly why every base I priced failed: **a base lifts every band equally,
so easy and hard stay 15 points apart no matter how high you push it.** His scale widens the spread instead
of raising the floor, and that was the actual defect.

## MODELLED — hits the target with no new machinery
A level-1 character with starting training (attr 4, +10 training):
| | very easy | easy | normal | hard | very hard |
|---|---|---|---|---|---|
| **L1 trained, attr 4** | 80% | **65%** | 50% | **35%** | 20% |
| L1 trained + geared | 85% | 70% | 55% | 40% | 25% |
| mid, attr 5, trained + geared | 95% | 80% | 65% | 50% | 35% |
| master, attr 6, 2 ranks, gear | 95% | 95% | 90% | 75% | 60% |
**Target was 67 / 33. Delivered 65 / 35.** And a master finally reads like one — **90% on normal work, where
today's ceiling for a maxed, rested, trained, equipped character is 65%.**
**Every band is 15 points apart, so the ladder is learnable** — a player can hold the whole scale in their
head, which none of my proposals achieved.

## ⚠️ THE HALF THAT IS NOT OPTIONAL — the GM cannot currently use this scale
```
engine/gm.js:98   difficulty: 0 routine, 15 hard, 30 very hard.
```
**There is no "very easy" and no "easy" in the GM's vocabulary at all — so it cannot hand out the bonus half.**
Left as-is, this ships a five-band scale the narrator can only address three bands of, and **every task that
should have been +15 gets tagged 0.**
**This is exactly what happened to Erik.** *"Scout the Thinning for resources and supplies"* — a trained
scout, on open ground, looking for ordinary supplies — **should be `easy` (+15) and was tagged `hard` (−15).
A 30-point error on a single call**, and the reason his character read as a walking disaster.
### THE REPLACEMENT VOCABULARY — mine to author, and it must teach by example
| band | value | when | example |
|---|---|---|---|
| **very easy** | **+30** | the character's own trade, unopposed, unhurried | a smith judging iron · a scout reading a plain trail |
| **easy** | **+15** | ordinary competence, nothing working against you | ⚠️ **scouting for supplies** · asking a friendly stranger for directions |
| **normal** | **0** | a real task with a real chance of failing | picking an unfamiliar lock · persuading someone undecided |
| **hard** | **−15** | something is actively against you — a person, the weather, the clock | tracking through rain · talking past a hostile guard |
| **very hard** | **−30** | the task resists expertise itself | reading a language nobody living speaks |
**⚠️ THE CALIBRATION RULE: "NORMAL" IS A TASK THAT COULD GENUINELY GO EITHER WAY. If nothing is opposing the
character, it is not normal — it is easy.** The current prompt has no way to say that, and the drift is
one-directional: **everything reads as at least normal, so the bonus half never fires.**

## OPEN, AND ERIK'S — the weak end
Untrained attr 2 sits at **5% on hard and very hard** — the floor clamp doing the work, meaning **attribute 2
is out of the game in the top two bands.** Better than my own proposal, and still a position worth choosing
rather than inheriting: **playable-but-poor, or the wrong tool?** I have not assumed an answer.

## ALSO STILL OPEN — proportional exhaustion (CCode's dial (c))
Independent of this and still a real bug: a flat −10 costs a weak character **22% of what they had** and a
strong one **11%.** Proportional reverses it — the weak lose 7, **the strong lose 14** — which reads
correctly, because **tiredness should cost more when you were relying on being good.**
