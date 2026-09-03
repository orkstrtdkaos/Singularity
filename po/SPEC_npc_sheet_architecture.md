# SPEC — One sheet architecture: person-keyed primary, threat-keyed fast path

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `spec_ready` — ROUND 2 requested
**Blocks:** `SPEC_npc_growth.md` (CCode: *"one decision is yours and it blocks that build"*)
**Origin:** Erik — NPCs need sheets at mint; unit/legion/army sheets derive from them.

---

## §1 — PWSV: THERE ARE THREE SHEET PRODUCERS, NOT TWO

| producer | keyed on | status |
|---|---|---|
| `skill_battle.synthesizeOpponentSheet` | ⚠️ **a threat number** | ✅ **LIVE, called in play** |
| `skill_battle.synthesizeStaticSheet` | a resist number | ✅ live — SNG-247, for things that resist and never act |
| `npcsheet.sheetFor` | ⚠️ **the person** | ⛔ **DARK — nothing imports `npcsheet.js` outside tests** |

⛔ **AEVI'S GROWTH SPEC CLAIMED `sheetFor` WAS LIVE VIA `worldtick`. IT IS NOT** — that is a local `const`
wrapping `synthesizeOpponentSheet`, a different function with the same name. **CCode caught it; the
correction is accepted and this spec is written against the real state.**

### ✅ AND THE PRECEDENCE IS ALREADY BUILT

`synthesizeOpponentSheet`'s own doc-comment:
> *"An authored `opponent.skills[]` overrides the synthesis entirely."*

⚠️ **NOTHING NEW IS NEEDED TO MAKE AN AUTHORED SHEET WIN.** The escape hatch exists and is live. ➡️ **The
integration is: give it something to find.**

### ✅ AND THE STORAGE COST IS ALREADY PAID

`npcs.js:49` — `REGISTRY_CAP = 150`, with `evictionCandidate` and a protection rule at line 203:
*"everyone left is protected — refuse rather than drop kin."*

➡️ **Erik's "deleted if they fall off the list due to inattention" IS how NPCs already work. Sheets can never
exceed 150.**

---

## §2 — THE RULING BEING PROPOSED

**`sheetFor` is primary where a person exists. `synthesizeOpponentSheet` is the fast path for a mass nobody
will inspect. Neither is retired.**

⛔ **ERIK'S OWN ARCHITECTURE DECIDES THIS, RATHER THAN A PREFERENCE:**

> *"The group or unit sheets can be derivative of the NPC sheets — how many NPCs with skills does a unit
> have, what skills with wards and types, how many simple soldiers."*

⚠️ **YOU CANNOT COMPOSE THAT FROM A THREAT NUMBER.** A difficulty rating has no wards in it, no types, no
count of who carries what. ➡️ **The moment a unit derives from its members, a person-keyed sheet stops being
a preference and becomes a requirement.**

✅ **And the threat path keeps a real job** — it is the only thing that can collapse a legion to one number
when nobody is going to inspect it, which is exactly what it was built for (CCODE-52's threat curve, ceilings
removed, sub-linear past a knee).

---

## §3 — THE PROGRESSIVE SHEET

Erik: *"They need one as soon as they are minted… then as they become more and more important to the game
and the narrative, they need more of their sheet filled in."*

| stage | trigger | sheet |
|---|---|---|
| **minted** | registry entry created | ⬜ derived from `role` + `firstMet` alone. `derivedLevel` already gives a stranger **15** |
| **known** | met repeatedly, deeds recorded, charge held | ⚠️ **more of it resolves** — `derivedLevel`'s existing terms already do this: Pell measures **27** with no signals and **41** at met-40 |
| **authored** | Aevi writes a file | ⛔ **the authored record wins** — `npcsheet.js`'s own stated rule |
| **evicted** | `evictionCandidate` picks them | ✅ the sheet goes with the registry entry. **No separate lifecycle.** |

⚠️ **THE SHEET IS NOT A SECOND RECORD.** It is a VIEW over the registry entry, computed on demand. ➡️ That is
why eviction needs no new machinery and why 150 is the true ceiling.

---

## §4 — THE COMPOSITION LADDER (Erik's, recorded)

```
person  →  unit  →  legion  →  army
```

**A unit sheet is an AGGREGATE of person sheets:** how many carry HARM · how many carry PROTECT and of what
type · how many are simple soldiers with no craft at all. ⚠️ **`contributionsOf` already produces exactly
those families**, and 52 authored people now carry `assistTags` feeding them.

⛔ **AND THE LADDER RUNS BOTH WAYS.** An aggregate must be able to produce a THREAT NUMBER so the fast path
can resolve a mass without walking every member. ➡️ **Person-sheets compose upward; the aggregate collapses
downward into `synthesizeOpponentSheet`.** ✅ **That is the reconciliation — the two systems are the two
directions of one ladder, not rivals.**

---

## §5 — ⚠️ THE COSTS, STATED PLAINLY

| cost | weight |
|---|---|
| ⛔ **`sheetFor` has NEVER run in play** — 377 lines, zero production exposure, tests only | **the real risk.** It will have bugs the tests do not reach |
| **Two producers in parallel during transition** | the reader-with-no-writer defect class that has bitten repeatedly this session |
| **Derivation quality at scale** | a stranger derives to 15. Fine for one bandit, possibly wrong for a hundred. ⬜ A tuning pass, not a design flaw |
| **Performance in mass battle** | N sheet resolutions per round if a legion walks its members. ✅ **Mitigated by §4's downward collapse** |
| ⬜ **The unit layer is new building** | does not exist today |
| ✅ storage | **already bounded at 150** |
| ✅ precedence | **already built** (`opponent.skills[]` override) |

⬜ **SAFEST FIRST CALLER:** mint a sheet on registry entry and **do not wire it to combat yet.** Let it
accumulate at 150-cap scale, with real minted NPCs, before anything depends on it.

---

## §6 — ROUND 2 QUESTIONS FOR CCODE

1. ⛔ **Is `opponent.skills[]` genuinely sufficient as the bridge?** If `sheetFor` produces a sheet and its
   `skills[]` is passed in, does `synthesizeOpponentSheet` defer completely — or does it still synthesize
   attributes, tier and affinity around them? ⚠️ **A partial deferral is worse than either system alone.**
2. **Is the sheet a VIEW or a STORED RECORD?** §3 assumes computed-on-demand so eviction is free. If it must
   be persisted, the 150 cap still holds but save size and migration become real.
3. ⚠️ **`synthesizeStaticSheet` is a THIRD producer** and this spec has not placed it. Does a door need
   anything from this architecture, or is it correctly outside?
4. **What produces a unit's threat number from its members (§4 downward)?** Sum, max, or a curve like
   CCODE-52's? ⬜ Aevi has no basis to choose.
5. ⛔ **Does anything today read `opponent.skills[]` from an authored NPC?** Pell and Veth carry `abilities`,
   not `skills`. ⚠️ **The shape mismatch that made both sheets inert may still exist one layer down.**
6. **What is the cheapest safe first caller?** §5 proposes mint-only, uncombatted. ⬜ If there is a lower-risk
   one, take it instead.
7. ⬜ **Anything already true at HEAD.** ⚠️ **Aevi has made SEVEN wrong claims this session in both
   directions — including the one that voided the growth spec's premise. Assume an eighth is in here.**
