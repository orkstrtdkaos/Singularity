# SPEC — one growth system, three proximities

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**Supersedes** the growth §3 of `SPEC_progressive_sheets.md`. **Answers** its Q2 and Q3.
> Erik: *"a level balancing system keyed off how close the NPC is to the player… and a way for them to
> catch up — Silas can send them on missions."* · *"the NPCs that are not of you or with you also need to
> gain on their own… the next time you meet that radiant trickster brat, they might be a gang leader you
> have to fight off."*

---

## §0 — ✅ ERIK'S NUMBER, RULED

⛔ **A GAINED CRAFT ALWAYS STARTS AT RANK 1.** Erik, 2026-09-02. No exceptions for tenure, charge or tier.
⚠️ **Rank is earned by practice, never by arriving.**

---

## §1 — ⛔ THERE IS ONE CURVE AND THREE WAYS TO BE NEAR THE PLAYER

`derivedLevel` is already a proximity function and is already tuned close to Silas's own rate:

```
fromDeeds = floor(met / 4)        fromTime = floor(daysKnown / 96)        standing/25
```

**Silas: L30 · worldDay 45 · xp 2969 · actionCount 942** → ⚑ **~1.5 world-days per level.**

⛔ **BUT `met` ONLY MEASURES BEING *WITH* THE PLAYER, AND THAT IS THE DEFECT.**

| population | how they are near | today |
|---|---|---|
| **WITH you** — companions, party | meetings, days known | ✅ **works** |
| **OF you** — stewards, delegates, allies | ⛔ **charge and missions** | ⛔ **PENALISED — a delegate is BY DEFINITION not standing next to you** |
| **AWAY** — everyone else | ⛔ **their own deeds** | ⛔ **NOTHING. Level 1 forever** |

⚠️ **THE TRUST PARADOX: giving someone a charge is what stops them keeping pace.** Erik: *"I'd hate for
Silas to come back and his peer Cassiel is now very very low level compared to him and at high risk if
brought into the party."*

---

## §2 — OF YOU: charge, missions, and a floor

### 2a · ⚠️ CORRECTED BY ERIK — 15 LEVELS IS FINE, JUST NOT FROM SITTING STILL

> Erik 2026-09-02: *"I actually think 15 levels for Cassiel is probably fine — it's just that he's not
> getting them all from sitting still. He's **building, negotiating, acting for Silas.** That includes some
> fights most likely — and the act of his building is likely **pushing some Arc.** So the few levels the
> building itself gives shouldn't be the only way a delegate levels up."*

⛔ **AEVI'S FIRST DRAFT CAPPED A DELEGATE AT COMPLETIONS AND THAT WAS WRONG.** It read a charge as *waiting
somewhere* when a charge is **a job**, and a job is full of deeds.

➡️ ✅ **A DELEGATE ACCRUES ON THE AWAY TERMS (§3) *PLUS* CHARGE — NEVER INSTEAD OF THEM.**

| what Cassiel is doing | which term pays |
|---|---|
| the reconstruction advancing | **charge** — completion and `condition` steps |
| negotiating for materials, labour, right-of-way | ⚑ **deeds** (`figureCareer`) |
| defending the site | ⚑ **deeds** — wins, losses, `outOfAction` |
| ⚠️ **the building itself pushing an arc** | ⚑ **`epicArcPushes` / `arcTurnings`** |

⚠️ **So ~15 levels over half the game's elapsed generation is REASONABLE — because four terms are paying,
not one.** ⛔ **The charge term alone stays small (one or two levels). That is the point: holding is worth
little, DOING THE JOB is worth a lot, and the job is mostly not the holding.**

### 2b · charge pays on completion and condition-change, never on elapsed time

**Cassiel Ord has held the Raven's Home since world-count 566 of ~1093 — about HALF the game's elapsed
generation.** ⚠️ **At Silas's 1.5 days/level that is ~15 levels for standing still**, which would make
sitting still the best progression in the game.

➡️ ✅ **Pay on:** an assignment reaching `done` · a holding climbing a `condition` step
(`failing → strained → holding → thriving`).
⚠️ **Cassiel's steady progress on one reconstruction is ONE OR TWO levels, not fifteen** — and `progress`
and `condition` are already written.

### 2c · ⚑ MISSIONS ARE THE CATCH-UP, AND THE DANGER IS THE POINT

Erik: *"Silas can send them or a party on missions — that's dangerous and beneficial in multiple ways."*

⛔ **A steward who only HOLDS should not climb like a companion who FIGHTS. One you SEND is taking the same
risks and should.** ⚠️ **The danger earns the level, not the elapsed time.**

✅ **The pieces exist:** `assignments` with `progress` · `arcCasualties` · `outOfAction` ·
`woundedUntilDay` · `unavenged`. ➡️ **A mission is a charge with hazard attached.**

⚠️ **AND IT MUST BE ABLE TO GO WRONG.** Sending Cassiel to close the gap risks the person doing the
reconstruction. ⛔ **A catch-up with no downside is free levelling with extra steps.**

### 2d · ⛔ THE SERVICE BAND — a floor, not a rate

**Nobody in your service may fall more than N levels below you.** Erik: *"at high risk if brought into the
party"* is the failure being prevented.

⚠️ **THIS IS A FLOOR, NOT FREE LEVELLING.** It does not lift anyone TO you; it stops the gap becoming
lethal. ⛔ **Charge and missions move them INSIDE the band; the band only catches the fall.**
⬜ **N is Erik's number.** Aevi's instinct is 5 — a full band of R14 — **stated as instinct.**

---

## §3 — AWAY: ⛔ THE WORLD IS ALREADY DOING THIS AND NOTHING READS IT

**Measured in Silas's live save:**

| field | holds |
|---|---|
| `figureCareer` | ⚑ **71 figures** — `deeds`, `wins`, `losses`, `deaths`, `stageMoves`, `spread` |
| `figureTenure` | **72** with dated `deedLog`, each stamped ⚑ **`playerInvolved: true/false`** |
| `epicArcPushes` | **72** actively pushing an arc |
| `arcTurnings` | **14**, naming who turned each |
| `figureTier` | 9 tier assignments · `tierLostFor` exists and is empty |
| `figureDormant` | 5 gone quiet since day 45 |
| `mintedFigures` | ⚠️ *"the one who outlived Saehara the Undefeated"* — **a figure born from a death** |

**Cinder Vael: 9 deeds, 1 loss, tenure since day 35 — none of it with Silas present.**

⛔ **`playerInvolved: false` IS THE FIELD THIS TURNS ON.** It already distinguishes *"this happened because
of the player"* from *"this happened anyway"* — ➡️ **and the second is exactly what should grow someone you
have never met.**

### 3a · ✅ TIER IS THE TRICKSTER-BRAT MECHANISM, ALREADY AUTHORED

**riffraff → notable → regional → heroic → epic → legendary → mythic.**

⚑ **A brat becoming a gang leader is a TIER PROMOTION DRIVEN BY DEEDS**, and `tierLostFor` means it runs
both ways. ➡️ **Level becomes a CONSEQUENCE of tier plus career, not a separate track.**

⚠️ **So the duel with a rival kingdom's champion is not authored ahead — it is what a `riffraff` who won
nine contests while you were elsewhere HAS BECOME**, and the save already knows by how much.

---

## §4 — ⛔ WHAT MUST NOT HAPPEN

- ⛔ **No free levelling.** Every term is earned: a completion, a condition step, a survived mission, a deed.
- ⛔ **The band is a FLOOR ONLY.** It never lifts anyone to parity.
- ⚠️ **`met` must stop being dominant.** CCODE-309 already ruled that a world-moving figure the player has
  never met should not be level 1 — ✅ **§3 is how that ruling finally reaches the number.**
- ⛔ **Growth is ADDITIVE and RECORDED.** Never a silent edit, never a prune below an authored floor.
- ⚠️ **A gained craft is NEWS, not a celebration** — *"Cassiel Ord has learned something at the Raven's Home."*

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Does `figureCareer` already imply a level?** ⚠️ 71 figures with weighted deeds — ⬜ **is there a
   defensible function from career to level, or does it need a rate Erik sets?**
2. **What is a completion worth, and a condition step?** ⬜ §2b says one or two levels for the CHARGE TERM ALONE — ⚠️ the deeds terms carry the rest.
   ⚠️ **Erik's number.**
3. **The service band N.** ⬜ Aevi guessed 5. ⚠️ **Erik's number.**
4. ⛔ **Where does a mission's DANGER resolve?** Is there an existing offscreen-risk path, or does sending
   someone need a new resolution?
5. ⚠️ **Do the three terms STACK or is the highest taken?** ⬜ Aevi's instinct: the **highest**, so a
   companion who is also a steward is not double-paid — **stated as instinct.**
6. ⛔ **Does tier promotion drive level, or level drive tier?** §3a assumes career → tier → level.
   ⬜ **If it is the other way the whole section inverts.**

---

# ROUND 2 — CCode · 2026-09-04 · v1.9.345

⚠️ **Q6 first, because it does not invert: the chain you assumed is the one that exists, in two halves that were
built on different days and never introduced.**

**Q6 · career → tier → level.** ✅ **That is the live direction.** `worldtick.js` promotes by DEEDS, not years — the
rungs are gated at 4 / 10 / 22 / 70 / 170 deeds (`RUNGS`, `tierLostFor` runs it down), and `figureTenure` carries the
dated `deedLog` with `playerInvolved`. Separately, `npcsheet.derivedLevel` turns a **tier into a level** through
`resolution.npcStanding.tierFloor` (riffraff 1 → mythic 85) — and since v1.9.343 that dial actually reaches both live
callers. ➡️ **So a riffraff who won nine contests while you were elsewhere is promoted by the tick and levelled by the
floor, today, with no new code.** The trickster-brat mechanism is not proposed; it is unwired only in the sense that
nobody has watched it run. ⛔ What is NOT there: `figureCareer` feeding `derivedLevel` directly — level comes from tier,
met, days-known and standing. **That is the right shape and I would not add a fifth term.**

**Q1 · does `figureCareer` imply a level?** ✅ **Through tier, yes** (above). ⛔ **Directly, no**, and it should not —
`deeds` is a count with `negWeight`/`totalWeight`/`spread`, and a defensible function from it to a level would be a
second ladder beside `tierFloor`. Two ladders that can disagree is the stored-copy failure.

**Q2 · a completion, a condition step.** ⬜ **Erik's.** The record is ready: `assignments[].status === "done"` and
`holding.history[]` (`from → to`) are both written today. A rate lands in `npcStanding` beside `levelPerDaysKnown: 96`.

**Q3 · the service band N.** ⬜ **Erik's.** ⚠️ One measured constraint: the band is a FLOOR read against
`character.level`; with `derivedLevel` clamped at `safetyBound: 200` it composes cleanly — `max(derived, playerLevel − N)`
is one line, and it must be a floor only, never a rate, or "in your service" becomes the fastest progression in the game.

**Q4 · where a mission's danger resolves.** ⚠️ **There is an offscreen-risk path and it is the ARC contest**, not the
assignment: `worldtick.js` resolves arcs with `battleRound` and `synthesizeOpponentSheet` (`playerSheet: sheetFor(pro),
oppSheet: sheetFor(con)`), and `arcCasualties` / `outOfAction` / `woundedUntilDay` are written from it. ⛔ **An
assignment has no hazard today** — `advanceAssignment` moves `progress` and `status` and nothing can hurt the delegate.
➡️ A mission is *a charge with hazard attached*, exactly as you say; the hazard would borrow the arc contest, not a new
resolver.

**Q5 · stack or highest.** ⬜ **Erik's.** ⚠️ Measured shape: today `derivedLevel` STACKS its three terms (deeds + time +
standing) on top of the tier/authored base. Taking the highest would be a change, not a default.

**And §0 — a gained craft starts at rank 1.** ✅ Ruled; ⚠️ still not STORED anywhere — `growthFor` reports `room` and a
menu can offer, but writing a gained craft onto an authored `abilities[]` waits on Q2's rate (DECISIONS_OWED Q6).
