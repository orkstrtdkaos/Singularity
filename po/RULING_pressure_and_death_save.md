# RULING — pressure symmetry, break-at-level, and the death save

**Ruled by:** Erik · **2026-09-04** · **Recorded by:** Aevi
**Answers:** `DECISIONS_OWED_20260904.md` Q1 (in part) and Q2
**subject:** combat-pressure, lethal-harm
**bodyAnchor:** "BEING DRIVEN BACK COSTS BOTH SIDES THE SAME KIND OF THING"

---

## R34 — pressure is SYMMETRIC and breaks at half your level ✅ RULED

### 34a · ⛔ BOTH SIDES LOSE HEALTH AND ENERGY

**Today** (`skill_battle.js:911`) the two sides lose different currencies:

| dominated | health | energy |
|---|---|---|
| player | 3 | ⛔ **0** |
| opponent | ⛔ **0** | 14 |

⚠️ **BEING DRIVEN BACK MEANT SOMETHING DIFFERENT DEPENDING ON WHO YOU WERE** — the player bled, the NPC
tired. ⛔ **That is why the Pell–Veth duel read strangely: one was losing blood and the other was losing wind.**

✅ **ERIK: health AND energy loss apply to BOTH sides.** ⬜ The four dials stay content
(`playerHealthLoss`, `playerEnergyLoss`, `opponentHealthLoss`, `opponentEnergyLoss`) — **the ruling is that
none of them is zero by default and the two sides are priced alike.**

⚠️ **Erik also wants `opponentEnergyLoss` tunable ALL THE WAY TO ZERO** — at zero, pressure stops being an
energy tax and becomes purely positional: still `pressureBonus`, still a break.

### 34b · ⚑ `breakAtPressure` = `ceil(level / 2)`

**Today it is a flat 3** — ⛔ **which is why 1,595 of 2,000 duels ended by break and only 8 by health.**
⚠️ **Three exchanges ends any fight at any level.**

| level | breaks after |
|---|---|
| 5 | 3 |
| 12 | 6 |
| 20 | 10 |
| 30 | **15** |
| 33 (Veth) | **17** |

➡️ ✅ **A great figure takes a long time to drive off the field, and a novice does not.** ⛔ **This alone
moves fights off the pressure track and onto health and energy, which is what Q2 is really about.**

⬜ **Whose level?** Aevi reads it as **the dominated side's own level** — *how hard is THIS person to break*
— rather than the attacker's. ⚠️ **Stated as a reading; correct it if wrong.**

---

## R35 — lethal harm gets a DEATH SAVE; the dice are the fallback ✅ RULED

> Erik: *"The dice on a lethal skill are the fallback damage if the thing resists insta-kill. Otherwise the
> Cut Thread would drop someone instantly — and that's what it's designed to do."*

### ⛔ THE MEASUREMENT: THE CONTENT WAS AUTHORED FOR A MECHANIC NOBODY BUILT

`the_cut_thread` — T5, `harmRung: lethal`, `5d6+6` (EV 31.5) — **and its bounds are already the price of an
insta-kill:**

> *"it costs your whole remaining energy pool and leaves you at zero, unable to use any craft until a full
> night's rest"* · *"IT IS UNMISTAKABLE TO ANYONE WATCHING"*

⚠️ **NOBODY PRICES A 31-DAMAGE HIT THAT WAY.** Against a L30's ~191 health it is a strike that costs
everything and is strictly worse than two hammer blows. ⛔ **The description — *"it simply stops"* — has
never been true.**

### ✅ THE RULING

**A landed hit at `harmRung: lethal` offers an INSTA-KILL, resolved by an opposed DEATH SAVE.**

| outcome | result | ⚑ **cost to the caster** |
|---|---|---|
| ⛔ **save FAILS** | **the target stops.** Health irrelevant | ⚑ **the authored bound — WHOLE remaining pool, zero, no craft until a full night's rest** |
| ✅ **save HOLDS** | ⚑ **the dice are the FALLBACK** — `5d6+6` vitality, and it is a lot | ⚑ **a standard tier-5 cost. NOT the pool** |

⛔ **ERIK'S CORRECTION TO AEVI'S FIRST SHAPE, AND IT IS THE WHOLE POINT:** *"it will only take the full
energy pool if the insta-kill SUCCEEDS — otherwise it falls back to a standard tier-5 cost, since the
damage falls back to tier-5 damage."* ⚠️ **The catastrophic price buys the catastrophic result. A resisted
attempt is an expensive T5 strike, not a self-inflicted collapse.**

### ⬜ AND THE LADDER GENERALISES

| rung | on a landed hit |
|---|---|
| **lethal** | ⚑ **offers the insta-kill / death save** |
| **incapacitating** · **damaging** | the ⚡ **Finish it** finisher that already exists |

✅ **One ladder, three rungs, dice as the fallback at every level.**

---

## ⬜ FOR CCODE — what the death save rolls against

> Erik: *"for what it rolls against — ask CCode. This should already be determined by the engine. If we
> don't have something for a death save, we should probably make one."*

⛔ **MEASURED: there is NO death save.** `deathSave`, `resistCheck`, `saveAgainst`, `opposedRoll`,
`instaKill` — **zero hits across the whole engine.**

✅ **BUT `opposed` EXISTS AND HAS READERS:** `resolve.js` ×8, `incapacitation.js` ×1, `gm.js` ×4,
`encounters.js`, `random_encounters.js` ×5. ➡️ **So there is a contest mechanism to build on rather than
invent.**

⬜ **CCode's questions:**
1. **What does `opposed` in `resolve.js` already contest, and can a death save be one of them** — or does
   it need its own path?
2. ⛔ **What does the target roll?** ⚠️ Aevi's instinct: the higher of `strength` or `presence` — *the body's
   refusal or the person's* — **against the caster's craft roll.** ⬜ **Stated as instinct; the engine may
   already imply the answer.**
3. **Does `incapacitation.js` already model "stopped" as a state**, so the failure case has somewhere to land?
4. ⚠️ **What is "a standard tier-5 cost"?** `the_cut_thread` authors `energyCost: 14`. ⬜ **Is that the T5
   norm, or is the whole-pool bound currently overriding it?**
5. ⛔ **`notFor` already bounds the immunities** — *"it cannot be aimed at what has no thread: a machine, a
   figure, a Precursor working."* ⬜ **Does the save need to know that, or does `notFor` gate it earlier?**
