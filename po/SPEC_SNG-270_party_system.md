# SPEC — SNG-270: THE PARTY SYSTEM, and weaving it into the arc war
## Aevi (PO) · 2026-08-03 · Erik: "we really need to get the Party system flowing well. right now it's mostly
## prose, but we have some good bones to work from."

## WHAT IS ACTUALLY THERE (read first — the bones are better than "mostly prose" suggests)
| piece | state |
|---|---|
| `engine/companions.js` — bonds, stages, thresholds, memory, witnessed deeds, codex | **✅ real and live** |
| 9 authored companions with `persona`, `boundaries`, `bondGrants`, `stages`, `substrateAura` | **✅ rich** |
| `growBond` / `noteCompanionWitnessed` — the bond deepens from *what they saw you do* | **✅ and it's good** |
| `partnerAdjacentNpcs` — people who became companions by *proximity*, not recruitment | ✅ |
| **companions in ENCOUNTERS** | **❌ nothing. Zero references in skill_battle, encounters, or resolve.** |
| **`engine/party.js`** | ⚠️ **not what it sounds like** — multiplayer scene-sharing (turns, shared beats, `partyBlockForGM`). Useful, but it is not a party-of-companions system. |
**So the honest diagnosis: companions are a RELATIONSHIP system with one mechanical hook.** That hook is
`companionBonus` — **+5 per companion whose `assistTags` match the action, capped at 10 (13 at bond 3).**
**A companion's entire combat contribution is a flat +5 to your roll.** They cannot act, be targeted, be hurt,
or die.

## ⚠️ THE CORE PROBLEM, STATED PLAINLY
**A companion is currently an ITEM that talks.** Everything expressive about them — persona, boundaries,
memory, the bond that deepens because they *watched you do something* — resolves to a number added to the
player's die roll. **That is why it reads as prose: mechanically, it is prose.**
And it is now actively inconsistent with the world: **legends fight, get wounded, abandon fronts, and die —
while the person standing next to the player cannot be scratched.**

## THE PROPOSAL — three layers, smallest first

### LAYER 1 — COMPANIONS ACT (the minimum that stops them being items)
A companion takes **one action per encounter**, drawn from their authored character rather than chosen by the
player:
- **their `assistTags` already say what they do.** `assistTags: ["mend","steady"]` → they mend or steady.
- **resolution reuses the player's rails** — a real `battleRound` / craft resolution at the companion's own
  competence, not a new model. *(Same argument CCode made for arc contests: a second combat model drifts.)*
- **`boundaries` are HARD.** Oren Vale *"will not be pointed"*; a companion whose boundary the action violates
  **refuses, visibly.** That is the single best thing the authored content already supports and nothing reads.
**This alone converts nine rich characters from +5 into people.**

### LAYER 2 — COMPANIONS CAN BE HURT, AND THAT IS THE POINT
- companions take injury on the same rails as legends (wound → reduced contribution; the death gate stays in
  one place).
- **⚠️ A COMPANION'S DEATH MUST BE POSSIBLE OR THE GUARD QUEST IS THEATRE.** Erik's back-line strike targets
  *"the person who is actually moving the arc."* If the party's healer literally cannot die, the entire third-
  action design has no teeth against players.
- **bond changes what injury MEANS**, which is where the existing system earns its keep: at low bond a wound is
  a setback; at stage 4 it is *the scene*. **`noteCompanionWitnessed` already records what they saw you do —
  the inverse should exist: what you watched happen to them.**

### LAYER 3 — THE PARTY IS AN ARC ACTOR (Erik's weave)
This is the piece that ties everything together, and **it needs almost nothing new**:
- **the party occupies an arc position** — exactly like a legend. Weight from tier + companions + standing.
- **which means the party can be PAIRED OFF, GANGED UP ON, or STRUCK.** All three already exist in worldtick.
- **and it means the party's own attention budget applies: holding two fronts means leaving one.**
**⚠️ AND IT MAKES ERIK'S QUEST WEAVE FALL OUT FOR FREE:**
· *"quest to complete something your side uses in the world arc"* → a structured quest whose completion adds
  **real weight** to an arc position. The reward is not XP; **it is that the number moves.**
· *"slay a beast the other side counts on"* → the bestiary already has `class`, threat and affinities; a
  creature can hold an arc seat exactly as a figure does. **`the_gearfather` holding the Gearlands' position on
  `what_wakes_beneath` needs no new content — only a seat.**
· **and the reverse: an arc the party ignores gets worse, visibly.** The vacancy mechanic already records it.

## WHAT I WOULD DO FIRST, IF IT WERE MY CALL
**Layer 1 only, and stop.** Nine companions acting on their own `assistTags` with their `boundaries` enforced
is a large visible change for a small mechanical one, and **it will immediately tell us whether companions
acting is fun before anyone builds injury or arc-seats on top of it.**
Layer 2 is required before player-facing guard quests ship. Layer 3 is the big one and should wait for Layer 1
to have been *played*.

## OPEN FOR ERIK
1. **Does the player CHOOSE a companion's action, or does the companion?** ⚠️ My strong read: **the companion
   does.** They have personas, wants and boundaries; a companion you puppet is a party member you're playing
   yourself. It also makes `boundaries` matter, which is the best authored content in the file.
2. **Can companions die permanently?** I think yes, and I think it should be **rare and never random** — a
   strike, a guard failure, a boundary they refused to cross. **Never a stray roll in a routine fight.**
3. **How many companions can travel at once?** There is no cap today. The attention-budget logic suggests one
   naturally: **a party that brings everyone is a party that leaves every other front empty.**
