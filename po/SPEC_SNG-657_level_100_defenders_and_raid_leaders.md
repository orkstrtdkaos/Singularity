<!-- status: SNG-657 — Aevi (PO) · RULED by Erik 2026-09-25 20:48 -->
# SPEC SNG-657: levels to 100, defenders who fight as themselves, and raid leaders who lead

**Erik, 2026-09-25:**
> *"Levels go to 100 — so make sure everything in the game knows that. It makes sense for raid leaders to fight — but
> they aren't really there to kill and take over everything (usually), so not sure how to balance this. The named
> defenders should definitely fight with what their level and skills call for... not the lowest quality."*

---

## §1 — LEVEL 100, EVERYWHERE

**What already knows it:**
- `legends.DEFAULT_RUNGS` runs 1–100: mythic is 85–100.
- `npcsheet`'s comment is canon: *"100 is a door, not a ceiling"*, meaning the Veil, ascend or fall.

**What doesn't** (measured on origin today):
- ⛔ **`jobstate.js` `JOB_LIMITS.levelMax: 60`**. A job can't be pitched above level 60, so a level-70 character's
  work is priced as a level-60's (crystal, xp and harm all scale from it). **Raise it to 100.**
- `earned_power_guidance.json` stops at a `"30+"` band. That's guidance prose, not a clamp, but it tells the GM
  nothing about 30–100. ⬜ It's mine to extend (30–59, 60–84, 85–100, matching the rungs); I'll author it.

**The ask, and it's the real fix: a gate, not a sweep.** A grep for literals finds today's `60` and misses
tomorrow's. So:
- **`§L100`: build a level-100 character and a level-100 NPC, and drive every function that reads a level.** That
  covers `sheetFor`, `tierOf`, `dutyHand`, `normalizeJob`, `levelOfPerson`, the fight's `threatBand`, `commandSlots`,
  `canRaiseBand`, `companyPlaces`, `reachOf` (rank, not level; check it's untouched), the purse bands, the break
  threshold (`breakAtMax`), energy per level, and PC leveling (xp per level, sub-point grants).
- **Assert:** nothing clamps below 100, nothing throws, and each answer is **monotonic** from 60 to 100 (level 90
  never reads weaker than level 70).
- **Add each new level reader to the gate's list when it's written.**

## §2 — NAMED DEFENDERS FIGHT AS THEMSELVES

**Today:** `resolveRaid` and `watchReadout` pass `levelOf: p => Number(p?.level) || 1`, so every named defender is
quality 1. Nobody stores a level; everyone has one derived (CCODE-508).

**Ruled:** a named defender's combat **quality** is read from the same person the watch reads.
- **quality = their rung,** from the derived level via `tierOf` (riffraff 1, notable 2, leader 3, heroic 4, epic 5,
  legendary 6, mythic 7).
  - This is the same scale you already use for a raid leader (rung, not level), so both sides of the field are in
    one unit.
- **What they can DO** comes from `contributionsOf(…{evidence:true})` as now (CCODE-450/541c: a warden fights and a
  filtration engineer doesn't). Their **defence-duty hand** (`dutyHand`, duty `defence`, SNG-652 §2 order #1) scales
  their weight in the clash: evidenced 1.0, leaning 0.6, plain 0.3.
- **Plain hands and contingents are unchanged** (their authored quality).

**Measure before and after,** as you did for `leaderFights`: hold win rate across Silas's five holds and the 29
powers at matched seeds. I expect holds to win more, and that's intended; Erik has named-defender strength as the
point.

## §3 — RAID LEADERS FIGHT TO LEAD, NOT TO SLAUGHTER

Erik's balance problem, stated plainly: *a leader belongs on the field, but a raid is not a conquest.* Your
measurement says a leader dropped in as one more combatant turns 50% hold wins into 18%. So the leader shouldn't be
one more combatant. **They do three things, none of which is "win the fight by themselves":**

**A · They command.** While the leader stands, their contingents fight at **+1 quality** (`raid.leaderCommand: 1`),
the same shape as a legion commander. This is the steady contribution, and it's bounded: a legendary leader gives
their people the same +1 a heroic one does. *What the leader is* shows in B and C, not in a bigger multiplier.

**B · They meet the defenders' best, if anyone stands.** If the hold has a named defender (the watch captain first,
then the keeper), the leader and that person have a **captain's contest**, resolved by **rung + defence-duty hand**
on each side, with the d100:
- **the leader wins:** the raid's tide shifts toward the raiders (`raid.duelTide`, e.g. +0.15), and the defender is
  **hurt, not killed** (a wound state, not death), unless the power is `cruel`, where the GM may escalate;
- **the defender wins:** the raiders' morale breaks one step, and the tide shifts to the hold;
- **nobody stands:** no contest; the leader only commands.

This is where a level-60 leader against a level-12 keeper is *felt* (the keeper loses the contest), without the
leader single-handedly deciding the whole clash.

**C · They leave rather than die.** A leader **withdraws** when the raid turns: at the defenders' "held at a cost"
or better, the leader and the survivors go.
- They're **never killed in an unattended raid.** Killing a named power leader should be a scene the player is in,
  not a line in the pass report.
- **On a rout,** the leader may be **captured** (`raid.leaderCaptureOnRout`, e.g. 25%). That's a Needs you item:
  *"Your watch holds Dessa Wyck."* Ransom, bargain, trial, or release is a story, and it's leverage over the power.

**And what they came for:**
- An **overrun** takes the **store share** as today, plus, for a `cruel` power, **one extra harm**: a disrupted
  barrier layer (SNG-652 §8a) or a wounded keeper.
- **A hold is taken only if the power *wants the ground*:** its `verbs` include taking or holding ground, or its
  `wantsFromYou` names this place. Otherwise even an overrun is a raid, not a conquest. (`takeHold` exists; this is
  the gate on it.)

**Target:** with A–C on, hold win rate at the tipping point should land **around 40%**, not 18%. Tune
`leaderCommand`, `duelTide` and the contest odds to get there, and report the number beside the old 50 / 18.
`raid.leaderFights` becomes this behaviour, and it's **on** once it measures sane.

## §4 — GATES

1. **§L100** as above.
2. A named leader-rung defender beats a riffraff one in a matched raid (quality reaches the clash).
3. A leader **never dies** in an unattended raid, across the 1,160-raid sweep.
4. **No hold is taken** by a power whose verbs and wants don't include ground.
5. Hold win rate with A–C on sits in the **30–50%** band at the tipping point, and the number is printed.

— Aevi, PO