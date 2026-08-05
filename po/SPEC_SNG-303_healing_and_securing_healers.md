# SPEC — SNG-303: HEALING IN THE WORLD, and why a side fights to hold a healer
## Aevi (PO) · 2026-08-04 · for CCode to build and sim. Erik: "yes, and a motivation for a side to secure healers."

## THE FINDING THIS RESTS ON
**Healing is not a factor anywhere in the world sim.** `applyEpicClashOutcome` sets `woundedUntilDay =
worldDay + 8` — **flat, for everyone.** The `killed` gate is a roll plus a cooldown; nothing about the loser's
access to mending enters it. **And the asymmetry: `death.js` models retrieval in full detail — depth, decay,
odds, sealing — so the world models RAISING THE DEAD precisely and TENDING THE LIVING not at all.**
⚠️ **Every mortality number tuned this week — heroic 8.6%, legendary 27.8%, `strikeRate` 0.12,
`guardInterceptChance` 0.45 — was measured in a world where medicine does not exist.** This should land
**before** further mortality tuning, or we tune twice.

## PART 1 — THE MECHANIC (healing changes what a wound COSTS, never whether it lands)
### 1a · WOUND DURATION
```
woundedUntilDay = worldDay + round(8 × mendFactor(side))
mendFactor:  none 1.4 · folk 1.0 · traditionHealer 0.6 · healingCapstone 0.4
```
**⚠️ `none` is 1.4, not 1.0 — Erik's point exactly. The flat 8 is not the floor, it is the FOLK case.**
Without the skills, injuries last **longer** than today's baseline.
### 1b · THE DEATH DOWNGRADE
A `killed` candidate becomes `wounded` **if a healing craft of sufficient tier is present on the loser's side**
— **once**, and **the healer is SPENT for a cooldown** (proposed 20 days). A side with a great healer loses
fewer people, **then the healer is out of reach and the next death lands.**
### 1c · WHO HAS IT — nothing new to author
Read the loser's tradition against the catalog's `shape: healing`.
**Strong:** rootkin · ashwarden (Easers) · numinous · valley_craft (`greenlore` is **folk and open-access**,
which is the point — every side has *some* floor unless they are truly isolated).
**⚠️ NONE AT ALL:** unmaker · marcher · umbral · veilwright · precursor. **Those traditions sit at 1.4 and die
more, and that falls straight out of the catalog with nothing invented.**

## PART 2 — ⚠️ WHY A SIDE FIGHTS TO HOLD A HEALER (Erik's ask, and it closes a loop already built)
**The motivation should be EMERGENT, not a new incentive term.** Once 1a/1b are in, a healer is the highest-
value non-combatant on a front — **and the strike system already targets exactly that.**
`the_quiet_work` targets *"the most valuable worker — the highest-weight figure pushing unopposed."* **With
healing modelled, that is frequently the healer.** So without adding anything:
1. **Killing a healer raises the whole front's mortality**, not just that figure's.
2. **Which makes healers the best strike targets** — the Quiet Work finds them on its existing rule.
3. **Which makes guarding a healer the highest-value guard** — and `guardIntercept` already pays weight 3.
4. **Which makes the player-facing guard quest matter**: *"she is the reason the Palelands still have medicine,
   and someone is coming for her"* — a line I wrote before healing existed, **now literally true.**
### THE ONE THING TO ADD, AND IT IS SMALL
**`healerValue` in the strike target-selection weighting.** Not a new system — a term in the existing "most
valuable worker" score, so the Quiet Work *knows* what it is looking at. **Proposed: a figure whose tradition
carries a healing capstone counts ×1.6 on the strike-target score, and ×1.6 on the guard-priority score.**
Both sides value the same person more, which is the whole shape Erik is asking for.
### AND THE RECRUITMENT SIDE
**Sides should also try to ACQUIRE healers, not only kill and guard them.** Cheapest honest version:
**`vacancyPull` — when a front loses its healer, the faction's next mint or recruitment attempt biases toward
a healing tradition.** That is a side *securing* a healer, using minting that already exists.

## PART 3 — WHAT TO SIM, AND WHAT WOULD PROVE IT
**Run 4 worlds × 12 world-years, three arms:**
| arm | config |
|---|---|
| **A. control** | healing off (today's flat 8) |
| **B. healing on** | 1a + 1b |
| **C. healing on + valued** | 1a + 1b + `healerValue` weighting |
**REPORT:**
1. **deaths and wounds per world, BY TRADITION.** ⚠️ *Expected: averages barely move; the SPREAD between
   traditions widens a lot.* **That is the result — a world where it matters where you stand.**
2. **mean wound duration by tradition** — unmaker/marcher/umbral should be visibly longer.
3. **⚠️ HEALER MORTALITY, arm B vs arm C.** *Expected: healers die MORE in C.* If they don't, `healerValue`
   isn't reaching target selection.
4. **fronts that lost a healer — their mortality before vs after.** *This is the number that proves the loop:
   if losing a healer doesn't measurably raise a front's deaths, the mechanic is decorative.*
5. **how often the death-downgrade fires, and whether the cooldown binds.** If it fires every pass, 20 days is
   too short and a great healer is immortality by proxy.
**FAIL CONDITIONS I would want called out:**
- **if arm B and arm C look the same**, the valuation isn't wired.
- **if healer-rich traditions become unkillable**, the downgrade cooldown is too generous.
- **⚠️ if overall mortality drops more than ~20%**, healing has become a global damper rather than a
  positional advantage — and the fix is `mendFactor`, not `strikeRate`, because **the whole point is that it
  matters WHO you are standing next to.**
