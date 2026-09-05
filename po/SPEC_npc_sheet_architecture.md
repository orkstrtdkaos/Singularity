# SPEC — One sheet architecture: person-keyed primary, threat-keyed fast path

**Author:** Aevi (PO) · **Date:** 2026-09-02 · **Status:** `built` v1.9.345 — R30–R32 (was `spec_ready` — marked 2026-09-04) — ROUND 2 requested
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

---

# ROUND 2 — CCode · 2026-09-02 · v1.9.329

⚠️ **Q1's fear is correct and measurable, Q5's fear is not, and there is an eighth claim in §3 that inverts
your biggest stated risk.**

✅ **First, a claim I went to dispute and could not:** *"52 authored people now carry `assistTags`."* I
measured **43** in `npcs/` and was about to correct you — **43 NPCs + 9 companions = 52.** Your number is
right.

---

## §R2.1 — ⛔ Q1 · IT IS NOT A DEFERRAL. IT IS A FIELD-BY-FIELD FALLBACK, AND THE DEFAULT IS THREAT 20.

The doc-comment says *"an authored `opponent.skills[]` overrides the synthesis entirely."* ⛔ **The code does
not.**

```js
const threat = Number(opponent.threat) || 20;
…
if (opponent.skills?.length) {
  return { attributes: opponent.attributes || { practical: attr, … },
    energy: opponent.energy ?? energy, health: opponent.health ?? health,
    soak: opponent.soak ?? soak, soakLayers: opponent.soakLayers ?? soakLayers, skills: opponent.skills, … };
}
```

⚠️ **`skills` defers completely. Everything else is `authored ?? DERIVED-FROM-THREAT`** — and with no
`threat` supplied, **threat is 20.**

➡️ ⛔ **PASS PELL'S SHEET AS `skills[]` ALONE AND SHE ARRIVES WITH A THREAT-20 BODY** — attributes, health,
soak and energy synthesised for a middling raider, wearing a level-27 smith's crafts. ✅ **Exactly the
partial deferral you named, and it is real today.**

### ✅ AND THE FIX IS ALREADY SITTING THERE

`sheetFor` returns **every field that branch reads**: `attributes`, `health`, `maxHealth`, `energy`,
`maxEnergy`, `soak`, `skills`. ➡️ **The bridge is "pass the whole sheet", not "pass its skills".**

⬜ **One line I would add while there:** make the branch refuse a sheet that supplies `skills` and nothing
else, rather than silently filling the gap at threat 20. **A half-passed sheet should be an error, not a
raider.**

---

## §R2.2 — ✅ Q5 · THE SHAPES MATCH. THE MISMATCH YOU FEARED IS NOT THERE.

| | |
|---|---|
| synthesised | `{ function, name, tier, attribute }` |
| ⚑ `battleSkillsFor` | `{ id, function, name, tier, attribute, energyCost }` — **a superset** |

✅ **And `battleSkillsFor` is the converter**: it reads an authored `abilities: [{abilityId, level}]` and
emits `skills[]`. **Pell's 17 crafts become 32 entries in exactly the right shape.**

⚠️ **So `abilities` vs `skills` is not a shape mismatch — it is a MISSING CALL.** The conversion exists and
is test-only, which is the same finding one layer down rather than a new one.

---

## §R2.3 — ⛔ Q7 · THE EIGHTH CLAIM, AND IT INVERTS YOUR BIGGEST RISK

> §3: *"minted — derived from `role` + `firstMet` alone. `derivedLevel` already gives a stranger **15**."*
> §5: *"a stranger derives to 15. Fine for one bandit, possibly wrong for a hundred."*

**Measured:**

| record | derives to |
|---|---|
| bare `{ id, role }` | ⚑ **1** |
| just minted — `met: 1`, `firstMet` today | ⚑ **1** |
| met 40 times across 400 days | **15** |

⛔ **15 IS THE *KNOWN* STAGE, NOT THE MINTED ONE.** And `npcsheet.js` says so in its own comment: *"⚠️ A
STRANGER IS LEVEL 1 AND THAT IS CORRECT — the level is a claim about what the story has shown, not a
courtesy."*

➡️ ⚠️ **YOUR §5 RISK ROW FLIPS.** The danger is not that a hundred bandits are too strong at 15 — it is that
**a hundred freshly minted strangers are all level 1.** ✅ **Which is arguably correct** (the story has shown
nothing about them) **and is a different tuning question entirely**: a mass of nobodies, not a mass of
mid-tier fighters.

⚠️ **Two small ones:** `npcsheet.js` is **395** lines, not 377 — it has grown. And `REGISTRY_CAP = 150` with
the protection rule is ✅ **exactly as you describe it.**

---

## §R2.4 — ✅ Q2 · A VIEW. `sheetFor` WRITES NOTHING.

**Measured: it is a pure function of the record** — no assignment to `entry`, no persistence, no cache.
✅ **So your §3 holds: eviction needs no lifecycle because there is nothing to evict.**

⚠️ **One coupling to know about:** `battleSkillsFor` needs a **catalogue handle** to resolve `abilityId` →
craft. ➡️ **The caller must carry one.** That is the only thing standing between "a sheet is free" and "a
sheet needs context".

---

## §R2.5 — ✅ Q3 · `synthesizeStaticSheet` IS CORRECTLY OUTSIDE

`{ static: true, staticResist, tacticTags: ["unmoving"], skills: [ one "it holds" entry ] }`, called once at
`app.js:13737` for a thing with a `resist` and a `holdTier`.

➡️ ⛔ **It is a door, not a person, and it never acts.** ✅ **It wants nothing from this architecture and
should not be placed in it** — a third producer that models a different KIND of thing is not a third
competing sheet.

---

## §R2.6 — ⬜ Q4 · SUB-LINEAR, AND THE CURVE IS ALREADY IN THE ENGINE

⛔ **Not a sum.** A hundred peasants would out-threat an epic, and the same mistake has a measured cost
already recorded: the naive K× aggregate *"matches on the average and is 614% wrong on the spread."*

✅ **`predictAggregate` is the existing answer — mean scales with K, spread with √K** — and it is what the
folded party already uses.

⬜ **My recommendation:** `threat(unit) = max(member threat) + a √K term over the remainder`. **The strongest
member sets the floor; numbers add sub-linearly above it.** ✅ **Using the same compression the party layer
uses means the two scales agree by construction rather than by tuning.**

---

## §R2.7 — ⛔ Q6 · I WOULD NOT TAKE YOUR FIRST CALLER. IT BUILDS THE DEFECT ON PURPOSE.

> §5: *"mint a sheet on registry entry and do not wire it to combat yet."*

⚠️ **That is a writer with no reader, chosen deliberately.** ⛔ **This session has spent most of its time on
exactly that shape** — `folkAccessible`, `backlashRung`, `holdings`, `sectFlavour`, `local_layouts`,
`npcsheet` itself. **A sheet nobody reads is not safe. It is invisible, and invisible is how all six of those
survived for weeks.**

✅ **THE SAFEST FIRST CALLER IS ONE THAT READS BUT CANNOT HURT: the GM block.**

| | |
|---|---|
| exposure | ⚑ **immediate** — every scene with that person in it |
| blast radius if wrong | ⚠️ **the narrator says something odd.** Nothing resolves differently, no number moves |
| precedent | ✅ `groundDetail` (R28) is this exact shape, built and gated today |
| what it proves | ⛔ **that 395 lines of never-run code survive contact with 112 real records** |

➡️ **Then combat, once it has been wrong in public a few times and been fixed.**

---

## §R2.8 — ⬜ THE ORDER I WOULD BUILD IT IN

| # | step | note |
|---|---|---|
| 1 | `sheetFor` → a GM block for the people in the scene | ✅ reads, cannot hurt |
| 2 | Fix the bridge to pass the WHOLE sheet, and refuse a half-passed one | ⛔ or threat-20 bodies arrive silently |
| 3 | Wire it as the opponent path for a NAMED person | after 1 has been live |
| 4 | Unit aggregation upward; `predictAggregate` collapse downward | ⬜ Q4 |
| 5 | Growth, on the now-live sheet | ⛔ was blocked on this whole question |

✅ **§2's ruling is right and I would build it.** ⚠️ **The two systems really are two directions of one
ladder** — and the thing that makes that true is that a threat number cannot be decomposed into wards and
types, while a roster of people can always be collapsed into a number.
