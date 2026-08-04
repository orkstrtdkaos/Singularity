# SPEC — SNG-279: promotion on DEEDS, on a scale players can see
## Aevi (PO) · 2026-08-04 · Erik: "2, yes. also 1… this can be determined by sim… but I want the players to
## SEE and FEEL these things happening."

## THE PROBLEM THIS FIXES, IN ONE NUMBER
Measured from the live clock (`minHoursPerBeat: 1`, realistic mix ≈ **3.14 world-hours/beat**):
| player-hours | world-time |
|---|---|
| 40 (a long campaign) | **0.29 world-years** |
| 100 | 0.72 |
| 300 (years of weekly play) | 2.15 |
**The current ladder needs 15.5 world-years riffraff→mythic — roughly 2,200 player-hours.** So today, **no
player ever sees a single promotion.** The whole system is invisible content.

## PART 1 — DEEDS PRIMARY (Erik's choice 2)
**Time-in-rank becomes a FLOOR, not the gate.** The gate is what the figure has DONE.
```
promote when:  heldRank >= floorYears  AND  deedScore >= rungThreshold
```
**`deedScore` accrues from things the world already records** — nothing new is needed:
| source | already exists | weight |
|---|---|---|
| arc contest won | `ws.arcContests` | 3 |
| strike landed | `ws.arcStrikes` | **3** |
| strike survived (as target) | `ws.arcStrikes` | 3 |
| guard intercepted | `ws.arcStrikes.guard` | **3** |
| a deed that SPREAD | `reputation.js` `spread` | 2 × spread |
| arc stage moved while they held it | `ws.arcContests` | 3 |
| held a front through a crisis pass | attention/urgency | 1 |

**⚠️ CORRECTED PER `DIRECTIVE_SNG-280`. My first draft weighted `guard` at 4 and `strike landed` at 2, and
justified it as *"the behaviour most worth having in it."* Erik caught it: that is protection-over-aggression —
a moral position some of this world's peoples hold and others reject — installed as physics.**
**The rule now: EVERYTHING CONTESTED AND WON SCORES 3, whichever direction it points.** A Maw who levers three
rivals rises exactly as fast as a guard who stops three knives. Weights reflect **cost, difficulty, risk and
scale — never approval.**
**And the test any future weighting must pass: would this tradition's TAIL be disadvantaged?** Run it against
the Maw, the Silencers, the Grave-Callers, the Openers, the Strippers. **If they systematically lose, the
system encodes a morality, and the lore's own north star — *"anything is on the table"* — is being contradicted
by a coefficient.**

## PART 2 — THE FLOOR, COMPRESSED (choice 1) — sim-tunable, these are the starting numbers
| rung | old floor | **new floor** | cumulative | reached at |
|---|---|---|---|---|
| riffraff→notable | 0.5 yr | **0.05** | 0.05 | ~7 player-hrs |
| notable→heroic | 1 | **0.10** | 0.15 | ~21 hrs |
| heroic→epic | 2 | **0.20** | 0.35 | ~49 hrs |
| epic→legendary | 4 | **0.35** | 0.70 | ~98 hrs |
| legendary→mythic | 8 | **0.60** | 1.30 | **~181 hrs** |
**Full ladder: 15.5 world-years → 1.30.** A mythic becomes **reachable in a long campaign** instead of never.
**These are floors — a busy figure clears them on deeds; a quiet one waits and rises slowly.** That asymmetry
is the point: **the world's risers are the ones who were doing something.**
**CCODE: these want a sim sweep.** Target — a **40-hour-equivalent** run (≈105 world-days) shows **≥3 rises and
≥1 fall**; a **180-hour-equivalent** run produces **a mythic in some worlds and not others.**

## PART 3 — ⚠️ SEE AND FEEL IT. This is the requirement, not the garnish.
A promotion the player does not witness is a database write. **Four surfaces, all of which already exist:**
1. **THE NEWS BLOCK** (`worldtick.js:1201`, already assembling rumors) — a rise is **exactly** the kind of thing
   travellers repeat. *"They're calling her a Grave-Caller now, not a pale-reader."* **Attribution matters: say
   WHAT they did.** A rank that arrives without a reason is a number.
2. **NPCs REACT** — the `npcMood`/teacher blocks already shape how people receive you. Someone who rose should
   be **treated differently by their own people**, and a demotion should be **audible in how they are spoken
   about**. That is the "feel" half.
3. **THE WORLD TAB** (character-sheet overhaul) — **who rose, who fell, who died, and why**, with names. This
   is where a player goes to *check*; the other three are where they *notice*.
4. **⚠️ THE ONE THAT MATTERS MOST — WHEN THE PLAYER CAUSED IT.** If a party's strike, guard, or quest moved a
   figure's deedScore across a rung, **say so explicitly and by name**: *"The Grey Lady is called legendary
   this season. You are why."* **That single line is the entire payoff of the world-sim chain** — it is the
   moment the simulation stops being weather and becomes consequence.
**AND THE INVERSE, which is sharper:** *"Oren Vale was struck in the Palelands. He had been guarding the
medicine-road since spring. Nobody stood over him."* **A world that names its losses is a world the player
feels.**

## WHAT I'D ASK CCODE FOR
- `deedScore` accrual from the six existing sources (no new recording).
- `promotion` config block: per-rung `floorYears` + `deedThreshold`, both dial-able.
- Promotion/demotion emitted as a **news item with attribution**, and flagged `causedByPlayer` when a
  player act crossed the threshold.
- The sim sweep above, reported in **player-hours-equivalent**, not world-years — *that is the unit that
  decides whether this is visible.*
