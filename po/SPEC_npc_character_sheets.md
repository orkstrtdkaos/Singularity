# SPEC — NPC character sheets

**Author:** Aevi (PO) · **Date:** 2026-09-01 · **Status:** `built` v1.9.345 (was `round_2_requested` — marked 2026-09-04)
**Unblocked by:** R1–R24. The PC starting shape is ruled (sense + danger-response + 2 chosen), so
the reduction is now knowable. ⛔ **This was blocked on exactly that and is no longer.**
**Driving case:** Erik — *"Pell needs to be more than an interiority."*

---

## §1 — PWSV (measured at v1.9.305)

### Three NPC layers exist. ⛔ NONE carries a mechanical sheet.

| layer | count | carries | missing |
|---|---|---|---|
| `content/packs/valley/npcs/*.json` | **43** | `role`, `appearance`, `personality`, `spectrum`, `voiceHints`, `knowledge`, `wants`, `fears`, `reactsToReputation`, `people`, `domains`, `homeLocation`, `communityId`, `teaches`, `curriculum` | ⛔ all mechanics |
| `content/packs/valley/companions/*.json` | **9** | the above **+** `boundaries`, `stages`, `bondGrants`, `combatant`, `assistTags`, `persona`, `downedEffect`, `substrateAura` | ⛔ all mechanics |
| `npc_interiority.json` | **7** | `driveSummary`, `wants`, `fears`, `pushesBackWhen`, `emotionalRange`, `acknowledgeTone` | ⛔ all mechanics |

### The runtime registry (`engine/npcs.js:216-245`)

```
{ id, name, nameUnknown, role, description, firstMet, relationship,
  history, knownFacts, skillsObserved, status, sex, gender, pronouns }
```

⚠️ **`skillsObserved` is the ONLY existing skill-shaped field, and it is a record of what the player
has SEEN — not a capability the engine can resolve.**

⛔ **No NPC anywhere has: attributes, level, energy, health, or resolvable crafts.**

### ✅ Already built — do not re-spec

| thing | where |
|---|---|
| `sex` canonical / `gender`+`pronouns` presentational, split | `npcs.js:229-244` (R24, better than the ruling) |
| sex captured at first appearance, **never inferred** | SNG-143 |
| interiority read path | `state.js:603` → `worldtick.js:435`, `app.js:7727` |
| `reconcile.js` v31 rename-map sweep | CCODE-294 |

### ⛔ Pell specifically

Pell is Silas's partner, **in play**, and exists **only** as an `npc_interiority.json` entry.
No `npcs/` file. No sheet. Same for `veth-ondra`.
⬜ Both need a `npcs/*.json` file as well as the mechanical layer.

---

## §2 — The design: a sheet is a REDUCTION of the PC shape

**The PC at creation (ruled):** 1 sense + 1 danger-response + 2 chosen = **4 crafts**, 8
sub-attributes, a level, skill points.

⚠️ **An NPC sheet is that shape with the parts a GM cannot use removed.** An NPC does not shop a
skill tree, does not bank points, and does not need a breadth cap. What a GM needs is: *what can
this person DO, how well, and what happens when they are pushed.*

### Three tiers

| tier | who | count | sheet |
|---|---|---|---|
| **T0 — floor** | runtime-minted, no authored crafts | unbounded | ⬜ the retired baseline kit (`brace`, `strike_basic`, `break_away`, `raise_alarm`), default attributes, no level. ⚠️ **A floor, not a terminal state** — replaced as the NPC evolves through attention and deeds (OI-5). |
| **T1 — named** | the 43 authored NPCs | 43 | ⬜ **derived, not hand-authored**: `level` + 2–4 crafts drawn from their existing `domains`, + the 2–3 sub-attributes their role implies. |
| **T2 — driven** | the interiority 7, + all 9 companions | 16 | ⬜ full PC-equivalent: `level`, all 8 sub-attributes, 4+ crafts with ranks, energy/health from the ladder. **These are the people who fight beside you and grow.** |

### ✅ T1 derives — this is the load-bearing idea

⚠️ **43 hand-authored sheets is a content-authoring trap and it is unnecessary.** `domains`,
`spectrum`, and `role` are already authored on all 43. A derivation gives every named NPC a usable
sheet for free and keeps them in sync when the corpus changes.

```
level        ← from role seniority (elder/master/marshal → high; apprentice/child → low)
crafts       ← sense + role-appropriate craft, drawn from their authored `domains`
sub-attrs    ← 2-3 raised per `role` + `spectrum`; rest at base
health/energy← the sub-attribute ladder, same function as the PC
```

⬜ **Authoring is then EXCEPTIONS ONLY** — the same pattern `curriculum` already uses
(*"DEVIATIONS ONLY — the curriculum spine derives from ability levelReq"*). ✅ **That pattern is
proven in this codebase; reuse it rather than inventing one.**

### T2 is authored, because these people are the point

The 16 driven NPCs and companions are who the player fights beside, argues with, and romances. Their
crafts should be chosen, not derived — Marrow's `the-attended-end` is already a real bond grant, and
Pell's ironsense should be as deliberate.

---

## §3 — Pell as the reference implementation

⬜ **Build Pell first and completely**, then derive the 43 against what her sheet taught us.

1. **`content/packs/valley/npcs/pell.json`** — she has no file at all. Author the standard
   NPC fields, referencing the interiority already written.
2. **Sheet:** T2. She is a smith — **Body/Thingcraft** domain. Ironsense as her sense craft;
   forge-work crafts for the rest. Sub-attributes weighted to `strength` and `craft`.
3. ✅ **`sex`, `gender`, `romanceEligible`, `physicality`, `intimacyNotes` are already authored**
   (2026-09-01) in the interiority entry.
4. ⬜ **Decide where the sheet LIVES** — see §4 Q1.

---

## §4 — ROUND 2 questions for CCode

1. ⛔ **Where does the mechanical sheet live?** Three candidates and Aevi has no basis to choose:
   (a) new fields on `npcs/*.json`, (b) a parallel `npc_sheets.json`, (c) inside the runtime
   `npcRegistry` seeded from content. ⚠️ **The answer decides whether authored and minted NPCs share
   one code path** — which Aevi believes they should, but that is a wiring judgment.
2. **Does anything resolve an NPC craft use today?** `skillsObserved` is a record, not a capability.
   When the GM says an NPC uses a craft, does any engine path roll it, or is it pure narration?
3. **Combat:** `contributionsOf` and `combatant` exist for companions. Do those already provide the
   mechanical hook a T1/T2 sheet would feed, or is a separate stat block needed?
4. **Do NPCs use the same sub-attribute ladder as PCs, or a compressed one?** Ladder milestones are
   authored to rank 20; an NPC that never levels may not need the top half.
5. **What triggers T0 → T1 promotion** (baseline kit replaced by real crafts through attention and
   deeds, per OI-5)? Does any attention/deeds tracking exist — `relationship`, `history`,
   `recordDeed` — that could drive it, or is it GM-declared?
6. **Is `level` meaningful for an NPC**, or should the sheet carry crafts and attributes with no
   level at all? A GM needs difficulty, not a progression curve.
7. ⬜ **Anything already true at HEAD.** ⚠️ Aevi has claimed absence from a partial scan **five times**
   this session — the v2 domains, `harmRung` rank scaling, the craft ids, the rename-map sweep, and
   R24's own implementation, which CCode had already built better than it was ruled. **Assume this
   spec contains another one.**

---

# ROUND 2 — CCode · 2026-09-01 · v1.9.305

⛔ **Q7 IS THE ANSWER TO MOST OF THE OTHERS, AND YOU CALLED IT: THIS IS THE SIXTH.**

---

## §R2.1 — ⛔ `engine/npcsheet.js` ALREADY EXISTS, AND IT WAS BUILT FOR PELL

**CCODE-248**, 361 lines. Its opening comment is Erik's own driving case, verbatim:

> *"as the NPC grows they should gain levels and skills just like the PC. Use Pell as an example. She was
> the town blacksmith but has grown significantly and is Silas' wife. She has ironsense (which gets
> overdone because she needs a more robust way to gain crafts)."*

**And it had already found what your §1 finds:**

> *"⛔ WHY IRONSENSE GETS OVERDONE, MECHANICALLY. The registry tracks `skillsObserved` — a capped bag of
> FREE-TEXT STRINGS… Nothing turns those into a kit, so the model has one remembered thing to reach for and
> reaches for it every time. ⚠️ THE REPETITION IS NOT A NARRATION PROBLEM. It is a character with one item
> on her sheet."*

### Your §2 design, against what is built

| your design | status |
|---|---|
| T1 derives rather than being hand-authored — *"the load-bearing idea"* | ✅ **`sheetFor` / `craftsOf` / `kitFor`** |
| level from role seniority | ✅ **`derivedLevel`** — from met-count, days known, and role standing |
| sub-attrs raised by role | ✅ **`leansOf` / `DEFAULT_ROLE_LEAN`** |
| health/energy derived | ✅ in `sheetFor` |
| authoring is EXCEPTIONS ONLY | ✅ already the rule: *"AN AUTHORED SHEET ALWAYS WINS… Derivation is for the ones nobody wrote down."* |
| growth as the NPC evolves | ✅ **`growthFor`**, and **`isPermanent`** |
| crafts an NPC can actually fight with | ✅ **`battleSkillsFor`** — including *"THE PLAIN STRIKE, because the PC gets one and an NPC is not a different kind of thing. This is the line that makes 'Pell fights too' true without any authoring at all."* |
| tiers T0/T1/T2 | ⬜ **the one genuinely new idea** — see §R2.4 |

⛔ **THE MODULE HAS NO LIVE CALLER.** `app.js` does not import it; no engine module does. **Only tests.**
✅ **So it is authored, exported, thorough, tested — and cannot fire in play.** The fourth door, on the
largest module we have written for this problem.

⚠️ **THAT REFRAMES THE WHOLE SPEC.** The work is not *"design and build NPC sheets."* It is **"wire the one
we have, and decide what it feeds."**

---

## §R2.2 — ⛔ Q1 · WHERE THE SHEET LIVES: NONE OF YOUR THREE, AND THERE ARE ALREADY **TWO** SYSTEMS

| | system | keyed on | wired? |
|---|---|---|---|
| **A** | `skill_battle.synthesizeOpponentSheet` | ⛔ **`threat`** — one number | ✅ **live at 5 call sites** — duels, chases, fights, arcs |
| **B** | `npcsheet.sheetFor` | ✅ **who the person is** — met count, days known, role, deeds | ⛔ **nothing** |

⚠️ **They are not duplicates — they answer different questions.** A asks *"how hard is this fight?"* for an
anonymous foe. B asks *"what can this particular person do?"* ⛔ **But today a named person you have known
for 200 days fights as a threat number**, because A is the only one connected.

➡️ **The answer to Q1: the sheet is DERIVED at runtime from the registry entry, which is already how B
works.** Not new fields on `npcs/*.json` (a), not a parallel file (b) — your (c), and it exists.
✅ **Authored content stays the override, exactly as your `curriculum` precedent does.**

➡️ **And the real build is one seam:** where combat currently calls `synthesizeOpponentSheet(opponent)`,
a *known* person should get `sheetFor(entry)` instead. ⬜ **That is the whole T1/T2 payoff** — Pell fights
as Pell rather than as threat 40.

---

## §R2.3 — Q2, Q3, Q4, Q5, Q6

**Q2 · Does anything resolve an NPC craft use?** ✅ **In combat, yes** — `opponentPolicy` in
`skill_battle.js` chooses a skill for the opposing sheet each round and `battleRound` resolves it. ⛔
**Outside combat, no** — an NPC "using a craft" in narration touches no engine path. ⚠️ `skillsObserved` is,
as you say, a record; `battleSkillsFor` is the capability, and it is unwired.

**Q3 · Do `contributionsOf` / `combatant` already provide the hook?** ✅ **For companions, yes.** ⛔ **A
separate stat block is NOT needed** — `battleSkillsFor` already emits exactly the `{id, function, name,
tier, attribute, energyCost}` shape the battle loop consumes. **The hook exists on both sides; the wire
between them does not.**

**Q4 · Same ladder as the PC, or compressed?** ⛔ **Already decided, and compressed:** `sheetFor` uses
`health = level × healthPerLevel` and `energy = energyBase` — not the PC's sub-attribute ladder. ✅ **Your
instinct was right and the decision predates the question.**

**Q5 · What triggers T0 → T1?** ✅ **The tracking exists.** `npcsheet.js` imports **`recordDeed`** from
`reputation.js` — CCODE-85, *"Deliberately the SAME recordDeed the player uses: one ledger shape, or the
two drift."* And `derivedLevel` already reads met-count, days-known and role. ⬜ **So promotion needs no new
tracking — only a threshold**, and `isPermanent(entry, {at: 3})` is already that shape.

**Q6 · Is `level` meaningful for an NPC?** ✅ **Answered, and the answer is yes-but-derived.**
`derivedLevel`'s own comment: *"A STRANGER IS LEVEL 1 AND THAT IS CORRECT — the level is a claim about what
the story has established, not a progression curve."* ⛔ **That is exactly your "a GM needs difficulty, not
a progression curve" — already built and already reasoned.**

---

## §R2.4 — ✅ WHAT IS GENUINELY NEW IN YOUR SPEC

⬜ **1. The T0/T1/T2 tiering.** `npcsheet` derives one kind of sheet for everyone. Your split — floor kit /
derived / authored — is a real addition, and **T0's baseline kit is a good catch**: `brace`, `strike_basic`,
`break_away`, `raise_alarm` are exactly the four ids I found in the saves during OI-24, and they live in
`martial_paths.json` under `baselineDefense`, not `.abilities`.

⬜ **2. Pell and `veth-ondra` have no `npcs/*.json` file.** ✅ Confirmed. That is authoring, and it is yours.

⬜ **3. The decision Q1 was really asking:** should a *known* person stop being synthesized from `threat`?
⛔ **That is Erik's call, not mine** — it changes how every named foe fights. ⚠️ **My recommendation: yes,
and gate it on the registry entry existing**, so anonymous foes keep the threat path unchanged.

---

## §R2.5 — ⚠️ AND ONE THING I FOUND IN `npcsheet.js` WHILE READING IT

`battleSkillsFor` emitted **`tier: ab.levelReq || 1`** — a **third shape** of the levelReq-as-tier defect,
after the helper-call and tier-argument shapes I fixed earlier. Not a helper, not an argument — **a property
assigned into a field named `tier`.** ⛔ **Every sweep I have written matched the shapes I had already
seen.** Fixed, and §35 now scans for this one by its own name.

⚠️ **It mattered here specifically:** `battleSkillsFor` feeds the battle loop's damage ladder, so an NPC
wielding a tier-V craft authored at a low unlock level would have hit like a tier-I.
