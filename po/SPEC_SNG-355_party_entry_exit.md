# SNG-355 — The GM cannot add or remove a party member. Only a button can.

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"the story had let some of them depart
while still remaining in my party — we need some more structure for party entry and exit."*
**Status:** spec_ready · **Class:** narrative-with-no-op (the fiction moves, the state cannot follow)

---

## §0 — THE ROOT CAUSE, VERIFIED AT ORIGIN

`engine/company.js` exports `recruit()` and `partCompany()`. Both work correctly. **Both are called from
exactly two places — `app.js:11113` and `app.js:11120` — and both are `btn.onclick` handlers behind a
`confirm()` dialog.**

⛔ **THERE IS NO GM OP FOR EITHER.** Grepped the op-apply paths: nothing. So the entity that narrates the
story — the entity that says *"Calvar clasps your arm and turns back toward the March"* — **has no
mechanism to record that it happened.** The company array is player-mutable only.

**This is why Erik's party is wrong.** The story let them go. The state had no way to hear it. They stay
until he personally clicks *Part ways* on each one, for a departure he already played through.

## §0a — Silas's live company, as evidence

```
pell        roles:[ally]  teaches:null  joinedDay:17
calvar      roles:[ally]  teaches:null  joinedDay:18
siol        roles:[ally]  teaches:null  joinedDay:19
veth-ondra  roles:[ally]  teaches:null  joinedDay:19
```

Two defects visible in four lines:

1. ⛔ **No departure field exists.** The record holds `npcId · roles · teaches · liaisonFor · joinedDay`.
   There is no `leftDay`, no `status`, no reason. **Departure is deletion** — so a member who traveled
   with you for twenty days and left is not *remembered as having left*, they are erased. `partCompany`
   is `filter(m => m.npcId !== npcId)`. The history goes with them.
2. ⛔ **`veth-ondra` has `teaches: null` and Erik calls her "teacher Veth."** `recruit()` reads
   `cat.teaches` from `CONTENT.npcs[id]` — the **authored** catalog. Veth is a generated NPC, so the
   lookup returns `{}` and the teacher role is silently dropped. `character.teachers` is `{}`.
   ⚠️ **Every generated NPC recruited as a teacher loses the role at the moment of joining.** The
   curriculum machinery (`curriculumFor`, `teachersForGM`, `teacherOfferReady`) is real and reaches
   nothing, because nothing ever populated the field it reads.

---

## §1 — WHAT TO BUILD

### §1a — GM ops for entry and exit (the load-bearing half)

Two ops the GM can emit when the fiction does it: **join** and **depart**, the latter carrying a reason.
⚠️ **The GM narrates departures constantly and always has** — this ticket is not adding a story
capability, it is letting the state hear one that is already being spoken.

⚠️ **Guardrail: entry needs consent, exit does not.** Someone JOINING the party is a commitment the
player should assent to — keep the confirm on the join path even when the GM proposes it. Someone
LEAVING is the story's to decide; a departure that requires the player's permission is not a departure.
**Asymmetric on purpose.**

### §1b — Departure is a status, not a deletion

Add `leftDay` and `departedWhy` and keep the record. A former member becomes history rather than absence.
This is what makes *"the road may cross again"* — already in the existing copy — a true statement the
system can act on: rejoining someone reads their old record instead of minting a stranger.

⚠️ **`companyRoster()` must then filter on active membership**, or every past ally comes back as a
current one. That is the one real regression risk in this ticket.

### §1c — Repair the teacher field for generated NPCs

`recruit()` should fall back to the character's own `npcRegistry` when the authored catalog has no entry,
since that is where generated NPCs live. **And Erik's live save needs a backfill** — Veth's teacher role
was lost at recruit-time and will not reappear on its own.

### §1d — Surface it

The company roster shows current members, their roles, and who has departed. ⚠️ **This composes with
SNG-353** — same panel treatment, and the two tickets should probably ship together, since a companion
detail panel that cannot say *"traveled with you, days 17–34"* is missing the interesting half.

---

## §2 — ⛔ THE LARGER FINDING: LATE-GAME HOLDINGS HAVE NO STATE MODEL

Erik: *"He has 2 warden stations and a pregnant wife and a smithy… you have fortresses, party members,
businesses, etc at mid to late game."*

**Checked Silas's save for all of it. `locationState: {}` — empty. `teachers: {}` — empty.** There is no
holdings structure, no business structure, no family/household structure anywhere in the schema. The two
warden stations, the smithy, and the pregnant wife exist **entirely in narrative** — chronicle text and
the GM's context — with no mechanical representation at all.

⚠️ **This directly blocks the sub-attribute ladder's late-game tier.** SNG-354 §4 proposes late-game
grants around *standing, company capacity, holdings, world-arc leverage* — **and three of those four have
nothing to attach to.** A ladder rank that reads "+1 holding capacity" is decorative if holdings are not
state.

**PO POSITION: this is a bigger ticket than party entry/exit and it should NOT be folded in here.** But
the ladder cannot be authored past its mid-game tier until it exists. **Sequencing consequence: author
the ladder's early and mid tiers now, and hold the late tier until holdings have a model.** Naming the
dependency rather than authoring against a void.

---

## §3 — OUT OF SCOPE

- The holdings/business/household model (§2) — named as a blocking dependency, specced separately.
- Companion (`companionBonds`) entry/exit — different system; `part ways` there already works.
