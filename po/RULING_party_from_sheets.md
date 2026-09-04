# RULING — a party member fights from their SHEET

**Ruled by:** Erik · **2026-09-04** · **Recorded by:** Aevi
**Answers:** `DECISIONS_OWED_20260904.md` **Q9** — ⛔ **and none of the three offered shapes was right.**
**subject:** party-contribution
**bodyAnchor:** "THREE RESOLUTIONS OF THE SAME FIGHT"

---

## R36 ✅ RULED

> Erik: *"The party members in a party battle should contribute **the most fully based on what their
> character sheet provides them.** Their skills and abilities will be used — it's like a more complex
> version of the band scale battle. The only more complex and detailed battle type is what the player
> experiences in their turn-by-turn battle steps. **So it's most like C — but perhaps even more
> enhanced.**"*

⛔ **AEVI OFFERED THREE SHAPES AND ALL THREE WERE TOO SMALL.** A mirrored band (A), named per-family
effects (B), and the player's crafts reaching folded allies (C) — ⚠️ **all three treat a party member as a
MODIFIER on the player's turn.** ➡️ **Erik's answer: they are a PERSON WITH A SHEET, and they use it.**

---

## ⚑ THREE RESOLUTIONS OF THE SAME FIGHT

| scale | resolves from | detail |
|---|---|---|
| **band / unit / legion** | ⚑ **contribution FAMILIES** — HARM · MARTIAL · PROTECT · RESTORE · KNOW, and the gaps between them | coarsest. ⚠️ **A mass nobody will inspect** |
| ⚑ **PARTY** | ⛔ **EACH MEMBER'S OWN SHEET — their crafts, ranks, attributes, energy** | ⚠️ **"a more complex version of the band scale battle"** |
| **the player's turn** | full turn-by-turn declaration, intensity, stretch, novel use | ⛔ **the most detailed, and the only one that is** |

⚠️ **IT IS ONE LADDER, NOT THREE SYSTEMS.** ➡️ **The same fight resolved at three grains, and which grain
you get depends on how closely the story is looking.**

---

## ⛔ WHAT THIS MAKES OF THE SHEET WORK

✅ **The machinery already exists and was built today for other reasons:**

| | |
|---|---|
| `battleSkillsFor(pell)` | ⚑ **yields 32 skills.** Veth yields 40 |
| `personOpponent` | ⚑ **already builds a fight opponent from a person's sheet** (R30–R32) |
| `sheetFor` | authored wins, derived fills, `growthFor` grows it |
| 52 people carry `assistTags` | ⚠️ so `contributionsOf` returns real families instead of defaulting to HARM |

➡️ ⛔ **A FOLDED ALLY SHOULD DRAW FROM `battleSkillsFor` THE SAME WAY AN OPPONENT DOES.** ⚠️ **The
person-keyed path already exists; the party seat simply is not using it.**

### ⚠️ AND IT MAKES THE 50 UNAUTHORED SHEETS URGENT

**Two of 52 people have an authored sheet.** ⛔ **Under R36, a party member with a derived sheet FIGHTS
DERIVED** — generic kit, no absences, no judgement. ➡️ **`docs/ROSTER.md`'s order stands and the reason has
changed: companions first, because they fight beside you and now they fight AS THEMSELVES.**

---

## ⛔ WHAT THIS FIXES IMMEDIATELY

**Today `skill_battle.js` reads `contributions` ONCE, filtered to `HARM`.** `PROTECT`, `RESTORE` and `KNOW`
appear **zero times** at party scale.

⚠️ **AND THE PERVERSE CASE: `targeting.js` reads RESTORE to pick the enemy's priority target.** ⛔ **A
folded healer is already singled out to be attacked and gets nothing for it — being the restorer is
strictly worse than being a bystander.**

✅ **Under R36 that inverts correctly:** a restorer is a priority target **because they are restoring**, with
their own crafts, at their own ranks. **The targeting was right; the contribution was missing.**

---

---

## ⛔ R36a — HOW MANY ACT FULLY: EARNED, AND CAPPED AT 3 FOR NOW

> Erik, 2026-09-04: *"the number of party members who also act fully are **limited and built up over
> time** to about a **max of 3 for right now**. Playtesting will tell if that's right."*

| | |
|---|---|
| ⚑ **act fully from their sheet** | ⛔ **up to 3** — their own crafts, ranks and energy |
| **folded** | the rest — contribution families, as today |
| ⚠️ **party capacity** | **6** (R25a: rapport to 4, presence 10 and 14 for the 5th and 6th) |

⛔ **SO A FULL PARTY OF SIX HAS THREE ACTING AND THREE FOLDED**, and **which three** is a real choice that
changes with the fight.

⚠️ **"BUILT UP OVER TIME" — the slots are EARNED, not granted at capacity.** ⬜ **What earns them is not
ruled.** Aevi's reading: **bond depth and time served**, since `bondStage` and `joinedDay` already exist and
R25a keyed party CAPACITY to rapport and presence. ⚠️ **Stated as a reading — Erik has not set it.**

✅ **AND THE NUMBER IS EXPLICITLY PROVISIONAL: *"playtesting will tell if that's right."*** ⛔ **It must be a
content dial, never a constant in code.**

---

## ⬜ FOR CCODE

1. ⚠️ **`intercept.js::spendProtection` is in the test-only export list** — CCode's note calls it *"the
   interceptor Aevi's shape B needs."* ⬜ **How much of R36 is already built behind it?**
2. ⛔ **What does a folded member SPEND?** ⚠️ NPC energy is **40 flat** (Q1) — a party of four each casting
   from their own pool is a very different fight from four modifiers. ➡️ **Q1's pool ruling and R36 are the
   same question seen twice.**
3. **Does a folded member DECLARE, or does the engine pick from their kit?** ⬜ Aevi's read: **the engine
   picks, weighted by their `assistTags` and the situation** — ⚠️ *the player declares; the party acts.*
   **Stated as a reading.**
4. ✅ **ANSWERED BY R36a — 3 act fully, the rest fold, and the 3 slots are EARNED.** ⬜ **What earns a slot is still open.**
5. **What does a folded member's failure look like?** ⬜ They can be `downed`, `outOfAction`, `woundedUntilDay`
   — ⚠️ **all three exist and none is written by the fold.**

⛔ **AND THE STANDING CAUTION: this is the largest single change to combat proposed so far.** ⚠️ **It should
land behind Q1 (pools) and Q2 (harmRung as kill condition), because a party of four fighting from real
sheets against the current 40-energy, nobody-dies-of-dice arithmetic will produce nonsense.**
