# SPEC — NPC character sheets

**Author:** Aevi (PO) · **Date:** 2026-09-01 · **Status:** `round_2_requested`
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
